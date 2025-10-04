module.exports = function (allowed = []) {
  return function (req, res, next) {
    if (!req.user)
      return res.status(401).json({ message: "Authorization required" });

    const role = req.user.role;
    if (!role)
      return res.status(403).json({ message: "Role required" });

    if (Array.isArray(allowed) && allowed.includes(role))
      return next();

    return res.status(403).json({ message: "Forbidden: insufficient role" });
  };
};
