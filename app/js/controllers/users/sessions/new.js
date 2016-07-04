var UsersSessionsNewCtrl = function ($scope, $state, validation, requestedState, User) {
  $scope.user = {};
  
  $scope.submit = function () {
    User.signIn($scope.user).then(function (user) {
      var toState = requestedState.get() || 'users.maps.index';
      requestedState.clear();
      $state.go(toState);
      validation.success('You have successfully log in');
    }, function (error) {
      validation.danger(error.data.error);
    });
  };
};