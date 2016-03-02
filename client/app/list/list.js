'use strict';

angular.module('todoSocketApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('list', {
                url: '/',
                templateUrl: 'app/list/list.html',
                controller: 'ListController',
                controllerAs: 'listCtrl'
            });
    });
