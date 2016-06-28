var header = function () {
  return {
    restrict: "E",
    templateUrl: "views/partials/_header.html",
    controller: function($scope, $state, User) {
      $scope.signOut = function () {
        User.signOut();
      };
    }
  };
};