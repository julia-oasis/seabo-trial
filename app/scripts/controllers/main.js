'use strict';

/**
 * @ngdoc function
 * @name seaboApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the seaboApp
 */
angular.module('seaboApp')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, ListsDataFactory) {
      $document.scrollTop(0);
    var getRandomSubarray = function(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    };
    var getRandomCollection = function() {
        var collection = $rootScope.collections[Math.floor(Math.random()*$rootScope.collections.length)];
        var query = collection.url.match(/\?(.*)$/)[1];
        $http.jsonp('http://api.trove.nla.gov.au/result?' + query + '&zone=picture&encoding=json&key=8dirgt7b3oj0vqd4&callback=JSON_CALLBACK', {cache: true})
              .then(function successCallback(response) {
                console.log(response);
                var total = response.data.response.zone[0].records.total;
                $scope.total = total;
                var start = [Math.floor(Math.random()*$scope.total)];
                if ((total > 100) && ((total - 100) < start)) {
                    start = total - 100;
                }
                $http.jsonp('http://api.trove.nla.gov.au/result?' + query + '&s=' + start + '&n=100&zone=picture&encoding=json&key=8dirgt7b3oj0vqd4&callback=JSON_CALLBACK', {cache: true})
                        .then(function successCallback(response) {
                            var pictures = response.data.response.zone[0].records.work;
                            var sample = getRandomSubarray(pictures, 24);
                            var images = [];
                            angular.forEach(sample, function(picture) {
                                var image = {};
                                image.title = picture.title;
                                angular.forEach(picture.identifier, function(link) {
                                    if (link.linktype === 'thumbnail') {
                                      image.thumbnail = link.value;
                                    } else if (link.linktype === 'fulltext') {
                                      image.fulltext = link.value;
                                      if (typeof link.linktext !== 'undefined') {
                                        image.linktext = link.linktext;
                                      }
                                    }
                                });
                                images.push(image);
                            });
                            $scope.images = images;
                        });
            });
        $scope.collection = collection;
      };
      if (typeof $rootScope.collections === 'undefined' && $rootScope.failed !== true) {
        var tries = 1;
        var loadListData = function() {
          var promise = ListsDataFactory.getPromise();
          promise.then(
            function successCallback(response) {
              ListsDataFactory.loadResources(response);
              getRandomCollection();
            },
            function errorCallback() {
              if (tries < 1) {
                tries++;
                loadListData();
              } else {
                //$rootScope.listHide = false;
                $rootScope.failed = true;
              }
            }
          );
        };
        loadListData();
      } else {
        getRandomCollection();
      }
    }
  ]);
