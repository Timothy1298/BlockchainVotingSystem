const mongoose = require('mongoose');

/**
 * Connect to MongoDB. For developer convenience this function will not
 * terminate the process on connection failure. Instead it returns a boolean
 * indicating whether the connection succeeded. Set SKIP_DB=true to skip
 * attempting a connection (useful when developing without network access).
 */
const connectDB = async (mongoUri, opts = {}) => {
	if (process.env.SKIP_DB === 'true') {
		console.warn('SKIP_DB is true — skipping MongoDB connection (dev mode)');
		return false;
	}

	const maxAttempts = opts.maxAttempts || 5;
	const baseDelay = opts.baseDelay || 1000; // ms

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
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
			console.error(`MongoDB connection attempt ${attempt} failed:`, err?.message || err);
			if (attempt === maxAttempts) {
				console.error('MongoDB connection failed (max attempts reached)');
				process.env.DB_CONNECTED = 'false';
				return false;
			}
			const delay = Math.min(10000, baseDelay * Math.pow(2, attempt - 1));
			console.log(`Retrying MongoDB connection in ${delay}ms...`);
			// eslint-disable-next-line no-await-in-loop
			await new Promise(r => setTimeout(r, delay));
		}
	}
	// should not reach here
	process.env.DB_CONNECTED = 'false';
	return false;
};

module.exports = connectDB;