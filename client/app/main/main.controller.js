'use strict';

(function() {

    class MainController {

        constructor($http, $scope, $state, $filter, socket) {
            this.$http = $http;
            this.$state = $state;
            this.todos = [];

            $http.get('/api/todos').then(response => {
                this.todos = response.data;
                socket.syncUpdates('todo', this.todos);
            });

            $scope.$on('$destroy', function() {
                socket.unsyncUpdates('todo');
            });

            $scope.$on('$stateChangeSuccess', (event, data, params) => {
                let status = this.status = params.status || '';
                this.filterTodoStatus(status);
            });

            $scope.$watchCollection('main.todos', () => {
                this.remainingCount = $filter('filter')(this.todos, { completed: false }).length;
                this.completedCount = this.todos.length - this.remainingCount;
                this.allChecked = !this.remainingCount;
            });
        }

        filterTodoStatus(status) {
            if (status === 'active') {
                this.statusFilter = { completed: false };
                console.log(this.statusFilter);
            } else if (status === 'completed') {
                this.statusFilter = { completed: true };
            } else {
                this.statusFilter = {};
            }
        }

        addTodo() {
            if (this.newTodo) {
                this.$http.post('/api/todos', { title: this.newTodo, 'completed': false });
                this.newTodo = '';
            }
        }
        editTodo(todo) {
            this.editedTodo = todo;
            this.originalTodo = angular.extend({}, todo);
        }

        saveEdits(todo, event) {

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

            todo.title = todo.title.trim();

            if (todo.title === this.originalTodo.title) {
                this.editedTodo = null;
                return;
            }

            this.$http[todo.title ? 'put' : 'delete']('/api/todos/' + todo._id, todo)
                .then(() => {}, () => {
                    todo.title = this.originalTodo.title;
                })
                .finally(() => {
                    this.editedTodo = null;
                });
        }


        revertEdits(todo) {
            this.todos[this.todos.indexOf(todo)] = this.originalTodo;
            this.editedTodo = null;
            this.originalTodo = null;
            this.reverted = true;
        }

        deleteTodo(todo) {
            this.$http.delete('/api/todos/' + todo._id);
        }

        saveTodo(todo) {
            this.$http.put('/api/todos/' + todo._id);
        }

        toggleCompleted(todo, completed) {
            if (angular.isDefined(completed)) {
                todo.completed = completed;
            }

            this.$http.put('/api/todos/' + todo._id, todo)
                .then(function success() {}, function error() {
                    todo.completed = !todo.completed;
                });
        }

        clearCompletedTodos() {
            let toDeleted = this.todos.filter(todo => todo.completed);
            toDeleted.forEach(todo => this.$http.delete('/api/todos/' + todo._id));
        }

        markAll(completed) {
            this.todos.forEach((todo) => {
                if (todo.completed !== completed) {
                    this.toggleCompleted(todo, completed);
                }
            });
        }

    }

    angular.module('todoSocketApp')
        .controller('MainController', MainController);

})();
