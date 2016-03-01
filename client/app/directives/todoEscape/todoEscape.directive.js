'use strict';

angular.module('todoSocketApp')
    .directive('todoEscape', function() {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                var ESCAPE_KEY = 27;

                element.bind('keydown', function(event) {
                    if (event.keyCode === ESCAPE_KEY) {
                        scope.$apply(attrs.todoEscape);
                    }
                });

                scope.$on('$destroy', function() {
                    element.unbind('keydown');
                });
            }
        };
    });
