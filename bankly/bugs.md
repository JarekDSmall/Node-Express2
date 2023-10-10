Bug #1: Listing Route Should Not Return All Fields
Issue: The listing route (GET /users) returns all fields for users, but it should only return basic information.
Solution: Modify the route to return only basic user information (e.g., username, first_name, last_name) instead of all fields. This can be achieved by selecting the desired fields from the database query result.
Bug #2: Users Should Be Able to Patch Themselves
Issue: Users cannot patch themselves because the conditional check in the route handler is not allowing it.
Solution: Update the conditional check in the PATCH /users/[username] route handler to allow users to patch themselves. You can achieve this by modifying the logic that checks if the current user is the same as the target user (req.curr_username !== req.params.username).
Bug #3: Users Should Not Be Able to Patch Username/Admin/Other Fields
Issue: Users can patch fields that they should not be allowed to update, such as username and admin.
Solution: Modify the route handler (PATCH /users/[username]) to check if the fields being updated are in the list of allowed fields (e.g., ALLOWED_FIELDS). If the fields are not in the allowed list, raise an error and prevent the update.
Bug #4: Deletion Always Reports Success
Issue: The route for deleting a user (DELETE /users/[username]) always reports success even if the user doesn't exist.
Solution: Update the route handler to first check if the user exists before attempting to delete them. If the user does not exist, return a 404 error response with an appropriate message.
Bug #5: Token Verification in authUser Middleware
Issue: The authUser middleware logs "Token: undefined" even when a valid token is provided.
Solution: Verify that the token is being passed correctly in the request. Ensure that the token is sent in either the request body or query parameters as expected. Debug the token extraction logic to ensure it correctly retrieves the token from the request.
Bug #6: Token Expiration
Issue: Tokens may expire, which can lead to authentication failures.
Solution: Ensure that tokens generated for users have an appropriate expiration time. You can set a reasonable expiration time for tokens during token generation to prevent them from expiring too quickly.