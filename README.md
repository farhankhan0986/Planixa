# Planixa 🗂️

Planixa is a modern task management web application that helps users organize, manage, and track their tasks efficiently through a clean and intuitive interface.

Built with **Next.js (App Router)**, Planixa focuses on simplicity, performance, and a polished user experience.

---

## 🚀 Features

- 🔐 **Authentication**
  - User signup & login
  - Secure session handling with JWT
- 🧑‍💼 **User Profile**
  - View and update profile details
- ✅ **Task Management**
  - Create, read, update, and delete tasks
  - Optional task descriptions
- 🔍 **Task Search & Filter**
  - Search tasks by title or description
  - Filter tasks with or without descriptions
- 📄 **Task Detail View**
  - Dedicated reading page for each task
- 🎨 **Modern UI**
  - Dark theme with glassmorphism
  - Smooth animations using Framer Motion
  - Skeleton loaders for better UX
- 📱 **Responsive Design**
  - Works across desktop and mobile devices

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+ (App Router)**
- **React**
- **Tailwind CSS**
- **Framer Motion**

### Backend
- **Next.js API Routes**
- **MongoDB**
- **Mongoose**
- **JWT Authentication**

---

## 📂 Project Structure

```
app/
├─ api/
│ ├─ auth/
│ ├─ tasks/
│ └─ v1/me/
├─ dashboard/
├─ tasks/
│ └─ [id]/
├─ profile/
├─ login/
├─ signup/
└─ page.jsx
lib/
├─ db.js
└─ jwt.js
models/
└─ User.js
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---


## 🔑 Demo Credentials / Seed Data

You can use the following demo account to explore the application without creating a new user:

- **Email:** demo@planixa.com  
- **Password:** demo123  

---

## 📈 How I Would Scale This for Production

- Move backend to a dedicated service (Node.js / FastAPI)
- Use refresh tokens & token rotation
- Add role‑based access control (RBAC)
- Introduce pagination & indexing on MongoDB
- Add Redis caching for frequent reads
- Enable rate‑limiting & request logging
- Use environment‑specific configs & secrets manager
- Deploy with CI/CD and containerization (Docker)

---

## 📮 Postman Collection

A Postman collection is included to test all API endpoints.

**File:** `Planixa.postman_collection.json`

### How to use:
1. Open Postman
2. Import the collection file
3. Set base URL to `http://localhost:3000`
4. Login using demo credentials
5. Test all authenticated APIs

---

## ▶️ Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/planixa.git
cd planixa
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run the development server
```bash
npm run dev
```

The app will be available at:  
👉 http://localhost:3000

---

## 🔐 API Endpoints (Overview)

### Authentication
- POST `/api/v1/auth/signup` – Create account
- POST `/api/v1/auth/login` – Login user
- POST `/api/v1/auth/logout` – Logout user
- GET `/api/v1/auth/me` – Get logged-in user

### Profile
- GET `/api/v1/me` – Fetch profile
- PUT `/api/v1/me` – Update profile

### Tasks
- GET `/api/v1/tasks/list` – Get all tasks
- POST `/api/v1/tasks/create` – Create a task
- GET `/api/v1/tasks/read/:id` – Read a task
- PUT `/api/v1/tasks/update/:id` – Update a task
- DELETE `/api/v1/tasks/delete/:id` – Delete a task

---

## ✨ UI Highlights
- Glassmorphism cards
- Gradient accents (emerald & amber)
- Skeleton loaders for smooth loading states
- Subtle motion for a premium feel

---

## 📌 Future Improvements
- Task completion status
- Pagination or infinite scrolling
- Task tags & categories
- Change password functionality
- Account deletion (danger zone)

---

## 👨‍💻 Author
**Farhan Abid**  

Portfolio: https://dev-vault-alpha.vercel.app/
GitHub: https://github.com/farhankhan0986
