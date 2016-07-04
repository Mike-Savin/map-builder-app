var setHeaders = function (currentUser, Restangular) {
  var user = currentUser.get();
  if (user) {
    Restangular.setDefaultHeaders({'access-token': user.accessToken});
  };
};