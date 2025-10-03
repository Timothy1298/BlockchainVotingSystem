const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require('./routes/electionRoutes');
const voterRoutes = require('./routes/voterRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const configRoutes = require('./routes/configRoutes');
const txRoutes = require('./routes/txRoutes');

const app = express();
app.use(express.json());
app.use(cors());


app.use('/api/auth', authRoutes);
app.use("/api/votes", voteRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tx', txRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));


module.exports = app;