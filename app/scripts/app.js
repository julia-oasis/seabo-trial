'use strict';

/**
 * @ngdoc overview
 * @name seaboApp
 * @description
 * # seaboApp
 *
 * Main module of the application.
 */
var app = angular.module('seaboApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ]);

app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/collections', {
        templateUrl: 'views/collections.html',
        controller: 'CollectionsCtrl',
        controllerAs: 'colls'
      })
      .when('/collections/:id', {
        templateUrl: 'views/collection.html',
        controller: 'CollectionCtrl',
        controllerAs: 'coll'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

app.factory('ListsDataFactory', function($rootScope, $document, $http) {
  var listsDataFactory = {};
  var processList = function(result) {
        var list = {};
        list.title = result.title;
        list.thumbnail = result.identifier.value;
        var collections = [];
        //$rootScope.repositories = {};
        var id = 1;
        angular.forEach(result.listItem.slice(1), function(listItem) {
            var collection = {};
            angular.forEach(listItem, function(item, itemType) {
                if (itemType === 'externalWebsite') {
                    collection.title = item.title;
                    collection.id = id;
                    if (angular.isArray(item.identifier)) {
                        collection.url = item.identifier[0].value;
                    } else {
                        collection.url = item.identifier.value;
                    }
                    if (collection.url.match(/nuc\%3A([A-Z\%30-9\*]+)/)) {
                      var nuc = collection.url.match(/nuc\%3A([A-Z\%0-9\*]+)/)[1];
                      collection.nuc = nuc.replace('%3A', ':').replace('%5C', '').replace('%29', '').replace(':*', '');
                    //} else if (collection.url.match(/vendor%3AVVCO/)) {
                      //collection.nuc = 'VVCO';
                      //$rootScope.repositories.VVCO = 'Victorian Collections';
                    //}
                    //if (typeof collection.nuc !== 'undefined' && collection.nuc !== 'VVCO') {
                    //    $http.jsonp('http://api.trove.nla.gov.au/contributor/' + collection.nuc + '?encoding=json&key=8dirgt7b3oj0vqd4&callback=JSON_CALLBACK', {cache: true})
                     //     .then(function successCallback(response) {
                     //       $rootScope.repositories[collection.nuc] = response.data.contributor.name.replace(/\.$/, '');
                      //  });
                    }
                } else if (itemType === 'note') {
                    collection.note = item;
                    id++;
                }
            });
            collections.push(collection);
        });
        $rootScope.collections = collections;
    };
  listsDataFactory.getPromise = function() {
    console.log('Getting list...');
    var promise = $http.jsonp('http://api.trove.nla.gov.au/list/78794?encoding=json&reclevel=full&include=listItems&key=8dirgt7b3oj0vqd4&callback=JSON_CALLBACK', {cache: true});
    return promise;
  };
  listsDataFactory.loadResources = function(response) {
    $rootScope.repositories = {
      'VVCO': 'Victorian Collections',
      'SFU:SC': 'Flinders University. Flinders University Library Special Collections',
      'QPQ': 'Unknown library code: QPQ',
      'ANL': 'National Library of Australia',
      'VFED:IR': 'Federation University Australia Library. FedUni Research Online',
      'QSA': 'Queensland State Archives','QUT:DC':'Queensland University of Technology. Digital Collections',
      'VSWT': 'Swinburne University of Technology. Swinburne Library',
      'QU:IR': 'University of Queensland. University of Queensland Library. University of Queensland: Institutional Repository',
      'VSL': 'State Library Victoria',
      'QSL': 'State Library of Queensland',
      'APC:WC': 'Australian Paralympic Committee. Images on Wikimedia Commons',
      'NMMU:C': 'Australian National Maritime Museum. Australian National Maritime Museum Collection',
      'NWU': 'University of Wollongong. University of Wollongong Library',
      'VS:PUB': 'CSIRO Publishing. scienceimage',
      'QFSP': 'Flinders Shire Council. Flinders Shire Council Historical Photograph Collection',
      'YUF': 'Flickr',
      'XNLS': 'Northern Territory Library ',
      'VDU:IR': 'Deakin University. Deakin University Library. Deakin University: Institutional Repository'};
    processList(response.data.list[0]);
  };
  return listsDataFactory;
});

app.filter('findById', function() {
  return function(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (+list[i].id === +id) {
        return list[i];
      }
    }
  };
});
