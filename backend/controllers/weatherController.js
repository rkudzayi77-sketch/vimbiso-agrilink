const { ok } = require('../utils/response');
exports.getForecast = async (req,res,next) => {
  try {
    const { zone='Harare' } = req.query;
    // Replace with OpenWeatherMap API call in production
    ok(res,{ forecast:{
      zone, current:{ temp:24, condition:'Partly Cloudy', humidity:72, rainChance:20, windSpeed:'12km/h', uvIndex:'High' },
      advisory:'Good day for foliar fertilizers. Complete field work before 10am due to high UV.',
      days:[
        { day:'Today',icon:'⛅',high:26,low:18,rain:'20%' },
        { day:'Thu',  icon:'🌧',high:22,low:16,rain:'75%' },
        { day:'Fri',  icon:'🌤',high:25,low:17,rain:'10%' },
        { day:'Sat',  icon:'☀',high:28,low:18,rain:'5%'  },
        { day:'Sun',  icon:'☀',high:29,low:19,rain:'5%'  },
      ],
      pestAlerts:[
        { pest:'Aphids',zone:'Mazowe',severity:'Moderate',action:'Apply neem oil solution' },
        { pest:'Blight Risk',zone:'Harare East',severity:'Low',action:'Monitor leaf colour' },
      ],
    }});
  } catch(e){ next(e); }
};
