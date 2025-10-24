const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require('./routes/electionRoutes');
const voterRoutes = require('./routes/voterRoutes');
const voterAuthRoutes = require('./routes/voterAuthRoutes');
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
const systemMonitoringRoutes = require('./routes/systemMonitoringRoutes');
const adminKycRoutes = require('./routes/adminKycRoutes');
const adminAuditRoutes = require('./routes/adminAuditRoutes');

const config = require('./config');
const logger = require('./utils/logger');
const responseMiddleware = require('./middleware/response');
const requestLogger = require('./middleware/requestLogger');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const metrics = require('./utils/metrics');

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// request logging and normalized responses
app.use(requestLogger);
app.use(responseMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/voter-auth', voterAuthRoutes);
app.use("/api/votes", voteRoutes);
app.use('/api/elections', electionRoutes); // includes /overview
app.use('/api/voters', voterRoutes);
app.use('/api/voters/stats', voterStatsRoutes); // alias for dashboard
app.use('/api/admin-profile', adminProfileRoutes);
app.use('/api/results/overview', resultsOverviewRoutes); // dashboard expects this
app.use('/api/results', resultsRoutes);
app.use('/api/config', configRoutes);
// Swagger UI (partial spec)
try {
  // Prefer YAML spec if present (more authorable), otherwise fall back to JSON
  const yamlPath = path.join(__dirname, 'docs', 'openapi.yaml');
  if (require('fs').existsSync(yamlPath)) {
    const yaml = require('js-yaml');
    const openapiYaml = yaml.load(require('fs').readFileSync(yamlPath, 'utf8'));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiYaml));
    // also serve the raw YAML for downloads
    app.get('/api/docs/openapi.yaml', (req, res) => res.sendFile(yamlPath));
  } else {
    const openapi = require('./docs/openapi.json');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  }
} catch (e) {
  logger.warn('Swagger docs not available: %s', e?.message || e);
}
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
app.use('/api/system', systemMonitoringRoutes);
app.use('/api/admin-settings', require('./routes/adminSettingsRoutes'));
app.use('/api/admin/kyc', adminKycRoutes);
app.use('/api/admin/audit', adminAuditRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbConnected = process.env.DB_CONNECTED === 'true' || config.skipDb === false;
  const blockchainMock = process.env.BLOCKCHAIN_MOCK === 'true';
  res.json({ success: true, data: { dbConnected, blockchainMock, env: process.env.NODE_ENV || 'development' }, message: 'health' });
});

// Basic Prometheus-style metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics.metricsText());
});

// Catch-all 404 (must be last)
app.use((req, res) => res.error(404, 'Not found'));

module.exports = app;
