'use strict';

angular.module('martaioApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/station/:station', {
          controller: 'StationCtrl',
          templateUrl: 'partials/station'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);
  }).filter("jsUnique", function () {
    return function (input, key) {
      return _.values(_.indexBy(input.reverse(), key));
    };
  // roughly guesstimated by just passing them all through google's
  // geocoding service
  }).constant('stationLocations', {
    "midtown station":{
      "lat":33.780737,
      "lng":-84.386657
    },
    "indian creek station":{
      "lat":33.7489954,
      "lng":-84.3879824
    },
    "garnett station":{
      "lat":33.748938,
      "lng":-84.395513
    },
    "college park station":{
      "lat":33.6513813,
      "lng":-84.4470162
    },
    "ashby station":{
      "lat":33.756289,
      "lng":-84.41755599999999
    },
    "five points station":{
      "lat":33.754061,
      "lng":-84.391539
    },
    "airport station":{
      "lat":33.639975,
      "lng":-84.44403199999999
    },
    "sandy springs station":{
      "lat":33.9321044,
      "lng":-84.3513524
    },
    "lindbergh station":{
      "lat":33.823698,
      "lng":-84.369248
    },
    "lakewood station":{
      "lat":33.700649,
      "lng":-84.429541
    },
    "chamblee station":{
      "lat":33.8879695,
      "lng":-84.30468049999999
    },
    "king memorial station":{
      "lat":33.749468,
      "lng":-84.37601099999999
    },
    "east lake station":{
      "lat":33.765062,
      "lng":-84.31261099999999
    },
    "vine city station":{
      "lat":33.756612,
      "lng":-84.404348
    },
    "buckhead station":{
      "lat":33.847874,
      "lng":-84.367296
    },
    "lenox station":{
      "lat":33.845137,
      "lng":-84.357854
    },
    "civic center station":{
      "lat":33.766245,
      "lng":-84.38750399999999
    },
    "arts center station":{
      "lat":33.789283,
      "lng":-84.387125
    },
    "west end station":{
      "lat":33.73584,
      "lng":-84.412967
    },
    "dunwoody station":{
      "lat":33.9486029,
      "lng":-84.355848
    },
    "omni dome station":{
      "lat":33.7489954,
      "lng":-84.3879824
    },
    "oakland city station":{
      "lat":33.71726400000001,
      "lng":-84.42527899999999
    },
    "east point station":{
      "lat":33.676609,
      "lng":-84.440595
    },
    "doraville station":{
      "lat":33.9026881,
      "lng":-84.28025099999999
    },
    "brookhaven station":{
      "lat":33.859928,
      "lng":-84.33922
    },
    "decatur station":{
      "lat":33.774455,
      "lng":-84.297131
    },
    "medical center station":{
      "lat":33.9106263,
      "lng":-84.3513751
    },
    "georgia state station":{
      "lat":33.749732,
      "lng":-84.38569700000001
    },
    "avondale station":{
      "lat":33.77533,
      "lng":-84.280715
    },
    "inman park station":{
      "lat":33.757317,
      "lng":-84.35262
    },
    "kensington station":{
      "lat":33.772472,
      "lng":-84.252236
    },
    "edgewood candler park station":{
      "lat":33.761812,
      "lng":-84.340064
    },
    "peachtree center station":{
      "lat":33.759532,
      "lng":-84.387564
    },
    "north ave station":{
      "lat":33.771696,
      "lng":-84.387411
    }
  });