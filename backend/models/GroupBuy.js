const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  organizer:  { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  product:    { type:String, required:true },
  targetQty:  { type:Number, required:true },
  unitPrice:  { type:Number, required:true },
  zone:       String,
  deadline:   { type:Date, required:true },
  members:    [{ user:{ type:mongoose.Schema.Types.ObjectId, ref:'User' }, joinedAt:{ type:Date, default:Date.now } }],
  status:     { type:String, enum:['open','filled','completed','cancelled'], default:'open' },
  savings:    { type:Number, default:15 },
}, { timestamps:true });
module.exports = mongoose.model('GroupBuy', schema);
