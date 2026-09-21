const Listing = require('../models/Listing');
const { ok, fail, paged } = require('../utils/response');

exports.getAll = async (req,res,next) => {
  try {
    const { zone,category,search,page=1,limit=20 } = req.query;
    const filter = { active:true, draft:false, expiresAt:{ $gt:new Date() } };
    if (zone)     filter.zone = zone;
    if (category) filter.category = category;
    if (search)   filter.product = { $regex:search, $options:'i' };
    const total    = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter).populate('vendor','name trustScore location avgRating').sort({ createdAt:-1 }).skip((page-1)*limit).limit(+limit);
    paged(res,listings,total,page,limit);
  } catch(e){ next(e); }
};

exports.getOne = async (req,res,next) => {
  try {
    const l = await Listing.findById(req.params.id).populate('vendor','name trustScore location avgRating phone');
    if (!l) return fail(res,'Listing not found',404);
    l.views++; await l.save({ validateBeforeSave:false });
    ok(res,{ listing:l });
  } catch(e){ next(e); }
};

exports.create = async (req,res,next) => {
  try {
    const images = req.files ? req.files.map(f=>`/uploads/${f.filename}`) : [];
    const listing = await Listing.create({ ...req.body, vendor:req.user._id, images });
    req.io?.to(`zone_${listing.zone}`).emit('new_listing', listing);
    ok(res,{ listing },'Listing created',201);
  } catch(e){ next(e); }
};

exports.update = async (req,res,next) => {
  try {
    const l = await Listing.findOne({ _id:req.params.id, vendor:req.user._id });
    if (!l) return fail(res,'Not found or not yours',404);
    Object.assign(l, req.body); await l.save();
    ok(res,{ listing:l });
  } catch(e){ next(e); }
};

exports.remove = async (req,res,next) => {
  try {
    const l = await Listing.findOneAndDelete({ _id:req.params.id, vendor:req.user._id });
    if (!l) return fail(res,'Not found or not yours',404);
    ok(res,null,'Listing deleted');
  } catch(e){ next(e); }
};

exports.mine = async (req,res,next) => {
  try {
    const listings = await Listing.find({ vendor:req.user._id }).sort({ createdAt:-1 });
    ok(res,{ listings, total:listings.length });
  } catch(e){ next(e); }
};
