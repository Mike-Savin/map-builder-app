var UsersMapsIndexCtrl = function ($scope, $state, currentUser, validation, Map) {
  $scope.user = currentUser.get();
  $scope.maps = $scope.user.maps;

  $scope.map = {};

  Map.index().then(function (maps) {
    $scope.maps = maps;
  });

  $scope.createMap = function () {
    Map.create($scope.map).then(function (id) {
      $state.go('users.maps.show', {
        id: id
      });
    }, function (error) {
      validation.danger(error.data.error);
    });
  };
};