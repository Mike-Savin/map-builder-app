var policy = function ($rootScope, $state, $stateParams, currentUser) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.$on('$stateChangeStart',
    function (event, toState, toParams, fromState, fromParams) {
      currentUser.checkAccess(event, toState, toParams, fromState, fromParams);
    }
  );
};