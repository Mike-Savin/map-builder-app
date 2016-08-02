var UsersNewCtrl = function ($scope, $state, validation, User) {
  $scope.user = {};

  $scope.submit = function () {
    User.create($scope.user).then(function (user) {
      if (user) {
        validation.success('Welcome to Map builder app!');
        $state.go('users.maps.index');
      }
    }, function (error) {
      console.log(error);
      validation.danger(error);
    });
  };
};