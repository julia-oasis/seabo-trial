'use strict';

/**
 * @ngdoc function
 * @name seaboApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the seaboApp
 */
angular.module('seaboApp')
  .controller('CollectionsCtrl', ['$scope', '$rootScope', '$routeParams', '$document', '$filter', '$http', '$q', 'ListsDataFactory', function ($scope, $rootScope, $routeParams, $document, $filter, $http, $q, ListsDataFactory) {
      $document.scrollTop(0);
      if (typeof $rootScope.collections === 'undefined' && $rootScope.failed !== true) {
        var tries = 1;
        var loadListData = function() {
          var promise = ListsDataFactory.getPromise();
          promise.then(
            function successCallback(response) {
              ListsDataFactory.loadResources(response);
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
      }
    }
  ]);
