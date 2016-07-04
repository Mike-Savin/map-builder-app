var UsersMapsShowCtrl = function ($scope, $sails, $state, $stateParams, currentUser, validation, Map) {
  $scope.user = currentUser.get();
  $scope.map = {};
  $scope.points = [];
  $scope.id = $stateParams.id;

  if (!$scope.id) {
    $state.go('users.maps.index');
  }

  Map.show($scope.id).then(function (map) {
    $scope.map = map;
    $scope.points = map.points || [];

    $sails.on('maps/' + $scope.map.id + '/update', function (point) {
      console.log('received: ', point);
      $scope.points.push(point);
    });
  });

  $scope.stop = function () {
    Map.update($scope.id, {active: false}).then(function (result) {
      if (result === 200) {
        validation.success('Map saved');
        $scope.map.active = false;
      }
    })
  }
};