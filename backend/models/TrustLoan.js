const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:           { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  amount:         { type:Number, required:true },
  fee:            { type:Number, required:true },
  totalRepayable: { type:Number, required:true },
  status:         { type:String, enum:['active','repaid','defaulted'], default:'active' },
  reference:      String,
  repaidAt:       Date,
  repaidVia:      String,
}, { timestamps:true });
module.exports = mongoose.model('TrustLoan', schema);
