require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');


const PORT = process.env.PORT || 5000;

(async () => {
	const connected = await connectDB(process.env.MONGO_URI);
	if (!connected) {
		console.warn('Continuing to start server without MongoDB connection (dev mode)');
	}

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();