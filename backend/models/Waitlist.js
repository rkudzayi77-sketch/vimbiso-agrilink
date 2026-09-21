const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name:      { type:String, required:true, trim:true },
  phone:     { type:String, required:true, trim:true },
  role:      { type:String, enum:['buyer','vendor','farmer','delivery','agent'], default:'buyer' },
  zone:      String, notes:String,
  contacted: { type:Boolean, default:false },
}, { timestamps:true });
module.exports = mongoose.model('Waitlist', schema);
