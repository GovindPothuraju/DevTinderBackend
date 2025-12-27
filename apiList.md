-- get all apis

-- 🔐 AUTHENTICATION ROUTER
- POST /auth/signup      → Register new user
- POST /auth/login       → Login user (JWT / session)
- POST /auth/logout      → Logout user (clear token / session)


-- PROFILE ROUTER
- GET    /profile           → View own profile
- PATCH  /profile           → Edit profile details
- PATCH  /profile/password  → Change password

-- connection request router
- POST   /requests/:userId/interested   → Send interest || → I sent a request to Ravi
- POST   /requests/:userId/ignore       → Ignore user   || → I ignored Ravi

- PATCH  /requests/:requestId/accept    → Accept request || → I accepted Ravi’s request
- PATCH  /requests/:requestId/reject    → Reject request || → I rejected Ravi’s request

-- USER ROUTER
- GET /users/connections   → My matches
- GET /users/requests     → Incoming requests
- GET /users/feed         → Users to swipe

