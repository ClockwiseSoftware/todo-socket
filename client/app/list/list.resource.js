'use strict';
ListResource.$inject = ['$resource'];

function ListResource($resource) {
  return $resource('/api/lists/:listId', {listId: '@_id'}, {
    'update': { method:'PUT' }
  });
}

(function() {
  angular.module('todoSocketApp')
    .service('ListResource', ListResource);

})();
