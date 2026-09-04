const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns')
dns.setServers(['1.1.1.1', '8.8.8.8'])

const getAtlasDnsFallback = (uri) => {
    const parsedUri = new URL(uri);

    if (parsedUri.protocol !== 'mongodb+srv:' || parsedUri.hostname !== 'cluster0.obxkuws.mongodb.net') {
        return null;
    }

    // This bypasses a local DNS resolver that refuses MongoDB SRV queries.
    // Credentials still come from the MONGO value in .env.
    return `mongodb://${parsedUri.username}:${parsedUri.password}@ac-t1hpffy-shard-00-00.obxkuws.mongodb.net:27017,ac-t1hpffy-shard-00-01.obxkuws.mongodb.net:27017,ac-t1hpffy-shard-00-02.obxkuws.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-w5xpyq-shard-0&retryWrites=true&w=majority&appName=Cluster0`;
};

const connectDB = async () => {
    if (!process.env.MONGO) {
        console.error('MongoDB connection failed: MONGO is missing from .env');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO, { serverSelectionTimeoutMS: 10000 });
        console.log('DB Connected');
    } catch (error) {
        const fallbackUri = error.code === 'ECONNREFUSED' && error.syscall === 'querySrv'
            ? getAtlasDnsFallback(process.env.MONGO)
            : null;

        if (!fallbackUri) {
            console.error('MongoDB connection failed:', error.message);
            return;
        }

        try {
            await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
            console.log('DB Connected ');
        } catch (fallbackError) {
            console.error('MongoDB connection failed:', fallbackError.message);
        }
    }
};

module.exports = connectDB;
