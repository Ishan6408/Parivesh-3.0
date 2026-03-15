<div align="center">
  <img width="1200" alt="PARIVESH 3.0 Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🇮🇳 PARIVESH 3.0
  ### Next-Generation Environmental Clearance & Monitoring Portal
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/Frontend-React%2018-blue)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
  [![Groq AI](https://img.shields.io/badge/AI-Groq%20Cloud-orange)](https://groq.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC)](https://tailwindcss.com/)
</div>

---

## 📖 Overview

**PARIVESH 3.0** (Pro-Active and Responsive facilitation by Interactive, Virtuous and Environmental Single-window Hub) is a unified platform designed for the **Ministry of Environment, Forest and Climate Change (MoEFCC)**, Government of India. 

The platform streamlines the environmental clearance process through:
- **Intelligent Automation**: AI-generated project summaries and document forensic analysis.
- **Role-Based Access**: Dedicated workflows for Applicants, Regulators, and Citizens.
- **Transparency**: Public monitoring of project impacts and satellite-based change detection.

---

## 🌟 Key Features

### 🏢 For Applicants
- **Guided Submission**: Streamlined project application with real-time feedback.
- **AI Permit Advisor**: intelligent guidance on required clearances (Environmental, Forest, Wildlife).
- **Impact Simulation**: Predictive modeling for project environmental footprints.
- **Compliance Tracking**: Real-time monitoring of application status and report requirements.

### ⚖️ For Regulators
- **AI Project Summary**: Automatically generated executive summaries for complex projects.
- **Document Forensics**: AI-powered analysis of PDFs to detect inconsistencies and integrity issues.
- **GIS Monitoring**: Integrated map view for project locations and environmental sensitivity.
- **Deep Review**: Analytical tools for technical evaluation of clearances and risks.

### 👥 For Citizens
- **Public Explorer**: Transparent access to all active and pending project details.
- **Environmental Stats**: Real-time pollution metrics and impact data.
- **Satellite Tracking**: Visual comparison of land-use changes using high-res imagery.
- **Grievance Portal**: AI-assisted complaint submission and transparency logs.

---

## 🛠️ Technical Architecture

### **Frontend**
- **Framework**: React 18 with Vite for ultra-fast builds.
- **Styling**: Tailwind CSS with a custom, premium design system.
- **Animations**: Framer Motion for smooth transitions and micro-interactions.
- **Icons**: Lucide React for consistent, modern iconography.

### **Backend**
- **Server**: Node.js & Express.
- **Database**: SQLite (via `better-sqlite3`) for robust, local-first data management.
- **Security**: JWT-based authentication and secure password hashing.
- **AI Engine**: Groq SDK for high-speed inference (Llama 3/Mixtral).

---

## 🚀 Local Deployment

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A [Groq Cloud](https://console.groq.com/) API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/sourabh-sahu-08/Ecotrack.git
cd Ecotrack

# Install all dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_secure_random_string
NODE_ENV=development
```

### 4. Running the Application
```bash
# Start both frontend and backend in development mode
npm run dev
```

---

## 🌐 Production Deployment

### **Backend (Render)**
The project includes a `render-build.sh` for seamless deployment to Render.
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`
- **Auto-Provisioning**: The SQLite database is automatically initialized on the first run.

### **Frontend (Vercel)**
Configured for static site generation and deployment.
- **Root Directory**: `frontend`
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Environment Variable**: Set `VITE_API_URL` to your production backend URL.

---

## 🛡️ Security & Privacy
- **Encrypted Data**: All user credentials and sensitive IDs are handled via secure JWTs.
- **Audit Logs**: Every clearance decision and document update is tracked for transparency.
- **Data Integrity**: AI-based document verification prevents fraudulent submissions.

---

<div align="center">
  <p><b>PARIVESH 3.0 · Environmental Efficiency Through Innovation</b></p>
  <p>© 2026 Developed for Government of India</p>
</div>
