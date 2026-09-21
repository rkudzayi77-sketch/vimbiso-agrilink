const Waitlist    = require('../models/Waitlist');
const { ok, fail, paged } = require('../utils/response');
exports.submit        = async (req,res,next) => { try { ok(res,{ entry: await Waitlist.create(req.body) },'Added to waitlist',201); } catch(e){ next(e); } };
exports.getAll        = async (req,res,next) => { try { const {page=1,limit=50}=req.query; const total=await Waitlist.countDocuments(); const entries=await Waitlist.find().sort({createdAt:-1}).skip((page-1)*limit).limit(+limit); paged(res,entries,total,page,limit); } catch(e){ next(e); } };
exports.markContacted = async (req,res,next) => { try { const e=await Waitlist.findByIdAndUpdate(req.params.id,{contacted:true},{new:true}); if(!e)return fail(res,'Not found',404); ok(res,{entry:e}); } catch(e){ next(e); } };
exports.remove        = async (req,res,next) => { try { await Waitlist.findByIdAndDelete(req.params.id); ok(res,null,'Removed'); } catch(e){ next(e); } };
