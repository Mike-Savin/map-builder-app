var User = function (Restangular, currentUser) {
  var Model = function (data) {
    Object.keys(data).foeEach(function (key) {
      this.key = data[key];
    });
  };

  Model.create = function (params) {
    return Restangular
      .all('users')
      .post(params)
      .then(function (data) {
        var response = data.plain();
        if (response.user) {
          currentUser.set(response.user);
        }
        return response.user;
      });
  };

  Model.signIn = function (params) {
    return Restangular
      .all('users')
      .all('sessions')
      .post(params)
      .then(function (data) {
        var response = data.plain();
        if (response.user) {
          currentUser.set(response.user);
        }
        return response.user;
      });
  };

  Model.updatePassword = function (email) {
    return Restangular
      .all('users')
      .all('passwords')
      .all('new')
      .customGET('', {email: email})
      .then(function (data) {
        return (data && data.plain) ? data.plain() : data;
      });
  };

  Model.signOut = function () {
    currentUser.clear();
  };

  Model.getCollections = function (id) {
    return Restangular
      .one('user', id)
      .all('collections')
      .getList()
      .then(function (data) {
        return data.plain();
      });
  }

  return (Model);
};