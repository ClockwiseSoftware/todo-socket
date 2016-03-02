'use strict';

angular.module('todoSocketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('todos', {
        url: '/todos/:listId/:status',
        templateUrl: 'app/todo/todo.html',
        controller: 'TodoCtrl',
        controllerAs: 'todosCtrl'
      });
  });
