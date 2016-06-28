var UsersCollectionsIndexCtrl = function ($scope, $state, validation, currentUser, User) {
  $scope.user = currentUser.get();
  $scope.collections = [];
  $scope.sources = [];

  User.getCollections($scope.user.id).then(function (collections) {
    console.log(collections);

    $scope.collections = collections;
    $scope.setSources(collections);
  });

  $scope.setSources = function (collections) {
    $scope.sources = [];
    collections.forEach(function (collection) {
      collection.sources.forEach(function (source) { 
        $scope.sources.push(source);
      });
    });
  };

  $scope.selectCollection = function (collection) {
    $scope.selectedCollection = collection.id;
    $scope.setSources([collection]);
  };
};