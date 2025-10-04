const AuditLog = require('../models/AuditLog');

exports.list = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = await AuditLog.find().sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  res.json(logs);
};

exports.create = async (req, res) => {
  const log = new AuditLog(req.body);
  await log.save();
  res.status(201).json(log);
};
