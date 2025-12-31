# 🚀 TeamSync: Senior-Level Interview Preparation Guide

This document provides a comprehensive deep-dive into the architecture, technical decisions, and data flows of the TeamSync project. Use this to prepare for system design and technical rounds.

---

## 🛠️ 1. Technical Stack (The "What")

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TailwindCSS, DaisyUI | Modern, responsive, and component-based UI. |
| **State Management** | Zustand | Lightweight alternative to Redux; better for real-time state. |
| **Backend** | Node.js, Express.js | Event-driven, non-blocking I/O; perfect for scalable chat. |
| **Real-time Engine** | Socket.io | Bi-directional communication with automated fallback and reconnection. |
| **Scaling Manager** | Redis (with Redis-Adapter) | Decouples socket state; allows horizontal scaling across servers. |
| **Database** | MongoDB Atlas | Schema-less flexibility for storing diverse message types and user metadata. |
| **Storage** | Cloudinary | Offloads media processing (images/audio) from the application server. |
| **AI Engine** | Groq (Llama 3 70B) | High-speed inference for smart replies and automated bot interactions. |
| **Security** | Web Crypto API (RSA + AES) | Industry-standard End-to-End Encryption (E2EE). |

---

## 🏗️ 2. System Architecture (The "How")

### **Horizontal Scalability (Redis Pub/Sub)**
- **Problem:** In a standard WebSocket setup, if User A is on Server 1 and User B is on Server 2, they cannot "see" each other.
- **Solution:** I implemented the **Redis-Adapter**. When a message is sent, the server publishes an event to a Redis channel. All other server instances are subscribed to that channel and emit the message to their local connected clients.
- **Interview Key:** *"The application logic is stateless, making it 12-Factor App compliant and ready for automated scaling."*

### **Zero-Knowledge Privacy (E2EE)**
- **Process:** 
    1.  User generates an **RSA Key Pair** locally on signup.
    2.  **Public Key** is stored in MongoDB; **Private Key** stays in the user's browser (IndexedDB).
    3.  When sending a message, the sender fetches the receiver's Public Key, encrypts the message using **AES-GCM**, and sends only the ciphertext.
- **Security Key:** *"The server acts as a 'dumb' pipe; it stores and routes data it cannot read."*

---

## 🔄 3. Critical Data Flows

### **A. Sending a Private Message**
1.  **Frontend (UI):** User types "Hello" and hits Send.
2.  **Encryption:** The `useChatStore` fetches the receiver's `publicKey`, encrypts "Hello" into a ciphertext blob.
3.  **API Call:** `POST /api/messages/send/:id` sends the ciphertext + any media.
4.  **Backend:** Stores message in **MongoDB** and emits a `newMessage` event via **Socket.io**.
5.  **Redis Sync:** Redis broadcasts the event to all server instances.
6.  **Real-time Delivery:** The server where the recipient is connected emits the `newMessage` event to their browser.
7.  **Decryption:** The recipient's browser uses their **Private Key** to decrypt the blob back into "Hello".

### **B. AI Smart Replies Flow**
1.  Frontend detects the last message is from the other user.
2.  `getSuggestions(lastMessage)` is called.
3.  Backend sends the context to **Groq (Llama 3)**.
4.  AI generates 3 context-aware replies (e.g., "Sounds good!", "I'm busy", "Let's meet").
5.  Frontend renders these as quick-action buttons.

---

## 🔥 4. Advanced Feature Implementations

### **1. Real-Time Interactions**
- **Typing Indicators:** Uses `typing` and `stopTyping` socket events with a **2-second debounce** on the frontend to prevent socket flooding.
- **Read Receipts (Ticks):** `markAsRead` API updates DB and emits a `messagesSeen` event. The sender sees a `CheckCheck` icon turn blue instantly.
- **Online Status:** Handled via custom `onlineUsers` logic in the `useAuthStore` using `io.emit("getOnlineUsers")`.

### **2. Media Handling**
- **Voice Messages:** Uses the **MediaRecorder API**. Converts the audio blob to Base64, uploads to Cloudinary as `resource_type: "video"`, and retrieves a URL for the `<audio>` tag player in the chat.
- **Smart Images:** Images are optimized via Cloudinary transformations before being stored.

### **3. Private Connection System**
- **Chat Codes:** Users are anonymous by default. They generate a unique 6-character code (e.g., `TS-ABCDE`). Connection is only possible if codes are exchanged, ensuring a "WhatsApp-style" private ecosystem.

---

## ❓ 5. Likely Interview Questions & Answers

**Q: Why use Redis for a single-server local project?**
*   **A:** To build for the future. By implementing `socket.io-redis-adapter` now, the app is architecturally ready for production where multiple instances will run behind a load balancer.

**Q: How do you handle message synchronization if a user is offline?**
*   **A:** All messages are persisted in **MongoDB**. When a user logs in, the `getMessages` action fetches the history. Unread counts are calculated by checking the `isRead: false` flag for messages sent while the user was not active in that specific chat.

**Q: Why Zustand over Redux?**
*   **A:** Zustand has much less boilerplate and a smaller bundle size. It allows for easy access to state outside of React components (like in our socket listeners), which is crucial for a real-time app.

**Q: What is the biggest challenge you faced?**
*   **A:** Handling E2EE decryption in real-time. Ensuring that the incoming socket message is decrypted correctly without blocking the UI thread required careful async management in the Zustand store.

---

## 📈 6. Future Roadmap (Bonus Impact)
- **Sentiment Analysis:** Analyzing message tone using AI to display "mood" emojis.
- **Group Chats:** Scaling the E2EE logic for multiple recipients (using a shared group key).
- **WebRTC P2P Video:** Fully transitioning signaling into the existing socket structure for direct video calls.
