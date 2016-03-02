  'use strict';

  (function() {

    class TodoController {

      constructor($scope, $state, $filter, ListResource, TodoResource, socket) {
        this.TodoResource = TodoResource;
        this.$state = $state;
        this.todos = [];
        let listId = this.listId = $state.params.listId;
        if(!listId){
          $state.go('lists');
        }

        ListResource.get({listId:listId})
        .$promise
        .then(list => this.listName = list.name);

        TodoResource
          .query({
            listId: listId
          })
          .$promise
          .then(todos => {
            this.todos = todos;
            socket.syncUpdates('todo', this.todos);
          })
          .catch(error => {
            console.log(error);
          });

        $scope.$on('$destroy', function() {
          socket.unsyncUpdates('todo');
        });

        $scope.$on('$stateChangeSuccess', (event, data, params) => {
          let status = this.status = params.status || '';
          this.filterTodoStatus(status);
        });

        $scope.$watchCollection('todosCtrl.todos', () => {
          this.remainingCount = $filter('filter')(this.todos, {
            completed: false
          }).length;
          this.completedCount = this.todos.length - this.remainingCount;
          this.allChecked = !this.remainingCount;
        });
      }

      filterTodoStatus(status) {
        if (status === 'active') {
          this.statusFilter = {
            completed: false
          };
          console.log(this.statusFilter);
        } else if (status === 'completed') {
          this.statusFilter = {
            completed: true
          };
        } else {
          this.statusFilter = {};
        }
      }

      addTodo() {
        if (this.newTodo) {
          this.TodoResource
            .save({
              listId: this.listId,
              title: this.newTodo,
              'completed': false
            });
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

        todo[todo.title ? '$update' : '$delete']()
          .then(() => {})
          .catch(() => {
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
        todo.$delete();
      }

      saveTodo(todo) {
        todo.$save();
      }

      toggleCompleted(todo, completed) {
        if (angular.isDefined(completed)) {
          todo.completed = completed;
        }
        this.TodoResource.update(todo).$promise.then().catch(function error() {
          todo.completed = !todo.completed;
        });
      }

      clearCompletedTodos() {
        let toDeleted = this.todos.filter(todo => todo.completed);
        toDeleted.forEach(todo => todo.$delete());
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
      .controller('TodoCtrl', TodoController);

  })();
