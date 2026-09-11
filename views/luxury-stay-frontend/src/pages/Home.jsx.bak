import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faUsers, faConciergeBell, faCalendarPlus, faClipboardList, faCommentDots, faChartLine, faDoorOpen, faMoneyBillWave, faBroom, faWrench, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Home = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    totalGuests: 0,
    totalStaff: 0
  });
  
  const [charts, setCharts] = useState({
    revenueTrendData: [],
    roomStatusData: [],
    bookingStatusData: []
  });

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) setUser(JSON.parse(loggedUser));
  }, []);

  useEffect(() => {
    if (user && user.role !== 'guest') {
      const fetchStats = async () => {
        try {
          const [analyticsRes, userData, staffData] = await Promise.all([
            api.get('/analytics'),
            api.get('/users'),
            api.get('/staff')
          ]);

          const { kpis, charts: chartsData } = analyticsRes.data;
          const users = userData.data;
          const staff = staffData.data;

          setStats({
            totalRevenue: kpis.totalRevenue || 0,
            totalBookings: chartsData.bookingStatusData.reduce((acc, curr) => acc + curr.value, 0),
            availableRooms: kpis.availableRooms || 0,
            occupiedRooms: kpis.occupiedRooms || 0,
            occupancyRate: kpis.occupancyRate || 0,
            cleaningRooms: (chartsData.roomStatusData.find(r => r.name === 'Cleaning') || {}).value || 0,
            maintenanceRooms: (chartsData.roomStatusData.find(r => r.name === 'Maintenance') || {}).value || 0,
            totalGuests: users.filter(u => u.role === 'guest').length,
            totalStaff: staff.length
          });

          setCharts({
            revenueTrendData: chartsData.revenueTrendData || [],
            roomStatusData: chartsData.roomStatusData || [],
            bookingStatusData: chartsData.bookingStatusData || []
          });

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
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user.fullName || user.name}!
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            {isAdmin 
              ? "Here's what's happening at your hotel today."
              : "Experience luxury and comfort. Book your stay, manage your reservations, and explore our world-class amenities."}
          </p>
        </div>
        <div className="self-end md:self-auto">
          <NotificationsDropdown userRole={user.role?.toLowerCase() || ''} darkTheme={true} />
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
            
            {/* Revenue Trend Line Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-blue-500" /> Monthly Revenue Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.revenueTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Room Status Doughnut Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faDoorOpen} className="text-indigo-500" /> Room Occupancy Overview
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.roomStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
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
