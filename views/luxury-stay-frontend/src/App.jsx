import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import WebsiteLayout from './layouts/WebsiteLayout';
import AdminLayout from './layouts/AdminLayout';

// Website Pages
import WebsiteHome from './pages/website/WebsiteHome';
import AboutUs from './pages/website/AboutUs';
import PublicRooms from './pages/website/PublicRooms';
import Gallery from './pages/website/Gallery';
import ContactUs from './pages/website/ContactUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Guest Private Pages
import GuestBookings from './pages/guest/GuestBookings';
import GuestBills from './pages/guest/GuestBills';
import GuestFeedback from './pages/guest/GuestFeedback';
import Profile from './pages/guest/Profile';

// Admin Pages
import AdminDashboardHome from './pages/Home'; // reusing the old home as Admin Dashboard
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Staff from './pages/Staff';
import StaffDetail from './pages/StaffDetail';
import Roles from './pages/Roles';
import Reservations from './pages/Reservations';

import Billings from './pages/Billings';
import Feedbacks from './pages/Feedbacks';
import Messages from './pages/Messages';

import NotFound from './pages/NotFound';
import PageTransition from './components/PageTransition';

function App() {
  return (
    <BrowserRouter>
      <PageTransition>
        <Toaster position="top-right" />
        <Routes>
        {/* Auth Routes (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public & Guest Website Routes */}
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<WebsiteHome />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="rooms" element={<PublicRooms />} />
          <Route path="gallery" element={<Gallery />} />
          
          {/* Guest Dashboard sections integrated in Website layout */}
          <Route path="profile" element={<div className="container mx-auto px-4 py-8"><Profile /></div>} />
          <Route path="my-bookings" element={<div className="container mx-auto px-4 py-8"><GuestBookings /></div>} />
          <Route path="my-bills" element={<div className="container mx-auto px-4 py-8"><GuestBills /></div>} />
          <Route path="feedback" element={<div className="container mx-auto px-4 py-8"><GuestFeedback /></div>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="staff" element={<Staff />} />
          <Route path="staff/:id" element={<StaffDetail />} />
          <Route path="roles" element={<Roles />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="billings" element={<Billings />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      </PageTransition>
    </BrowserRouter>
  );
}

export default App;
