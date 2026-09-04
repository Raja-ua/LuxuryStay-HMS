import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faUser, faSignOutAlt, faBell, faChevronDown, faClipboardList, faFileInvoiceDollar, faCommentDots, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

import Logo from '../components/Logo';

const WebsiteLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const [unreadIds, setUnreadIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async (userData) => {
      try {
        const { data } = await api.get('/reservations');
        const clearedNotifs = JSON.parse(localStorage.getItem('clearedNotifs') || '[]');
        
        // Get all confirmed bookings for this user
        const userConfirmed = data.filter(r => {
          const guestIdStr = r.guestId?._id || r.guestId;
          return guestIdStr === userData._id && r.status === 'confirmed';
        });
        
        // Sort newest first
        userConfirmed.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        const unread = userConfirmed.filter(r => !clearedNotifs.includes(r._id)).map(r => r._id);
        
        setNotifications(userConfirmed);
        setUnreadIds(unread);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      const parsedUser = JSON.parse(loggedUser);
      setUser(parsedUser);
      fetchNotifications(parsedUser);
      
      const interval = setInterval(() => fetchNotifications(parsedUser), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50 print:hidden relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
          {/* Left Side: Mobile Toggle (Mobile) or Logo (Desktop) */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-700 text-2xl outline-none" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
            </button>
            <div className="hidden md:block">
              <Logo size="md" isDark={true} />
            </div>
          </div>

          {/* Logo: Centered on Mobile */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="pointer-events-auto">
              <Logo size="md" isDark={true} />
            </div>
          </div>
          
          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <Link to="/about-us" className="hover:text-blue-600 transition">About Us</Link>
            <Link to="/rooms" className="hover:text-blue-600 transition">Rooms</Link>
            <Link to="/gallery" className="hover:text-blue-600 transition">Gallery</Link>
            <Link to="/contact-us" className="hover:text-blue-600 transition">Contact Us</Link>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {!user ? (
              <div className="flex gap-2 sm:gap-4">
                <Link to="/login" className="text-blue-600 border border-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-blue-50 transition font-medium text-sm sm:text-base">Login</Link>
                <Link to="/register" className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium">Register</Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                {user.role !== 'guest' && (
                  <Link to="/admin" className="hidden lg:block bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition font-medium text-sm">
                    Admin Dashboard
                  </Link>
                )}
                
                {/* Notification Dropdown Container */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      if (!isNotificationOpen && unreadIds.length > 0) {
                        const clearedNotifs = JSON.parse(localStorage.getItem('clearedNotifs') || '[]');
                        const newCleared = Array.from(new Set([...clearedNotifs, ...unreadIds]));
                        localStorage.setItem('clearedNotifs', JSON.stringify(newCleared));
                      }
                    }}
                    className="hidden md:block text-gray-500 hover:text-blue-600 transition text-xl relative outline-none mt-1"
                  >
                    <FontAwesomeIcon icon={faBell} />
                    {unreadIds.length > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white animate-pulse">
                        {unreadIds.length}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute fixed md:absolute top-16 md:top-auto right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 mt-2 w-[calc(100vw-2rem)] md:w-80 bg-white border border-gray-200 shadow-2xl rounded-lg z-50 overflow-hidden animate-fadeIn max-w-sm">
                      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex justify-between items-center">
                        <span>Notifications</span>
                        <div className="flex items-center gap-2">
                          {unreadIds.length > 0 && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">{unreadIds.length} New</span>}
                          <button className="md:hidden text-gray-500" onClick={() => setIsNotificationOpen(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[60vh] md:max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notif => {
                            const isNew = unreadIds.includes(notif._id);
                            return (
                              <Link key={notif._id} to="/my-bookings" onClick={() => setIsNotificationOpen(false)} className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition relative ${isNew ? 'bg-green-50/30' : ''}`}>
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${isNew ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-300'}`}></div>
                                  <div>
                                    <p className={`text-sm font-medium ${isNew ? 'text-gray-900' : 'text-gray-600'}`}>Booking Approved!</p>
                                    <p className={`text-xs mt-1 ${isNew ? 'text-gray-700' : 'text-gray-400'}`}>Your reservation for Room {notif.roomId?.roomNumber || '...'} has been confirmed by the admin.</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm font-medium">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative cursor-pointer" ref={dropdownRef}>
                  <div 
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-800 px-3 py-2 rounded-full transition relative"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {user.image ? (
                      <img src={user.image} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                    <span className="font-bold text-sm hidden sm:block">{user.fullName || user.name || 'User'}</span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs ml-1 text-blue-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    
                    {/* Red dot on profile icon for mobile if there are notifications */}
                    {unreadIds.length > 0 && (
                      <span className="md:hidden absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden animate-fadeIn">
                      {user.role !== 'guest' && (
                        <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="lg:hidden block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3 border-b border-gray-100">
                          <FontAwesomeIcon icon={faHotel} className="w-4 text-center" /> Admin Dashboard
                        </Link>
                      )}
                      
                      {/* Notifications Link (Mobile Only) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (unreadIds.length > 0) {
                            const clearedNotifs = JSON.parse(localStorage.getItem('clearedNotifs') || '[]');
                            const newCleared = Array.from(new Set([...clearedNotifs, ...unreadIds]));
                            localStorage.setItem('clearedNotifs', JSON.stringify(newCleared));
                          }
                          setIsDropdownOpen(false);
                          setIsNotificationOpen(true);
                        }} 
                        className="md:hidden w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center justify-between border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon icon={faBell} className="w-4 text-center" /> Notifications
                        </div>
                        {unreadIds.length > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadIds.length}
                          </span>
                        )}
                      </button>

                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3 border-b border-gray-100">
                        <FontAwesomeIcon icon={faUser} className="w-4 text-center" /> My Profile
                      </Link>
                      <Link to="/my-bookings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3 border-b border-gray-100">
                        <FontAwesomeIcon icon={faClipboardList} className="w-4 text-center" /> My Bookings
                      </Link>
                      <Link to="/my-bills" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3 border-b border-gray-100">
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-4 text-center" /> My Payments
                      </Link>
                      <Link to="/feedback" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3 border-b border-gray-100">
                        <FontAwesomeIcon icon={faCommentDots} className="w-4 text-center" /> Feedback
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition flex items-center gap-3">
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 text-center" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40">
            <div className="flex flex-col font-medium text-gray-700">
              <Link to="/" className="px-6 py-4 border-b border-gray-50 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/about-us" className="px-6 py-4 border-b border-gray-50 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link to="/rooms" className="px-6 py-4 border-b border-gray-50 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Rooms</Link>
              <Link to="/gallery" className="px-6 py-4 border-b border-gray-50 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
              <Link to="/contact-us" className="px-6 py-4 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#f5f3ee] text-[#1b3658] pt-16 pb-8 border-t border-gray-200 print:hidden font-sans">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* 1. Top Section: Centered Logo */}
          <div className="flex justify-center items-center mb-12">
            <Logo size="lg" isDark={true} />
          </div>

          <hr className="border-gray-300 mb-12" />

          {/* 2. Middle Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Left side: Newsletter */}
            <div className="flex flex-col md:pr-12 md:border-r border-gray-300">
              <h3 className="text-2xl font-bold mb-4 text-[#1b3658]">Get the scoop</h3>
              <p className="text-gray-600 mb-8 font-light">Sign up to our newsletter for juicy offers and sweet new openings</p>
              <div>
                <button className="bg-[#937648] hover:bg-[#7d633b] text-white font-bold py-3 px-8 rounded-none transition border-none cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
            
            {/* Right side: Need Help */}
            <div className="flex flex-col md:pl-6 justify-center">
              <h3 className="text-xl font-medium mb-6 text-[#1b3658]">Need help</h3>
              <ul className="space-y-4 font-light text-gray-700">
                <li><Link to="/login" className="hover:text-[#937648] transition">Manage bookings</Link></li>
                <li><Link to="/contact-us" className="hover:text-[#937648] transition">Contact us</Link></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-300 mb-12" />

          {/* 3. Bottom Section: 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-4">
            
            {/* Visit */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#1b3658]">Visit</h4>
              <ul className="space-y-4 font-light text-gray-600 text-sm">
                <li><Link to="/rooms" className="hover:text-[#937648] transition">Find a hotel</Link></li>
                <li><a href="#" className="hover:text-[#937648] transition">Find a meeting room</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Find a special offer</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Find a restaurant</a></li>
              </ul>
            </div>
            
            {/* Destinations */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#1b3658]">Destinations</h4>
              <ul className="space-y-4 font-light text-gray-600 text-sm">
                <li><a href="#" className="hover:text-[#937648] transition">Asia</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Africa</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Europe</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Middle East</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Pacific</a></li>
              </ul>
            </div>
            
            {/* About */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#1b3658]">About</h4>
              <ul className="space-y-4 font-light text-gray-600 text-sm">
                <li><Link to="/about-us" className="hover:text-[#937648] transition">Discover LuxuryStay</Link></li>
                <li><a href="#" className="hover:text-[#937648] transition">Loyalty</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Central reservations</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Best Rate Guarantee</a></li>
              </ul>
            </div>
            
            {/* Professional */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-[#1b3658]">Professional</h4>
              <ul className="space-y-4 font-light text-gray-600 text-sm">
                <li><a href="#" className="hover:text-[#937648] transition">Development</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Press Room</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Careers</a></li>
                <li><a href="#" className="hover:text-[#937648] transition">Travel professionals</a></li>
              </ul>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;
