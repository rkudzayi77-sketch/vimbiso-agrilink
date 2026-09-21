const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success:false, message:'Not authorized — no token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-pin -otp -otpExpiry');
    if (!req.user)           return res.status(401).json({ success:false, message:'User not found' });
    if (!req.user.isActive)  return res.status(401).json({ success:false, message:'Account deactivated' });
    next();
  } catch { return res.status(401).json({ success:false, message:'Invalid or expired token' }); }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:`Role '${req.user.role}' not authorized` });
  next();
};
