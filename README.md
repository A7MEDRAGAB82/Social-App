# 🌐 Social App — Backend API

A production-ready **Node.js + TypeScript** backend for a social media platform, featuring a dual **REST API & GraphQL** interface, real-time communication via **Socket.IO**, cloud storage with **AWS S3**, caching with **Redis**, and authentication supporting both **JWT** and **Google OAuth**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js v5 |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| API | REST + GraphQL (Apollo / GraphQL Yoga) |
| Real-time | Socket.IO |
| Storage | AWS S3 + Presigned URLs |
| Auth | JWT (Access + Refresh) + Google OAuth |
| Validation | Zod |
| Email | Nodemailer |
| Password | Bcrypt |

---

## 📁 Project Structure

```
src/
├── app.controller.ts       # Express app bootstrap, routes & Socket.IO setup
├── main.ts                 # Entry point
├── config/                 # Environment configuration service
├── database/               # MongoDB connection
├── middleware/             # Auth, validation, error middlewares
├── common/
│   ├── exceptions/         # Custom HTTP exceptions
│   ├── services/           # Redis, S3 services
│   ├── utils/              # Multer, helpers
│   ├── enums/              # Shared enums
│   └── interfaces/         # Shared TypeScript interfaces
├── modules/
│   ├── auth/               # Authentication module (REST)
│   ├── user/               # User profile module (REST)
│   ├── posts/              # Posts module (REST)
│   └── messages/           # Messages module
└── graphql/
    ├── typeDefs/           # GraphQL type definitions
    ├── resolvers/          # GraphQL resolvers
    ├── context.ts          # GraphQL context (auth)
    └── index.ts            # GraphQL server initialization
```

---

## ✨ Features

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/signup` | Register with email & password | ❌ |
| `POST` | `/auth/login` | Login and receive JWT tokens | ❌ |
| `GET` | `/auth/verify-email` | Verify email with OTP code | ✅ |
| `POST` | `/auth/signup-mail` | Register / Login via Google OAuth | ❌ |
| `POST` | `/auth/logout` | Invalidate access token (Redis blacklist) | ✅ |
| `POST` | `/auth/forget-password` | Send password reset email | ❌ |
| `POST` | `/auth/reset-password` | Reset password with token | ❌ |
| `POST` | `/auth/update-password` | Update password while logged in | ✅ |

### 👤 User Profile (`/user`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/user/profile` | Get current user profile | ✅ |
| `PATCH` | `/user/profile` | Update profile (with optional file upload) | ✅ |
| `POST` | `/user/profile/presign` | Get S3 presigned URL for profile picture | ✅ |
| `PATCH` | `/user/profile/confirm` | Confirm profile picture upload from S3 | ✅ |
| `PATCH` | `/user/profile/cover` | Upload cover picture directly | ✅ |
| `POST` | `/user/profile/cover/presign` | Get S3 presigned URL for cover picture | ✅ |
| `PATCH` | `/user/profile/cover/confirm` | Confirm cover picture upload from S3 | ✅ |

### 📝 Posts (`/posts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/posts` | Get all posts (paginated) | ❌ |
| `GET` | `/posts/:id` | Get a single post by ID | ❌ |
| `POST` | `/posts` | Create a new post | ✅ |
| `PUT` | `/posts/:id` | Update a post | ✅ |
| `DELETE` | `/posts/:id` | Soft delete a post | ✅ |

### 🖼️ File Serving (`/uploads`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/uploads/*path` | Stream a file from S3 by key or `?key=` query |

### 🔷 GraphQL API (`/graphql`)

#### Queries
```graphql
getUser(id: ID!): User
getCurrentUser: User
getUserByEmail(email: String!): User
getPost(id: ID!): Post
getAllPosts(limit: Int, offset: Int): [Post]!
getUserPosts(userId: ID!, limit: Int, offset: Int): [Post]!
```

#### Mutations
```graphql
updateUserProfile(firstName, lastName, phoneNumber, gender): User
uploadProfilePicture(key: String!): User
uploadCoverPicture(key: String!): User
createPost(content: String!): Post
updatePost(id: ID!, content: String!): Post
deletePost(id: ID!): Boolean
```

### ⚡ Real-time (Socket.IO)
- WebSocket server runs on the same HTTP port.
- Tracks connected socket IDs on connection events.
- Feature branch: `feature/socket-integration` (in progress).

---

## ⚙️ Environment Variables

Create a `.env.development` file in the root directory:

```env
PORT=3000
MOOD=dev

# Database
DATABASE_URI=mongodb://localhost:27017/Social

# JWT
SALT=10
JWT_SECRET_KEY=your_jwt_secret_key
JWT_REFRESH_SECRET_KEY=your_jwt_refresh_secret_key
ENCRYPTION_KEY=your_encryption_key

# Email (Nodemailer)
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password

# URLs
BASE_URL=http://localhost:3000

# Redis
REDIS_URI=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Uploads
UPLOADS_DIR=uploads
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** >= 18
- **MongoDB** running locally or a MongoDB Atlas URI
- **Redis** running locally (`redis://localhost:6379`)
- **AWS S3** bucket configured

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/A7MEDRAGAB82/Social-App.git
cd Social-App

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.development .env.development.local
# Edit .env.development with your actual values

# 4. Build the TypeScript project
npm run build

# 5. Start in development mode (with hot reload)
npm run start:dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:dev` | Watch mode — compiles + restarts on change |
| `npm run start:prod` | Run the compiled production build |

---

## 🌿 Git Branches

| Branch | Description |
|---|---|
| `main` | Stable production branch |
| `dev` | Main development branch |
| `feature/socket-integration` | Real-time Socket.IO integration (in progress) |
| `feat/graphql` | GraphQL API alongside REST endpoints |
| `feature/posts-module` | Posts CRUD with soft delete |
| `feature/user-profile` | S3 presigned uploads for profile images |

---

## 🔒 Security

- **JWT Blacklisting**: Logged-out tokens are stored in Redis and rejected on subsequent requests.
- **Password Hashing**: Bcrypt with configurable salt rounds.
- **Validation**: All request inputs are validated with Zod schemas before reaching business logic.
- **Google OAuth**: Verified via `google-auth-library` ID token verification.
- **S3 Presigned URLs**: Files are uploaded directly from the client to S3 — the server never handles the binary upload for large files.

---

## 📄 License

This project is licensed under the **ISC License**.

---

> Built with ❤️ by [Ahmed Ragab](https://github.com/A7MEDRAGAB82)
