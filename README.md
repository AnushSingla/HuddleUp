# 🏟️ HuddleUp — Sports Social Media Platform

HuddleUp is a full-stack MERN (MongoDB, Express, React, Node.js) social media platform designed exclusively for sports enthusiasts.
It enables users to share videos, participate in discussions, follow creators, and connect with fellow fans across different sports.

---

## 🌐 Live Demo

- HuddleUp: https://huddle-up-beta.vercel.app/


---

## ✨ Features

- Upload and share sports-related videos (reactions, analysis, highlights)
- Discussion forums with comments and replies
- Like videos and follow creators
- Categorization by sport, team, or trend
- Friend request and social connection system
- Search and explore trending content
- Secure authentication using JWT
- Fully responsive modern UI

---

## 🛠️ Tech Stack

Frontend:
- React.js
- Tailwind CSS / ShadCN UI
- Axios

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication & Authorization)

---

## 🧠 System Architecture

- RESTful REST API based client–server architecture
- JWT based authentication middleware
- Modular backend (routes, controllers, models)
- Environment-based configuration
- Scalable MongoDB schema design

---

## 📁 Project Structure

HuddleUp/
- client/   → React frontend
- server/   → Node.js + Express backend

---

## ⚙️ Local Development Setup

**Prerequisites:**
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

## 🚀 Installation & Run

**1. Clone the repository:**
```bash
git clone https://github.com/AnushSingla/HuddleUp.git
cd HuddleUp
```

**2. Backend Setup:**
```bash
cd server
npm install
cp .env.example .env
```

**Configure `.env` file:**
```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

**Start backend server:**
```bash
npm start
# Server runs on http://localhost:5000
```

**3. Frontend Setup:**

Open a new terminal:
```bash
cd client
npm install
cp .env.example .env
```

**Configure `client/.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Start frontend:**
```bash
npm run dev
# Client runs on http://localhost:5173 (or 5174)
```

**4. Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 👨‍💻 Author

Anush Singla  
Email: singlaanush18@gmail.com  
Linkedln: https://www.linkedin.com/in/anush-singla-1b0899311/

---

## 📜 License

This project is licensed under the MIT License.
