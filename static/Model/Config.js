// TEST
var LOCATION_TO_CONFIG = {
  'NYC' : {
    LABEL : 'New York',
    LAMBDA_PREFIX : 'lambdas-dev-',
    USER_POOL_ID : 'us-east-1_kNYzIyhAX',
    CLIENT_ID : '5hirip2bfagqf5pq0gflihm13b',
    REGION : 'us-east-1',
    BASE_URL : 'https://hu5jvdm5og.execute-api.us-east-1.amazonaws.com/dev/ga_joad'
  },
  'BAT' : {
    LABEL : 'Baton Rouge',
    LAMBDA_PREFIX : 'bat-lambdas-dev-',
    USER_POOL_ID : 'us-east-1_fZoq8nxqE',
    CLIENT_ID : '7k2176f9rkpi6tc2rjkedam629',
    REGION : 'us-east-1',
    BASE_URL : 'https://vp06nqppn2.execute-api.us-east-1.amazonaws.com/dev/bat_ga_joad'
  }
};

// PROD
// var LOCATION_TO_CONFIG = {
//   'NYC' : {
//   LAMBDA_PREFIX : 'ga-joad-test-',
//   USER_POOL_ID : 'us-east-2_u3RdxUhfs',
//   CLIENT_ID : '74ebtt8auj6tn13fk9s8p0sbf',  // from userpool creation
//   REGION : 'us-east-2',
//   BASE_URL : 'https://ekk7z8zq70.execute-api.us-east-2.amazonaws.com/test/ga_joad'
//   },
//   'BAT' : {
//
//   }
// }

var Config = {
  location : 'NYC',
  location_to_cfg : LOCATION_TO_CONFIG,
  // copy over location-specific cfgs into central cfg
  set_config : function() {
      var cfg_by_location = LOCATION_TO_CONFIG[Config.location];
      for (cfg in cfg_by_location) {
          Config[cfg] = cfg_by_location[cfg];
      }
  }
};

module.exports = Config;

// EC2 ID i-072c93b58b0616313
