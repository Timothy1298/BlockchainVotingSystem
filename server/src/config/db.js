const mongoose = require('mongoose');

/**
 * Connect to MongoDB. For developer convenience this function will not
 * terminate the process on connection failure. Instead it returns a boolean
 * indicating whether the connection succeeded. Set SKIP_DB=true to skip
 * attempting a connection (useful when developing without network access).
 */
const connectDB = async (mongoUri) => {
	if (process.env.SKIP_DB === 'true') {
		console.warn('SKIP_DB is true — skipping MongoDB connection (dev mode)');
		return false;
	}

	try {
		await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB connected');
			// mark that DB is connected for other modules
			process.env.DB_CONNECTED = 'true';
		return true;
	} catch (err) {
		console.error('MongoDB connection failed', err);
		// Don't exit the process in dev; let the server run (endpoints depending on DB may fail).
			process.env.DB_CONNECTED = 'false';
			return false;
	}
};

module.exports = connectDB;