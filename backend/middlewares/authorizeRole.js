const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Wenn keine Rolle im Request-Objekt vorhanden ist, den Zugriff verweigern
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden Access with this users role!" });
    }
    next();
  };
};

module.exports = authorizeRole;
