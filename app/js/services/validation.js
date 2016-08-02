var validation = function ($filter, ngToast) {
  var publicMethods = {
    message: function (type, messages) {
      if (!messages) {
        return;
      }

      if (messages.constructor === Array) {
        return messages.forEach(function (message) {
          publicMethods.message(type, message);
        });
      }

      if (typeof messages === 'object') {
        if (messages && messages.data && messages.data.error) {
          return publicMethods.message(type, messages.data.error);
        } else {
          return publicMethods.message(type, 'SERVER.ERROR.UNHANDLED');
        }
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