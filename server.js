const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connect_db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./Routes/userRoutes');
const roomRoutes = require('./Routes/roomRoutes');
const reservationRoutes = require('./Routes/reservationRoutes');
const billingRoutes = require('./Routes/billingRoutes');

const feedbackRoutes = require('./Routes/feedbackRoutes');
const staffRoutes = require('./Routes/staffRoutes');
const roleRoutes = require('./Routes/roleRoutes');
const contactRoutes = require('./Routes/contactRoutes');

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/billings', billingRoutes);

app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'LuxuryStay API is running' });
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    connectDB().then(() => {
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    });
}

module.exports = app;
