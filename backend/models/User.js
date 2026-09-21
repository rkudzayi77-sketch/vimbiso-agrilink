const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type:String, required:true, trim:true, minlength:2 },
  phone:         { type:String, trim:true, sparse:true },
  email:         { type:String, lowercase:true, trim:true, sparse:true },
  pin:           { type:String, select:false },
  role:          { type:String, enum:['buyer','vendor','farmer','delivery','agent','admin'], default:'buyer' },
  location:      { type:String, trim:true },
  zone:          { type:String, default:'Harare East' },
  lat:           Number,
  lng:           Number,
  avatar:        { type:String, default:'' },
  trustScore:    { type:Number, default:50, min:0, max:100 },
  authProvider:  { type:String, enum:['phone','google','linked'], default:'phone' },
  googleId:      { type:String, sparse:true },
  isActive:      { type:Boolean, default:true },
  isOnline:      { type:Boolean, default:false },
  lastSeen:      { type:Date, default:Date.now },
  walletBalance: { type:Number, default:0 },
  escrowBalance: { type:Number, default:0 },
  totalTransactions: { type:Number, default:0 },
  avgRating:     { type:Number, default:0 },
  ratings:       [{ fromUser:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, score:Number, comment:String, createdAt:{type:Date,default:Date.now} }],
  referralCode:  { type:String, unique:true, sparse:true },
  referredBy:    { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  gpsShared:     { type:Boolean, default:true },
}, { timestamps:true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('pin') || !this.pin) return next();
  this.pin = await bcrypt.hash(this.pin, 12);
  next();
});
userSchema.pre('save', function(next) {
  if (!this.referralCode) this.referralCode = `VB${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  next();
});
userSchema.methods.comparePin    = function(pin) { return bcrypt.compare(pin, this.pin); };
userSchema.methods.updateRating  = function() {
  if (!this.ratings.length) { this.avgRating=0; return; }
  this.avgRating = +(this.ratings.reduce((s,r)=>s+r.score,0)/this.ratings.length).toFixed(1);
};
module.exports = mongoose.model('User', userSchema);
