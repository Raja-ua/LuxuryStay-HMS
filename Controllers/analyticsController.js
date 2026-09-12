const Reservation = require('../Model/Reservation');
const Room = require('../Model/Room');
const Billing = require('../Model/Billing');
const ServiceRequest = require('../Model/ServiceRequest');
const User = require('../Model/User');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // 1. KPI Stats
        const reservationsWithPayment = await Reservation.find({ paymentStatus: { $in: ['Paid', 'Partially Paid'] } });
        const totalRevenue = reservationsWithPayment.reduce((sum, res) => sum + (res.paidAmount || 0), 0);

        const pendingBookings = await Reservation.countDocuments({ status: 'pending' });

        const todaysCheckIns = await Reservation.countDocuments({
            status: 'confirmed',
            checkInDate: { $gte: todayStart, $lte: todayEnd }
        });

        const todaysCheckOuts = await Reservation.countDocuments({
            status: 'checked-in',
            checkOutDate: { $gte: todayStart, $lte: todayEnd }
        });

        const pendingServiceRequests = await ServiceRequest.countDocuments({ status: { $regex: /^pending$/i } });

        const roomsToClean = await Room.countDocuments({ cleaningStatus: { $in: ['Dirty', 'Cleaning'] } });
        
        // Handle potential case-insensitivity of status
        const maintenanceRooms = await Room.countDocuments({ status: { $regex: /^maintenance$/i } });

        const totalGuests = await User.countDocuments({ role: 'guest' });

        // 2. Room Status for Doughnut/Pie Chart
        const roomsByStatus = await Room.aggregate([
            { $group: { _id: { $toLower: '$status' }, count: { $sum: 1 } } }
        ]);
        const roomStatusData = roomsByStatus.map(r => ({ name: r._id.charAt(0).toUpperCase() + r._id.slice(1), value: r.count }));

        // 3. Revenue Trend (Monthly) for Line Chart
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await Reservation.aggregate([
            { 
                $match: { 
                    createdAt: { 
                        $gte: new Date(`${currentYear}-01-01`), 
                        $lte: new Date(`${currentYear}-12-31`) 
                    },
                    paymentStatus: { $in: ['Paid', 'Partially Paid'] }
                } 
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$paidAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueTrendData = months.map((month, index) => {
            const found = monthlyRevenue.find(m => m._id === index + 1);
            return {
                name: month,
                Revenue: found ? found.revenue : 0
            };
        });

        // 4. Booking Status
        const bookingsByStatus = await Reservation.aggregate([
            { $group: { _id: { $toLower: '$status' }, count: { $sum: 1 } } }
        ]);
        const bookingStatusData = bookingsByStatus.map(b => ({ name: b._id.charAt(0).toUpperCase() + b._id.slice(1), value: b.count }));

        res.status(200).json({
            kpis: {
                totalRevenue,
                pendingBookings,
                todaysCheckIns,
                todaysCheckOuts,
                pendingServiceRequests,
                roomsToClean,
                maintenanceRooms,
                totalGuests
            },
            charts: {
                roomStatusData,
                revenueTrendData,
                bookingStatusData
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
};
