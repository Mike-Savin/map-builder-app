var requestedState = function (localStorageService) {
  return { 
    get: function () {
      return localStorageService.get('requestedState');
    },

    set: function (state) {
      localStorageService.set('requestedState', state);
    },

    clear: function () {
      localStorageService.remove('requestedState');
    }
  };
};