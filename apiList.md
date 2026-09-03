# DevTinder API Documentation

## 🔐 Authentication Router
- `POST /signup` → Register a new user
- `POST /login` → Login user (sets HTTP-only JWT cookie)
- `POST /logout` → Logout user (clears cookie)

## 👤 Profile Router
- `GET /profile/view` → View logged-in user profile
- `PATCH /profile/edit` → Edit user profile fields
- `PATCH /profile/password` → Change account password

## 🤝 Connection Request Router
- `POST /request/send/:status/:userId` → Send connection request (`interested` | `ignored`)
- `POST /request/review/:status/:requestId` → Review incoming request (`accepted` | `rejected`)

## 👥 User Router
- `GET /user/connections` → Get list of accepted matches / connections
- `GET /user/requests/received` → Get list of received pending requests
- `GET /feed` → Get feed of other users to swipe on (with pagination `page`, `limit`)

## 💳 Payment & Premium Membership Router
- `POST /payment/create` → Create Razorpay order for membership (`silver` | `gold`)
- `POST /payment/webhook` → Razorpay webhook callback for payment capture & user upgrade
- `GET /premium/verify` → Check user's premium status and membership tier

## 💬 Real-Time Chat & Socket.IO
- `GET /chat/:targetUserId` → Retrieve or initialize chat message history with a matched user

### ⚡ Socket.IO Events
- **Client to Server**:
  - `joinChat` → `{ firstName, userId, targetUserId }` (Joins SHA256 hashed private room)
  - `sendMessage` → `{ firstName, lastName, userId, targetUserId, text }` (Persists message to DB and broadcasts)
- **Server to Client**:
  - `messageReceived` → `{ firstName, lastName, senderId, text, createdAt }`
  - `chatError` → `{ message }`
