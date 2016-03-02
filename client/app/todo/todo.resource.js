'use strict';
TodoResource.$inject = ['$resource'];

function TodoResource($resource) {
  return $resource('/api/todos/:todoId', {todoId: '@_id'}, {
    'update': { method:'PUT' }
  });
}

(function() {
  angular.module('todoSocketApp')
    .service('TodoResource', TodoResource);

})();
