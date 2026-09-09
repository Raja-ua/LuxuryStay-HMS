import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NotificationsDropdown = ({ userRole, darkTheme = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(`/notifications/role/${userRole || 'admin'}`);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await api.put(`/notifications/role/${userRole || 'admin'}/read-all`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors rounded-full w-12 h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          darkTheme 
            ? 'text-white bg-white/10 hover:bg-white/20 border border-white/20' 
            : 'text-gray-500 hover:text-blue-600 bg-gray-100'
        }`}
      >
        <FontAwesomeIcon icon={faBell} className="text-xl" />
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 flex items-center justify-center shadow-sm transform ${darkTheme ? 'border-gray-800' : 'border-white'}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faCheckDouble} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-300 mb-3 block mx-auto" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div key={notif._id} className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    )}
                    <Link 
                      to={notif.link || '#'} 
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif._id);
                        setIsOpen(false);
                      }}
                      className="block"
                    >
                      <p className="text-sm font-bold text-gray-900 mb-1">{notif.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        {' • '}
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
