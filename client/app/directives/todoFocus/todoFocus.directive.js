'use strict';

angular.module('todoSocketApp')
    .directive('todoFocus', function($timeout) {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                scope.$watch(attrs.todoFocus, function(newVal) {
                    if (newVal) {
                        $timeout(function() {
                            element[0].focus();
                        }, 0, false);
                    }
                });
            }
        };
    });
