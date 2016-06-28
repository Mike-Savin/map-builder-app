var currentUser = function ($injector, localStorageService, requestedState) {
  var user = {
    get: function () {
      return localStorageService.get('currentUser');
    },
    
    set: function (user) {
      localStorageService.set('currentUser', user);
    },

    clear: function () {
      localStorageService.remove('currentUser');
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