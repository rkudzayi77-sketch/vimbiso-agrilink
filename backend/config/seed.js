require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Listing  = require('../models/Listing');
const Price    = require('../models/Price');
const Waitlist = require('../models/Waitlist');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vimbiso_agrilink');
    console.log('🌱 Seeding database…');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Price.deleteMany({});
    await Waitlist.deleteMany({});

    const users = await User.create([
      { name:'Tatenda Moyo',   phone:'+263771234561', pin:'1234', role:'buyer',    location:'Avondale',    zone:'Harare East', trustScore:72  },
      { name:'Mainini Chipo',  phone:'+263771234562', pin:'1234', role:'vendor',   location:'Mbare Market',zone:'Mbare',       trustScore:89  },
      { name:'Sekuru Musa',    phone:'+263771234563', pin:'1234', role:'farmer',   location:'Mazowe Farm', zone:'Mazowe',      trustScore:94  },
      { name:'Tendai Rider',   phone:'+263771234564', pin:'1234', role:'delivery', location:'Highfield',   zone:'Highfield',   trustScore:85, isOnline:true },
      { name:'Blessing Nkosi', phone:'+263771234565', pin:'1234', role:'agent',    location:'Chitungwiza', zone:'Chitungwiza', trustScore:91  },
      { name:'Admin Vimbiso',  phone:'+263771234566', pin:'1234', role:'admin',    location:'Harare CBD',  zone:'CBD',         trustScore:99  },
    ]);
    console.log('✅ Users created');

    const [,vendor,farmer] = users;
    await Listing.create([
      { vendor:vendor._id, product:'Fresh Tomatoes',  category:'Vegetables', price:1.20, unit:'kg',    quantity:80,  location:'Mbare Market',zone:'Mbare',  images:['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300'] },
      { vendor:vendor._id, product:'Cooking Oil',      category:'Oils',       price:2.10, unit:'litre', quantity:40,  location:'Mbare Market',zone:'Mbare',  images:['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300'] },
      { vendor:farmer._id, product:'White Maize Meal', category:'Grains',     price:0.85, unit:'kg',    quantity:200, location:'Mazowe Farm', zone:'Mazowe', images:['https://images.unsplash.com/photo-1601593768799-76d5a16ca23d?w=300'] },
      { vendor:farmer._id, product:'Fresh Bananas',    category:'Fruits',     price:0.60, unit:'kg',    quantity:120, location:'Mazowe Farm', zone:'Mazowe', images:['https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300'] },
      { vendor:vendor._id, product:'Cabbages',         category:'Vegetables', price:0.80, unit:'kg',    quantity:60,  location:'Mbare Market',zone:'Mbare',  images:['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300'] },
    ]);
    console.log('✅ Listings created');

    await Price.create([
      { product:'Tomatoes',    category:'Vegetables', zone:'Harare East', price:1.20, unit:'kg',    trend:'rising',  trendPct:8  },
      { product:'Maize Meal',  category:'Grains',     zone:'Harare East', price:0.85, unit:'kg',    trend:'stable',  trendPct:0  },
      { product:'Cooking Oil', category:'Oils',       zone:'Harare East', price:2.10, unit:'litre', trend:'stable',  trendPct:0  },
      { product:'Cabbage',     category:'Vegetables', zone:'Harare East', price:0.80, unit:'kg',    trend:'falling', trendPct:-3 },
      { product:'Bananas',     category:'Fruits',     zone:'Harare East', price:0.60, unit:'kg',    trend:'rising',  trendPct:4  },
    ]);
    console.log('✅ Prices seeded');

    await Waitlist.create([
      { name:'Farai Dube',  phone:'+263770001111', role:'vendor', zone:'Mbare'  },
      { name:'Kudzai Tafa', phone:'+263770002222', role:'farmer', zone:'Mazowe' },
    ]);
    console.log('✅ Waitlist seeded');
    console.log('\n🎉 Seed complete!');
    console.log('Demo logins (all PIN: 1234):');
    users.forEach(u => console.log(`  ${u.role.padEnd(10)} → ${u.phone}`));
    process.exit(0);
  } catch(err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}
seed();
