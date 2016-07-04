var Map = function (Restangular) {
  var Model = function (data) {
    Object.keys(data).foeEach(function (key) {
      this.key = data[key];
    });
  };

  Model.prototype = {};

  Model.create = function (params) {
    return Restangular
      .all('users')
      .all('maps')
      .post(params)
      .then(function (data) {
        return data;
      });
  };

  Model.update = function (id, params) {
    return Restangular
      .all('users')
      .one('maps', id)
      .put(params)
      .then(function (data) {
        return data;
      });
  };

  Model.index = function () {
    return Restangular
      .all('users')
      .all('maps')
      .getList()
      .then(function (data) {
        return data.plain();
      });
  };

  Model.show = function (id) {
    return Restangular
      .all('users')
      .one('maps', id)
      .get()
      .then(function (data) {
        return data.plain();
      });
  };

  return (Model);
};