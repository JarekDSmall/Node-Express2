# Bugs Encountered and Their Fixes

## Bug #1: Login Route Doesn't Await User.authenticate

- **Description:** The login route does not use the `await` keyword when calling the `User.authenticate` method, which could lead to unexpected behavior.
- **Fix:** Add the `await` keyword before `User.authenticate` to ensure the function resolves before proceeding.

## Bug #2: Listing Route Should Not Return All Fields

- **Description:** The route responsible for listing users returns all fields, including sensitive ones. This poses a security risk.
- **Fix:** Modify the SQL query or the return statement to exclude sensitive fields like passwords.

## Bug #3: Users Should Be Able to Patch Themselves

- **Description:** The application does not allow users to update their own information, which limits user functionality.
- **Fix:** Implement a route that allows users to update their own information based on their JWT token.

## Bug #4: Users Should Not Be Able to Patch Username/Admin/Other Fields

- **Description:** The application allows users to update fields that they shouldn't have access to, such as the username and admin status. This poses a security risk.
- **Fix:** Add validation checks to ensure that users cannot update restricted fields.

## Bug #5: Deletion Always Reports Success

- **Description:** Regardless of whether a user is successfully deleted or not, the application always reports a success message. This can be misleading.
- **Fix:** Implement a check to see if the user was actually deleted and return an appropriate message based on the result.

## Bug #6: Auth function in middleware decode JWT, not verifies it

- **Description:** The authentication middleware decodes the JWT token but does not verify its authenticity. This poses a security risk.
- **Fix:** Use the `verify` method from the JWT library instead of `decode` to ensure the token's authenticity.

