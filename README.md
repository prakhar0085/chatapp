# 🚀 TeamSync: The Future of Secure & Intelligent Communication

![TeamSync Banner](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge&logo=github)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20+%20Socket.io%20+%20Redis-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-E2EE%20(RSA%20+%20AES)-red?style=for-the-badge)

**TeamSync** is a high-performance, privacy-first communication platform that bridges the gap between traditional real-time messaging and modern AI-driven collaboration. Built with a focus on scalability and security, it ensures your data remains yours while providing intelligent tools to boost productivity.

---

## ✨ Key Features

### 🛡️ Privacy & Security
- **End-to-End Encryption (E2EE):** All messages are encrypted in the browser using RSA (for key exchange) and AES-GCM (for message content). The server *never* sees plain text.
- **Secure Chat Codes:** Simple yet secure connection system for private 1-on-1 chats.
- **Privacy-First Storage:** Media is handled via Cloudinary with secure delivery, while text remains encrypted and stateless on the backend.

### 🤖 AI Intelligence
- **AI Assistant:** A dedicated, persistent AI bot (Llama 3 via Groq) available for every user to help with tasks, summaries, and information.
- **Smart Replies:** Context-aware suggestions powered by sub-second AI inference, making conversations faster and more fluid.

### ⚡ Real-Time Excellence
- **Global Scaling:** Distributed architecture using **Redis Pub/Sub** and the Socket.io Redis Adapter. Ready to handle thousands of concurrent users across multiple server instances.
- **Dynamic Presence:** Real-time online status tracking, typing indicators, and read receipts (blue ticks).
- **Voice & Media:** High-quality image sharing and voice notes powered by Cloudinary.
- **Video Calling:** Peer-to-peer 4K video streams leveraging WebRTC signaling hooks.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + DaisyUI (Premium UI Components)
- **State Management:** Zustand (Minimal, Hook-based)
- **Icons:** Lucide React
- **Real-time:** Socket.io-client
- **Security:** Web Crypto API (SubtleCrypto)

### Backend
- **Runtime:** Node.js (Express)
- **Database:** MongoDB (via Mongoose)
- **Message Broker:** Redis (for stateless scaling)
- **AI Engine:** Groq SDK (Llama 3) / Google Generative AI
- **File Storage:** Cloudinary
- **Authentication:** JWT + Cookie Parser

---

## 🏗️ Architecture Overview

TeamSync is designed as a **Stateless Backend** system. By offloading session data and global state to Redis, the application can be horizontally scaled infinitely without losing user status or breaking WebSocket connections.

```mermaid
graph TD
    UserA[User A - Frontend] <-->|Socket.io| LB[Load Balancer]
    LB <--> S1[Server Instance 1]
    LB <--> S2[Server Instance 2]
    S1 <--> Redis[(Redis Pub/Sub)]
    S2 <--> Redis
    UserB[User B - Frontend] <-->|Socket.io| S2
    S1 <--> DB[(MongoDB)]
    S1 <--> AI[Groq / Llama 3]
    S1 <--> Cloud[Cloudinary]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis instance (Upstash recommended)
- Cloudinary account
- Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/teamsync.git
   cd teamsync
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   REDIS_URL=your_redis_url
   GROQ_API_KEY=your_groq_api_key
   NODE_ENV=development
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   (Optional) Update `VITE_BASE_URL` if running on a custom port.

### Running the App

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📸 Screenshots

| Login Page | Chat Interface | AI Assistant |
| :---: | :---: | :---: |
| ![Login](https://via.placeholder.com/300x200?text=Login+UI) | ![Chat](https://via.placeholder.com/300x200?text=Chat+UI) | ![AI](https://via.placeholder.com/300x200?text=AI+Assistant) |

*(Replace with actual screenshots of your application)*

---

## 💎 Project Rationale

*"TeamSync isn't just a chat app; it's a secure, AI-augmented infrastructure designed for the modern era of privacy. I chose a distributed architecture (Redis/Atlas) to ensure that as the user base grows, the system stays fast, and as privacy laws get stricter, the E2EE remains unbreakable."*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Your Name]
