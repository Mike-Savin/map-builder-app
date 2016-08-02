var UsersPasswordsNewCtrl = function ($scope, $state, validation, User) {
  $scope.user = {};
  
  $scope.submit = function () {
    User.updatePassword($scope.user.email).then(function () {
      validation.success('Update password link has been successfully sent to your email');
    }, function (error) {
      validation.danger(error);
    });
  };
};