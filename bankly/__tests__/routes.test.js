process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app")
const db = require("../db");
const bcrypt = require("bcrypt");
const createToken = require("../helpers/createToken");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Tokens for our sample users
const tokens = {};

describe("Test Suite", function () {
  // Rest of your test suite code...

  beforeAll(async function () {
    async function _pwd(password) {
      return await bcrypt.hash(password, 1);
    }

    let sampleUsers = [
      ["u1", "fn1", "ln1", "email1", "phone1", await _pwd("pwd1"), false],
      ["u2", "fn2", "ln2", "email2", "phone2", await _pwd("pwd2"), false],
      ["u3", "fn3", "ln3", "email3", "phone3", await _pwd("pwd3"), true],
    ];

    for (let user of sampleUsers) {
      await db.query(`INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7)`, user);
      tokens[user[0]] = createToken(user[0], user[6]);
    }
  }, 20000);

  afterAll(async function () {
    await db.query("DELETE FROM users");
  });

  describe("POST /auth/register", function() {
    test("should allow a user to register in", async function() {
      const response = await request(app)
        .post("/auth/register")
        .send({
          username: "new_user",
          password: "new_password",
          first_name: "new_first",
          last_name: "new_last",
          email: "new@newuser.com",
          phone: "1233211221"
        });
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ token: expect.any(String) });

      let { username, admin } = jwt.verify(response.body.token, SECRET_KEY);
      expect(username).toBe("new_user");
      expect(admin).toBe(false);
    }, 20000);

    test("should not allow a user to register with an existing username", async function() {
      const response = await request(app)
        .post("/auth/register")
        .send({
          username: "u1",
          password: "pwd1",
          first_name: "new_first",
          last_name: "new_last",
          email: "new@newuser.com",
          phone: "1233211221"
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: 400,
        message: `There already exists a user with username 'u1'`
      });
    }, 20000);
  });

  describe("POST /auth/login", function() {
    test("should allow a correct username/password to log in", async function() {
      const response = await request(app)
        .post("/auth/login")
        .send({
          username: "u1",
          password: "pwd1"
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ token: expect.any(String) });

      let { username, admin } = jwt.verify(response.body.token, SECRET_KEY);
      expect(username).toBe("u1");
      expect(admin).toBe(false);
    }, 20000);
  });

  describe("GET /users", function() {
    test("should deny access if no token provided", async function() {
      const response = await request(app).get("/users");
      expect(response.statusCode).toBe(401);
    }, 20000);

    test("should list all users", async function() {
      const response = await request(app)
        .get("/users")
        .send({ _token: tokens.u1 });
      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBe(3);
    }, 20000);
  });

  // Rest of your test cases...
describe("PATCH /users/[username]", function() {
  test("should deny access if no token provided", async function() {
    const response = await request(app).patch("/users/u1");
    expect(response.statusCode).toBe(401);
  }, 20000);

  test("should deny access if not admin/right user", async function() {
    const response = await request(app)
      .patch("/users/u1")
      .send({ _token: tokens.u2 }); // wrong user!
    expect(response.statusCode).toBe(401);
  }, 20000);

  test("should patch data if admin", async function() {
    const response = await request(app)
      .patch("/users/u1")
      .send({ _token: tokens.u3, first_name: "new-fn1" }); // u3 is admin
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      username: "u1",
      first_name: "new-fn1",
      last_name: "ln1",
      email: "email1",
      phone: "phone1",
      admin: false,
      password: expect.any(String)
    });
  }, 20000);

  test("should disallowing patching not-allowed-fields", async function() {
    const response = await request(app)
      .patch("/users/u1")
      .send({ _token: tokens.u1, admin: true });
    expect(response.statusCode).toBe(401);
  }, 20000);

  test("should return 404 if cannot find", async function() {
    const response = await request(app)
      .patch("/users/not-a-user")
      .send({ _token: tokens.u3, first_name: "new-fn" }); // u3 is admin
    expect(response.statusCode).toBe(404);
  }, 20000);
});

describe("DELETE /users/[username]", function() {
  test("should deny access if no token provided", async function() {
    const response = await request(app).delete("/users/u1");
    expect(response.statusCode).toBe(401);
  }, 20000);

  test("should deny access if not admin", async function() {
    const response = await request(app)
      .delete("/users/u1")
      .send({ _token: tokens.u1 });
    expect(response.statusCode).toBe(401);
  }, 20000);

  test("should allow if admin", async function() {
    const response = await request(app)
      .delete("/users/u1")
      .send({ _token: tokens.u3 }); // u3 is admin
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "deleted" });
  }, 20000);
});

describe("Middleware authenticateUser", function() {
  test("should set req.user if valid token provided", async function() {
    const response = await request(app)
      .get("/users/u1")
      .send({ _token: tokens.u1 });
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      username: "u1",
      first_name: "fn1",
      last_name: "ln1",
      email: "email1",
      phone: "phone1"
    });
  }, 20000);

  test("should not set req.user if invalid token provided", async function() {
    const response = await request(app)
      .get("/users/u1")
      .send({ _token: "invalidToken" });
    expect(response.statusCode).toBe(401);
  }, 20000);
});

describe("Middleware ensureLoggedIn", function() {
  test("should allow access if user is logged in", async function() {
    const response = await request(app)
      .get("/users")
      .send({ _token: tokens.u1 });
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(3);
  }, 20000);

  test("should deny access if user is not logged in", async function() {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(401);
  }, 20000);
});

});
