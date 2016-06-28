var Map = function (Restangular) {
  var Model = function (data) {
    Object.keys(data).foeEach(function (key) {
      this.key = data[key];
    });
  };

  Model.prototype = {};

  Model.index = function () {
    return Restangular
      .all('maps')
      .getList()
      .then(function (data) {
        return data.plain();
      });
  };

  Model.show = function (id) {
    return Restangular
      .one('maps', id)
      .get()
      .then(function (data) {
        return data.plain();
      });
  };

  return (Model);
};