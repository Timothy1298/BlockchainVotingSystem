const SystemLog = require('../models/SystemLog');

exports.list = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = await SystemLog.find().sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  res.json(logs);
};
