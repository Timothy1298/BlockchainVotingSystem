const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  const { admin } = req.query;
  if (admin === 'true') {
    const all = await Notification.find().sort({ createdAt: -1 });
    return res.json(all);
  }
  const last5 = await Notification.find().sort({ createdAt: -1 }).limit(5);
  res.json(last5);
};

exports.create = async (req, res) => {
  const n = new Notification(req.body);
  await n.save();
  res.status(201).json(n);
};

exports.delete = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
