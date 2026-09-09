const Reservation = require('../Model/Reservation');
const Room = require('../Model/Room');
const Billing = require('../Model/Billing');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        // 1. KPI Stats
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ status: 'Available' });
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
        
        // Calculate total revenue from paid reservations
        const reservations = await Reservation.find({ paymentStatus: { $in: ['Paid', 'Partially Paid'] } });
        const totalRevenue = reservations.reduce((sum, res) => sum + (res.paidAmount || 0), 0);

        // 2. Room Status for Doughnut/Pie Chart
        const roomsByStatus = await Room.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const roomStatusData = roomsByStatus.map(r => ({ name: r._id, value: r.count }));

        // 3. Revenue Trend (Monthly) for Line Chart
        // Grouping reservations by month created (or check-in)
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await Reservation.aggregate([
            { 
                $match: { 
                    createdAt: { 
                        $gte: new Date(`${currentYear}-01-01`), 
                        $lte: new Date(`${currentYear}-12-31`) 
                    } 
                } 
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" }
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
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const bookingStatusData = bookingsByStatus.map(b => ({ name: b._id, value: b.count }));

        res.status(200).json({
            kpis: {
                totalRevenue,
                totalRooms,
                availableRooms,
                occupiedRooms,
                occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
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
