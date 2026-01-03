I have revised your `README.md` file. The new content organizes the original information more clearly, adds explanations, and incorporates the requested **Screenshots** section.

You can replace your existing `README.md` file with the text below.

---

# HSS Secure - Healthcare Staff Management System 🏥

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Hackathon Winner](https://img.shields.io/badge/Hackathon-3rd_Place-brightgreen)

## 🏆 Hackathon Achievement
**Third Place Winner** at the **Cybersecurity Hackathon** - [View Announcement](https://www.linkedin.com/posts/vukile-ntsele-b0b489238_cybersecurity-hackathonhighlights-top3-activity-7337515144526098432-9EWd/?utm_source=share&utm_medium=member_desktop&rcm=ACoAADsouvsBbry6CwH47h_evAdQ7h8Ndc2PVDI)

## 📋 Overview

**HSS Secure** is a comprehensive healthcare staff management platform designed to simplify scheduling, monitor compliance, and streamline communication between medical professionals. Built with security and usability in mind, it helps healthcare organizations reduce administrative workload by up to 40% while ensuring HPCSA compliance.

## 🚀 Live Demo & Quick Access

- **Live Application**: [https://healthcaresecuresystem.netlify.app/](https://healthcaresecuresystem.netlify.app/)
- **Demo Account**: `admin123` / `Password123`
- **Backend API**: Deployed on Render (see Environment Setup)

## ✨ Key Features

| Feature Area | Description | Impact |
| :--- | :--- | :--- |
| **📊 Real-time Staff Management** | Live shift tracking, assignment, and mobile-friendly interface. | Enables on-the-go access and instant updates for all staff. |
| **🛡️ Compliance & Security** | Automated HPCSA-compliant tracking, role-based access, and audit trails. | Ensures data security and helps maintain an average 86% compliance status. |
| **📈 Analytics Dashboard** | Real-time metrics, overtime tracking, and compliance reporting. | Provides actionable insights for management to optimize staffing. |
| **🔄 Efficient Scheduling** | Automated shift creation with conflict detection and resolution. | Reduces manual scheduling errors and administrative time. |

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: React 18 with TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcrypt
- **API Docs**: Swagger/OpenAPI
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting

### **Database & Infrastructure**
- **Database**: MongoDB Atlas with Mongoose ODM
- **Hosting**: Vercel (Frontend), Railway/Render (Backend)
- **Monitoring**: LogRocket, Sentry
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
hss-secure/
├── frontend/                 # Next.js Application (App Router)
│   ├── app/                 # Pages & API routes
│   ├── components/          # Reusable UI components
│   ├── lib/                 # API client, auth, utilities
│   ├── types/               # TypeScript definitions
│   └── styles/              # Global styles
├── backend/                  # Node.js/Express API Server
│   ├── src/
│   │   ├── controllers/     # Route logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Custom middleware (auth, validation)
│   │   └── utils/           # Helper functions
│   ├── config/              # Environment configs
│   └── tests/               # Test suites
├── shared/                   # Shared code (types, constants)
└── docker/                  # Container configurations
```

📸 Screenshots
🏠 Dashboard Overview
https://github.com/user-attachments/assets/a5c5c12b-3efb-4496-adab-603120e69fee
*Real-time analytics showing staff distribution, compliance status (86%), and upcoming shifts.*

📅 Interactive Scheduling Interface
https://github.com/user-attachments/assets/19f6e6c4-262c-40c7-a3a5-b36690e7f8c6
Drag-and-drop scheduling calendar with conflict detection and staff availability indicators.

🛡️ Compliance Monitoring Dashboard
https://github.com/user-attachments/assets/856718e0-e9a9-4c78-805a-66d48e78254f
Detailed compliance tracking showing certification status, renewal deadlines, and audit trails.

📱 Mobile Staff View
https://github.com/user-attachments/assets/5e5e7bfd-b3dd-4f06-9727-5c90511a4f0a
Mobile-optimized interface allowing staff to view schedules, clock in/out, and receive notifications.

🔐 Administrative Control Panel
https://github.com/user-attachments/assets/9d5bccc8-5cfb-4b72-a5e3-b5d719030143
Role-based access control panel for managing users, permissions, and system settings.

📊 Analytics & Reporting
https://github.com/user-attachments/assets/a197b1b8-bef9-4ce9-a37b-fe0810351474
*Interactive charts showing overtime trends, department performance, and staffing metrics.*

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm/yarn/pnpm
- **MongoDB Atlas account** or local MongoDB instance
- **Git**

### Installation & Local Setup

1.  **Clone and navigate into the project:**
    ```bash
    git clone https://github.com/ShawnTheCreator/HSS.git
    cd HSS
    ```

2.  **Install dependencies for both frontend and backend:**
    ```bash
    # Install frontend dependencies
    cd hss-frontend
    npm install

    # Install backend dependencies
    cd ../hss-backend
    npm install
    ```

3.  **Environment Configuration:**

    **Backend (`hss-backend/.env`):**
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_secure_jwt_secret_key
    NODE_ENV=development
    FRONTEND_URL=http://localhost:5173 # Your Vite frontend URL
    ```

    **Frontend (`hss-frontend/.env`):**
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    # Add other public configuration variables here
    ```

    > **⚠️ Important:** The `.env` file is for local development. **Never commit it to Git.** Use the provided `.env.example` as a template.

4.  **Start the development servers:**

    **Terminal 1 - Start the Backend API:**
    ```bash
    cd hss-backend
    npm run dev
    # Server runs on http://localhost:5000
    ```

    **Terminal 2 - Start the Frontend Application:**
    ```bash
    cd hss-frontend
    npm run dev
    # App runs on http://localhost:5173
    ```

5.  **Access the application:**
    - **Frontend App:** [http://localhost:8080](http://localhost:8080)
    - **Backend API:** [http://localhost:5000](http://localhost:5000)
    - **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 🗄️ Core Database Schemas (Examples)

### User Schema
```javascript
{
  email_id: String,        // Unique identifier for login
  password: String,        // Hashed
  role: String,           // 'admin', 'manager', 'staff'
  profile: {
    firstName: String,
    lastName: String,
    contactNumber: String
  },
  isActive: Boolean
}
```

### Shift Schema
```javascript
{
  staffId: ObjectId,
  startTime: Date,
  endTime: Date,
  department: String,
  status: String, // 'scheduled', 'in-progress', 'completed'
}
```

## 🔐 API Endpoints Quick Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and return tokens | No |
| `POST` | `/api/auth/refresh-token` | Refresh access token | Yes |
| `GET` | `/api/dashboard/summary` | Get dashboard KPIs | Yes |
| `GET` | `/api/shifts` | List all shifts | Yes |
| `POST` | `/api/shifts` | Create a new shift | Yes (Admin/Manager) |

## 🧪 Running Tests

```bash
# Run backend tests
cd hss-backend
npm test

# Run frontend tests
cd hss-frontend
npm test
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**HSS Secure** – *Third Place Winner 🥉 | Cybersecurity Hackathon | Simplifying Healthcare Staff Management*
