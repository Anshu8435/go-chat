# 🚀 NexusChat (GoChat) — Real-Time MERN Messaging Platform

A full-stack, real-time messaging application built with the **MERN** stack (MongoDB, Express, React, Node.js) and **Socket.IO**. Designed with a modern, glassmorphic Aurora dark theme, end-to-end user authentication, instant email OTP verification, online presence tracking, responsive UI, profile personalization with bio/status, and encrypted communications.

---

## ✨ Features

### 🔐 Authentication & Security
- **Email & Password Authentication**: Secure password hashing using `bcrypt` (10 rounds).
- **Email OTP Login**: Passwordless one-time password (OTP) delivery directly to registered email addresses via Nodemailer.
- **Forgot Password with OTP Reset**: Reset password securely via email verification code with countdown cooldown.
- **JWT Authentication & Session Management**: Dual storage synchronization (`localStorage` + `sessionStorage`) with Bearer token authorization headers, HTTP-only cookie support, and automatic 401 session expiry handling.

### 💬 Real-Time Messaging & Presence
- **Socket.IO Real-Time Sync**: Instant two-way message delivery with zero latency.
- **Live Online Presence**: Real-time indicator displaying which contacts are currently online or offline.
- **Chat History**: Full conversation history persisted in MongoDB with automatic timestamp formatting.
- **Searchable Contacts**: Instant search filter to find contacts by name or email.

### 👤 Profile & Customization
- **Profile Picture Upload**: Client-side canvas compression (max 400x400 JPEG) keeping uploads lightweight (~30–50 KB).
- **Bio & Status**: Customizable user bio/status message (up to 200 characters) displayed on profiles and contact lists.
- **Account Dashboard**: Edit name, phone number, email, avatar, and bio with live avatar preview.
- **Password Management**: Change account password securely from settings/dashboard.
- **Theme Studio**: Custom theme selector with Aurora Glow, Dark Obsidian, Emerald Cyber, and more.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios, React Router v7 |
| **Backend** | Node.js, Express.js (v5), Socket.IO, Nodemailer, JSON Web Tokens (JWT), bcrypt |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Tooling** | ESLint v10, PostCSS, Vite Rolldown Bundler |

---

## 📂 Project Structure

```
Go-chatApp/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets (favicons, icons)
│   ├── src/
│   │   ├── assets/             # Branding and images
│   │   ├── component/          # Reusable UI components
│   │   │   ├── Chatting.jsx    # Active conversation window & message input
│   │   │   ├── navbar.jsx      # Top navigation & theme switcher
│   │   │   ├── herosection.jsx # Landing page hero banner
│   │   │   └── Footer.jsx      # Application footer
│   │   ├── context/            # Global React Contexts
│   │   │   ├── AuthContext.jsx # User auth, token storage, and session sync
│   │   │   └── SocketContext.jsx # Socket.IO client instance and online users
│   │   ├── pages/              # Route pages
│   │   │   ├── chatPage.jsx    # Main chat workspace & contact sidebar
│   │   │   ├── DashboardPage.jsx # Profile edit, avatar upload & bio settings
│   │   │   ├── login.jsx       # Password and Email OTP login
│   │   │   ├── register.jsx    # User registration
│   │   │   ├── ContactPage.jsx # Support & contact page
│   │   │   └── SettingsPage.jsx # Theme studio & appearance settings
│   │   ├── App.jsx             # App layout & protected routes
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Global Tailwind and Aurora theme variables
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API & WebSocket Server
│   ├── src/
│   │   ├── config/             # Database and port configurations
│   │   │   ├── db.js           # MongoDB Atlas connection
│   │   │   └── port.js         # Dynamic port selection utility
│   │   ├── controller/         # Request handling logic
│   │   │   ├── authController.js    # Login, register, OTP verification
│   │   │   ├── userController.js    # Profile update, password change, users list
│   │   │   ├── messageController.js # Send, receive, and fetch messages
│   │   │   └── publicController.js  # Contact inquiry handler
│   │   ├── middleware/         # Express middlewares
│   │   │   └── auth.middleware.js   # JWT token verification (Header + Cookie)
│   │   ├── models/             # Mongoose database schemas
│   │   │   ├── user.model.js        # User account schema with bio & avatar
│   │   │   ├── message.model.js     # Chat message schema
│   │   │   └── otp.model.js         # OTP schema with automatic 10-min TTL
│   │   ├── router/             # Express API routes
│   │   │   ├── auth.route.js        # /auth routes
│   │   │   ├── user.route.js        # /users routes
│   │   │   ├── message.route.js     # /messages routes
│   │   │   └── public.route.js      # /contactUs routes
│   │   ├── socket/             # WebSocket server implementation
│   │   │   └── socket.js            # Socket.IO connection & user mapping
│   │   └── utils/              # Helper utilities
│   │       └── mailer.js            # Nodemailer OTP email delivery
│   ├── index.js                # Server entry point & CORS configuration
│   ├── package.json
│   └── eslint.config.js
│
├── .gitignore                  # Git ignore rules for node_modules, build & env
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Variables Setup

### 1. Server Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
PORT=4500
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Go-chat?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# Gmail SMTP for Email OTP delivery
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 2. Client Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:4500
VITE_SOCKET_URL=http://localhost:4500
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas cluster)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Go-chatApp.git
cd Go-chatApp
```

### 2. Install Dependencies

**Install Backend Dependencies:**
```bash
cd server
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../client
npm install
```

### 3. Start Development Servers

**Run the Backend (Server):**
```bash
cd server
npm run dev
# Server will start on http://localhost:4500
```

**Run the Frontend (Client):**
```bash
cd client
npm run dev
# Frontend will start on http://localhost:5173
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | ❌ No |
| `POST` | `/auth/login` | Login with email and password | ❌ No |
| `POST` | `/auth/send-login-otp` | Send 6-digit OTP to user email | ❌ No |
| `POST` | `/auth/verify-login-otp` | Verify OTP and authenticate | ❌ No |
| `POST` | `/auth/forgot-password/send-otp` | Request password reset OTP | ❌ No |
| `POST` | `/auth/forgot-password/reset` | Reset password using OTP code | ❌ No |
| `POST` | `/auth/logout` | Clear user session & cookies | ❌ No |
| `GET` | `/auth/me` | Get current authenticated user | ✅ Yes |
| `GET` | `/users` | Get all registered contacts | ✅ Yes |
| `PUT` | `/users/profile` | Update profile (name, phone, avatar, bio) | ✅ Yes |
| `PUT` | `/users/password` | Change account password | ✅ Yes |
| `GET` | `/messages/:id` | Get message history with selected contact | ✅ Yes |
| `POST` | `/messages/send/:id` | Send a new message to contact | ✅ Yes |

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

