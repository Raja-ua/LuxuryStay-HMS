# LuxuryStay - Hotel Management System (HMS)

LuxuryStay is a comprehensive, full-stack Hotel Management System built with the **MERN** (MongoDB, Express.js, React.js, Node.js) stack. It provides a seamless public-facing website for guests to book rooms and an advanced Admin Dashboard for hotel staff to manage reservations, billing, inventory, and dynamic pricing.

## 🚀 Features

### Public Website (For Guests)
*   **Room Browsing:** View available rooms with luxury-themed UI and detailed feature lists.
*   **Online Booking System:** Multi-step reservation form allowing guests to book rooms, calculate totals (with dynamic pricing), and make initial payments.
*   **Guest Feedback:** Submit and display guest reviews and ratings.

### Admin Dashboard (For Hotel Management)
*   **Analytics Dashboard:** Visual charts and KPI cards tracking Total Revenue, Monthly Trends, Active Bookings, and pending services.
*   **Reservation Management:** Complete control over check-ins, check-outs, early check-outs, and booking modifications.
*   **Dynamic Pricing:** Configurable settings to automatically apply surcharges on weekends or specific holidays.
*   **Billing & Invoicing:** Create, edit, and print detailed bills. Automatically calculates tax, additional charges, and syncs payment statuses.
*   **Room Management:** Manage room statuses (Available, Occupied, Maintenance), types, and pricing.
*   **Staff Management:** Manage staff profiles, roles, and shift details.
*   **Inventory Tracking:** Keep track of hotel inventory and supplies.
*   **Service Requests:** Manage guest room service or housekeeping requests.
*   **SMS Notifications:** Integrated with Vonage API to send automatic SMS confirmations to guests upon booking.

## 💻 Tech Stack

**Frontend:**
*   React.js (Vite)
*   Tailwind CSS (for responsive, luxury-themed styling)
*   Recharts (for dashboard analytics)
*   React Router (for navigation)
*   Axios (for API communication)
*   SweetAlert2 & React Toastify (for alerts and notifications)

**Backend:**
*   Node.js & Express.js
*   MongoDB (Mongoose ODM)
*   Vonage API (for SMS)
*   Cors & Dotenv

## 📂 Project Structure

```
LuxuryStay-HMS/
├── Controllers/         # Backend logic for routes (Auth, Reservations, Billings, etc.)
├── Model/               # MongoDB Mongoose Schemas
├── Routes/              # Express API Routes
├── views/
│   └── luxury-stay-frontend/   # React Frontend Application
│       ├── src/
│       │   ├── components/     # Reusable UI components (Sidebar, Navbar)
│       │   ├── pages/          # Main application views (Dashboard, Reservations, etc.)
│       │   ├── context/        # React Context (Settings, Auth)
│       │   └── utils/          # Helper functions (Pricing logic, API instances)
│       └── ...
├── server.js            # Express application entry point
└── package.json         # Backend dependencies
```

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Raja-ua/LuxuryStay-HMS.git
cd LuxuryStay-HMS
```

### 2. Setup the Backend
Install the backend dependencies:
```bash
npm install
```

Create a `.env` file in the root directory and add your environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
VONAGE_API_KEY=your_vonage_key
VONAGE_API_SECRET=your_vonage_secret
```

Start the backend server:
```bash
npm start
# or for development
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the frontend directory:
```bash
cd views/luxury-stay-frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

### 4. Build for Production
To build the frontend for production, run:
```bash
cd views/luxury-stay-frontend
npm run build
```

## 🎨 Design Guidelines
*   **Theme:** The system strictly follows a luxury theme utilizing **Navy Blue (`#1b3658`)** and **Gold (`#d4af37`)**.
*   **Precision:** Financial data is strictly formatted to 2 decimal places to ensure accounting accuracy across all billing and reservation modules.
*   **Responsiveness:** Designed with a Mobile-First approach to ensure staff and guests can access the system flawlessly on any device.

## 📄 License
This project is proprietary and developed for LuxuryStay HMS.
