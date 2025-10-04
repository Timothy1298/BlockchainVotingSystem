const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require('./routes/electionRoutes');
const voterRoutes = require('./routes/voterRoutes');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const resultsOverviewRoutes = require('./routes/resultsOverviewRoutes');
const configRoutes = require('./routes/configRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const txRoutes = require('./routes/txRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const systemLogRoutes = require('./routes/systemLogRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const validateRoutes = require('./routes/validateRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const supportRoutes = require('./routes/supportRoutes');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const candidateOverviewRoutes = require('./routes/candidateOverviewRoutes');
const voterStatsRoutes = require('./routes/voterStatsRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/votes", voteRoutes);
app.use('/api/elections', electionRoutes); // includes /overview
app.use('/api/voters', voterRoutes);
app.use('/api/voters/stats', voterStatsRoutes); // alias for dashboard
app.use('/api/admin-profile', adminProfileRoutes);
app.use('/api/results/overview', resultsOverviewRoutes); // dashboard expects this
app.use('/api/results', resultsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tx', txRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/logs/audit', auditLogRoutes); // alias for dashboard
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-logs', systemLogRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/validate', validateRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/candidates/overview', candidateOverviewRoutes); // alias
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Catch-all 404 (must be last)
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

module.exports = app;
