import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faUsers, faConciergeBell, faCalendarPlus, faClipboardList, faCommentDots, faChartLine, faDoorOpen, faMoneyBillWave, faBroom, faWrench, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Home = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    totalGuests: 0,
    totalStaff: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) setUser(JSON.parse(loggedUser));
  }, []);

  useEffect(() => {
    if (user && user.role !== 'guest') {
      const fetchStats = async () => {
        try {
          const [resData, roomData, userData, staffData] = await Promise.all([
            api.get('/reservations'),
            api.get('/rooms'),
            api.get('/users'),
            api.get('/staff')
          ]);

          const reservations = resData.data;
          const rooms = roomData.data;
          const users = userData.data;
          const staff = staffData.data;

          const totalRevenue = reservations.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
          const availableRooms = rooms.filter(r => r.status === 'available').length;
          const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
          const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
          const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
          const totalGuests = users.filter(u => u.role === 'guest').length;
          const totalStaff = staff.length;

          setStats({
            totalRevenue,
            totalBookings: reservations.length,
            availableRooms,
            occupiedRooms,
            cleaningRooms,
            maintenanceRooms,
            totalGuests,
            totalStaff
          });

          // Prepare chart data (Group revenue by date)
          const last7Days = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days[d.toISOString().split('T')[0]] = { name: d.toLocaleDateString('en-US', { weekday: 'short' }), Revenue: 0, Bookings: 0 };
          }

          reservations.forEach(r => {
            if (r.createdAt) {
              const dateStr = r.createdAt.split('T')[0];
              if (last7Days[dateStr]) {
                last7Days[dateStr].Revenue += (r.paidAmount || 0);
                last7Days[dateStr].Bookings += 1;
              }
            }
          });

          setChartData(Object.values(last7Days));

        } catch (err) {
          console.error("Failed to fetch stats", err);
        }
      };
      fetchStats();
    }
  }, [user]);

  if (!user) return null;
  const isAdmin = user.role !== 'guest';

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.fullName || user.name}!
          </h1>
          <p className="text-gray-300">
            {isAdmin 
              ? "Here's what's happening at your hotel today."
              : "Experience luxury and comfort. Book your stay, manage your reservations, and explore our world-class amenities."}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">${stats.totalRevenue?.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalBookings}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faDoorOpen} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Available Rooms</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.availableRooms}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faBed} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Occupied Rooms</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.occupiedRooms}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Guests</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalGuests}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faBroom} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Cleaning</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.cleaningRooms}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faWrench} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Maintenance</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.maintenanceRooms}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Staff</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalStaff}</h3>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart (Tailwind) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-blue-500" /> Revenue (Last 7 Days)
              </h3>
              <div className="h-64 flex items-end gap-2 justify-between">
                {chartData.map((d, i) => {
                  const maxRev = Math.max(...chartData.map(c => c.Revenue), 1); // prevent division by zero
                  const heightPct = Math.max((d.Revenue / maxRev) * 100, 5); // min 5% height for visibility
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full relative flex justify-center items-end h-48 bg-gray-50 rounded-t-lg">
                        <div 
                          className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 group-hover:bg-blue-600"
                          style={{ height: `${heightPct}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                          ${d.Revenue}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 font-medium">{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bookings Trend (Tailwind) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarPlus} className="text-green-500" /> Bookings (Last 7 Days)
              </h3>
              <div className="h-64 flex items-end gap-2 justify-between">
                {chartData.map((d, i) => {
                  const maxBookings = Math.max(...chartData.map(c => c.Bookings), 1);
                  const heightPct = Math.max((d.Bookings / maxBookings) * 100, 5);
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full relative flex justify-center items-end h-48 bg-gray-50 rounded-t-lg">
                        <div 
                          className="w-full bg-green-500 rounded-t-lg transition-all duration-300 group-hover:bg-green-600"
                          style={{ height: `${heightPct}%` }}
                        ></div>
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                          {d.Bookings} Bookings
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 font-medium">{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Link to="/admin/rooms" className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 mb-4 text-3xl"><FontAwesomeIcon icon={faBed} /></div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Room Management</h2>
              <p className="text-gray-500 text-sm">View inventory, manage pricing, and update room statuses.</p>
            </Link>
            <Link to="/admin/reservations" className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="text-green-600 mb-4 text-3xl"><FontAwesomeIcon icon={faConciergeBell} /></div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Reservations</h2>
              <p className="text-gray-500 text-sm">Handle bookings, check-ins, check-outs, and billing.</p>
            </Link>
            <Link to="/admin/users" className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="text-orange-600 mb-4 text-3xl"><FontAwesomeIcon icon={faUsers} /></div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">User Management</h2>
              <p className="text-gray-500 text-sm">Manage staff roles, admin permissions, and guest profiles.</p>
            </Link>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/rooms" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-blue-600 mb-4 text-3xl"><FontAwesomeIcon icon={faCalendarPlus} /></div>
            <h2 className="text-xl font-semibold mb-2">Book a Room</h2>
            <p className="text-gray-600 text-sm">Browse our luxurious rooms and make a reservation today.</p>
          </Link>
          <Link to="/my-bookings" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-blue-600 mb-4 text-3xl"><FontAwesomeIcon icon={faClipboardList} /></div>
            <h2 className="text-xl font-semibold mb-2">My Bookings</h2>
            <p className="text-gray-600 text-sm">View and manage your upcoming and past stays with us.</p>
          </Link>
          <Link to="/feedback" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="text-blue-600 mb-4 text-3xl"><FontAwesomeIcon icon={faCommentDots} /></div>
            <h2 className="text-xl font-semibold mb-2">Leave Feedback</h2>
            <p className="text-gray-600 text-sm">Share your experience to help us serve you better.</p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
