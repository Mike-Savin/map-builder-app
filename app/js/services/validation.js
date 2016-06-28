var validation = function ($filter, ngToast) {
  var publicMethods = {
    message: function (type, messages) {
      if (messages.constructor === Array) {
        return messages.forEach(function (message) {
          publicMethods.message(type, message);
        });
      }

      ngToast[type]({
        content: $filter('translate')(messages)
      });
    },

    success: function (messages) {
      publicMethods.message('success', messages);
    },

    danger: function (messages) {
      publicMethods.message('danger', messages);
    }
  };

  return publicMethods;
};