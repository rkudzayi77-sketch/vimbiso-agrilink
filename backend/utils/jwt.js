const jwt = require('jsonwebtoken');
exports.signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE||'30d' });
exports.sendToken = (user, status, res) => {
  const token = exports.signToken(user._id);
  const u = user.toObject(); delete u.pin; delete u.otp; delete u.otpExpiry;
  res.status(status).json({ success:true, token, data:{ user:u } });
};
