const Price     = require('../models/Price');
const { ok }    = require('../utils/response');
exports.getFair = async (req,res,next) => {
  try {
    const { zone='Harare East' } = req.query;
    const prices = await Price.aggregate([{ $match:{ zone } },{ $sort:{ createdAt:-1 } },{ $group:{ _id:'$product', avgPrice:{ $avg:'$price' }, latestPrice:{ $first:'$price' }, trend:{ $first:'$trend' }, trendPct:{ $first:'$trendPct' }, unit:{ $first:'$unit' } } }]);
    ok(res,{ prices, zone });
  } catch(e){ next(e); }
};
exports.getDemand = async (_,res,next) => {
  try {
    const heatmap = [
      { zone:'Chitungwiza', product:'Cooking Oil', level:'CRITICAL', searches:47, color:'#EF4444' },
      { zone:'Mbare',       product:'Maize Meal',  level:'HIGH',     searches:89, color:'#F97316' },
      { zone:'Highfield',   product:'Cabbage',     level:'MEDIUM',   searches:34, color:'#F59E0B' },
    ];
    ok(res,{ heatmap });
  } catch(e){ next(e); }
};
