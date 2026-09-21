const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  product:  { type:String, required:true },
  category: String,
  zone:     { type:String, required:true },
  price:    { type:Number, required:true },
  unit:     { type:String, default:'kg' },
  trend:    { type:String, enum:['rising','falling','stable'], default:'stable' },
  trendPct: { type:Number, default:0 },
}, { timestamps:true });
schema.index({ product:1, zone:1, createdAt:-1 });
module.exports = mongoose.model('Price', schema);
