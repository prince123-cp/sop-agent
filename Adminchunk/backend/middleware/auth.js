// Placeholder admin authentication middleware
const adminAuth = (req, res, next) => {
  // TODO: Implement proper authentication (e.g., JWT, session-based)
  // For now, assume all requests are from admin
  const isAdmin = true; // Placeholder

  if (isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

export default adminAuth;
