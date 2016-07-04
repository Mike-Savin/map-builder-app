var currentUser = function ($injector, localStorageService, requestedState, Restangular) {
  var user = {
    get: function () {
      return localStorageService.get('currentUser');
    },
    
    set: function (user) {
      localStorageService.set('currentUser', user);
      Restangular.setDefaultHeaders({'access-token': user.accessToken});
    },

    clear: function () {
      localStorageService.remove('currentUser');
      Restangular.setDefaultHeaders({'access-token': ''});
    },

    checkAccess: function (event, toState, toParams, fromState, fromParams) {
      var $state = $injector.get('$rootScope').$state,
        authorized = !!user.get();
      if (toState.authState !== undefined && authorized !== toState.authState) {
        event.preventDefault();
        if (toState.authState) {
          requestedState.set(toState.name);
          $state.go('users.sessions.new');
        } else {
          $state.go('users.maps.index', {
            id: user.get().id
          });
        }
      }
    }
  };

  return user;
};