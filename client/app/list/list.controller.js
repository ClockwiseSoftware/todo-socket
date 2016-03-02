'use strict';

(function() {

    class ListController {

        constructor(ListResource, $scope, $state, $filter, socket) {
            this.ListResource = ListResource;
            this.$state = $state;
            this.lists = [];


            ListResource.query().$promise.then(lists => {
                this.lists = lists;
                socket.syncUpdates('list', this.lists);
            });

            $scope.$on('$destroy', function() {
                socket.unsyncUpdates('list');
            });

        }


        addList() {
            if (this.newList) {
              this.ListResource.save({ name: this.newList});
                this.newList = '';
            }
        }
        editList(list) {
            this.editedList = list;
            this.originalList = angular.extend({}, list);
        }

        saveEdits(list, event) {

            // Blur events are automatically triggered after the form submit event.
            // This does some unfortunate logic handling to prevent saving twice.
            if (event === 'blur' && this.saveEvent === 'submit') {
                this.saveEvent = null;
                return;
            }

            this.saveEvent = event;

            if (this.reverted) {
                // Todo edits were reverted-- don't save.
                this.reverted = null;
                return;
            }

            list.name = list.name.trim();

            if (list.name === this.originalList.name) {
                this.editedList = null;
                return;
            }

            this.ListResource[list.name ? 'update' : 'delete'](list).$promise
                .then(() => {}, () => {
                    list.name = this.originalList.name;
                })
                .finally(() => {
                    this.editedList = null;
                });
        }


        revertEdits(list) {
            this.lists[this.lists.indexOf(list)] = this.originalList;
            this.editedList = null;
            this.originalList = null;
            this.reverted = true;
        }

        deleteList(list) {
            list.$delete();
        }

        saveList(list) {
            list.$update();
        }


    }

    angular.module('todoSocketApp')
        .controller('ListController', ListController);

})();
