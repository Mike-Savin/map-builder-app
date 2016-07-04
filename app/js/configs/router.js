var router = function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/users/maps/index');

  $stateProvider
    .state('users', {
        url: '/users',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.new', {
      url: '/new',
      controller: 'UsersNewCtrl',
      templateUrl: 'views/users/new.html',
      authState: false
    })
    .state('users.edit', {
      url: '/edit',
      controller: 'UsersEditCtrl',
      templateUrl: 'views/users/edit.html',
      authState: true
    })

    .state('users.sessions', {
        url: '/sessions',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.sessions.new', {
      url: '/new',
      controller: 'UsersSessionsNewCtrl',
      templateUrl: 'views/users/sessions/new.html',
      authState: false
    })

    .state('users.passwords', {
        url: '/passwords',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.passwords.new', {
      url: '/new',
      controller: 'UsersPasswordsNewCtrl',
      templateUrl: 'views/users/passwords/new.html'
    })

    .state('users.maps', {
        url: '/maps',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.maps.index', {
      url: '/index',
      controller: 'UsersMapsIndexCtrl',
      templateUrl: 'views/users/maps/index.html',
      authState: true
    })
    .state('users.maps.show', {
      url: '/:id',
      controller: 'UsersMapsShowCtrl',
      templateUrl: 'views/users/maps/show.html',
      authState: true
    })
};