var UsersMapsShowCtrl = function ($scope, $state, $stateParams, Map) {
  $scope.map = {};
  $scope.id = $stateParams.id;

  Map.show($scope.id).then(function (map) {
    $scope.map = map;
  })
};