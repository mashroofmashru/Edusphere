# EduSphere - E-Learning Platform

EduSphere is a robust and modern Payment-integrated Learning Management System (LMS) designed to bridge the gap between instructors and students. It offers a seamless experience for creating, selling, and consuming educational content, enhanced with AI-powered tutoring and professional certification.

## 🚀 Features

### for Students
*   **Interactive Learning:** Access video lessons, quizzes, and text content.
*   **AI Tutor:** Built-in AI Chat (powered by Google Gemini) for instant help with course material.
*   **Progress Tracking:** Visual progress bars and course completion status.
*   **Certificates:** Auto-generated, downloadable PDF certificates upon 100% course completion.
*   **Secure Payments:** Integrated Stripe gateway for secure course purchases.
*   **Reviews:** Ability to rate and review courses.

### for Instructors
*   **Instructor Dashboard:** Comprehensive analytics on Revenue, Total Students, and Active Courses.
*   **Course Management:** Create, Edit, Delete, and Manage courses (Draft/Published/Archived statuses).
*   **Student Monitoring:** View enrolled students and their individual progress.
*   **Review Management:** Read student feedback and ratings.

### for Admins
*   **Platform Oversight:** Manage users and content across the platform.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Payments:** Stripe API
*   **AI Integration:** Google Gemini API
*   **File Handling:** Multer (for media uploads)
*   **PDF Generation:** html2canvas, jspdf

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
*   Git

## 🔧 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/mashroofmashru/Edusphere.git
    cd Edusphere
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory and add the following configuration:

```env
# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key

# AI Services (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Required for Contact Us Reply)
EMAIL_USER=example@email.com
EMAIL_PASS=your_email_password
```

*Note: The client is currently configured to point to `http://localhost:3000` by default. You can modify `client/src/config/server.js` if you change the server port.*

## 🚀 Running the Application

1.  **Start the Backend Server**
    ```bash
    cd server
    npm start
    ```
    *The server will run on http://localhost:3000*

2.  **Start the Frontend Client**
    Open a new terminal configuration:
    ```bash
    cd client
    npm run dev
    ```
    *The application will launch on http://localhost:5173*

## 📝 Usage Guide

1.  **Sign Up:** Create a new account as a Student or Instructor.
2.  **Instructors:** Go to the Instructor Dashboard to create your first course. Upload videos, add thumbnail, and set the price.
3.  **Students:** Browse the catalog, purchase a course via Stripe, and start learning.
4.  **AI Chat:** While watching a lesson, use the "AI Chat" floating button to ask questions about the content.
5.  **Certification:** Complete all lessons and quizzes to unlock your Certificate in the Profile section.

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

[MIT License](LICENSE)
