var topNewsApp = angular.module('topNewsApp', [
  'LocalStorageModule',
  'ngAnimate',
  'ngSanitize',
  'ngSails',
  'ngToast',
  'pascalprecht.translate',
  'restangular',
  'threejs',
  'ui.router',
  'validation',
  'validation.rule'
]);
var angularLocalStorage = function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('mapBuilder');
};
topNewsApp.config(angularLocalStorage);
var enableAnimation = function($animateProvider) {
    $animateProvider.classNameFilter(/ng-toast/);
};
topNewsApp.config(enableAnimation);
var ngToast = function(ngToastProvider) {
    ngToastProvider.configure({
        animation: 'slide',
        dismissButton: true,
        timeout: 5000
    });
};
topNewsApp.config(ngToast);
var restangular = function (API, RestangularProvider) {
  RestangularProvider.setBaseUrl(API.url);
};
topNewsApp.config(restangular);
var router = function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/users/maps/index');

  $stateProvider
    .state('users', {
        url: '/users',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.new', {
      url: '/new',
      controller: 'UsersNewCtrl',
      templateUrl: 'views/users/new.html',
      authState: false
    })
    .state('users.edit', {
      url: '/edit',
      controller: 'UsersEditCtrl',
      templateUrl: 'views/users/edit.html',
      authState: true
    })

    .state('users.sessions', {
        url: '/sessions',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.sessions.new', {
      url: '/new',
      controller: 'UsersSessionsNewCtrl',
      templateUrl: 'views/users/sessions/new.html',
      authState: false
    })

    .state('users.passwords', {
        url: '/passwords',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.passwords.new', {
      url: '/new',
      controller: 'UsersPasswordsNewCtrl',
      templateUrl: 'views/users/passwords/new.html'
    })

    .state('users.maps', {
        url: '/maps',
        abstract: true,
        template: '<div ui-view></div>'
    })
    .state('users.maps.index', {
      url: '/index',
      controller: 'UsersMapsIndexCtrl',
      templateUrl: 'views/users/maps/index.html',
      authState: true
    })
    .state('users.maps.show', {
      url: '/:id',
      controller: 'UsersMapsShowCtrl',
      templateUrl: 'views/users/maps/show.html',
      authState: true
    })
};
topNewsApp.config(router);
var sails = function ($sailsProvider, API) {
  $sailsProvider.url = API.url;
};
topNewsApp.config(sails);
var restangular = function ($translateProvider) {
  $translateProvider.translations('en', {
    'SERVER': {
      'ERROR': {
        'PASSWORD': {
          'TOO_SHORT': 'Password should contain at least 8 characters',
          'INVALID': 'Please provide valid password'
        },
        'EMAIL': {
          'EXISTS': 'Email already exists',
          'INVALID': 'Email is invalid',
          'REQUIRED': 'Email is required',
          'NOT_FOUND': 'Email was not found'
        }
      }
    }
  });
 
  $translateProvider.preferredLanguage('en');
};
topNewsApp.config(restangular);
var validation = function($validationProvider) {
    $validationProvider.showSuccessMessage = false;
    $validationProvider.showErrorMessage = false;
};

topNewsApp.config(validation);
var API = {
    baseUrl: 'http://localhost:9000',
    url: 'http://localhost:1337'
};
topNewsApp.constant('API', API);
var policy = function ($rootScope, $state, $stateParams, currentUser) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.$on('$stateChangeStart',
    function (event, toState, toParams, fromState, fromParams) {
      currentUser.checkAccess(event, toState, toParams, fromState, fromParams);
    }
  );
};
topNewsApp.run(policy);
var setHeaders = function (currentUser, Restangular) {
  var user = currentUser.get();
  if (user) {
    Restangular.setDefaultHeaders({'access-token': user.accessToken});
  };
};
topNewsApp.run(setHeaders);
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
topNewsApp.factory('Map', Map);
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
        currentUser.set(response);  
        return response;
      });
  };

  Model.signIn = function (params) {
    return Restangular
      .all('users')
      .all('sessions')
      .post(params)
      .then(function (data) {
        var response = data.plain();
        currentUser.set(response);  
        return response;
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
topNewsApp.factory('User', User);
var currentUser = function ($injector, localStorageService, requestedState, Restangular) {
  var user = {
    get: function () {
      return localStorageService.get('currentUser');
    },
    
    set: function (user) {
      localStorageService.set('currentUser', user);
      Restangular.setDefaultHeaders({'access-token': user.accessToken});
    },

    clear: function () {
      localStorageService.remove('currentUser');
      Restangular.setDefaultHeaders({'access-token': ''});
    },

    checkAccess: function (event, toState, toParams, fromState, fromParams) {
      var $state = $injector.get('$rootScope').$state,
        authorized = !!user.get();
      if (toState.authState !== undefined && authorized !== toState.authState) {
        event.preventDefault();
        if (toState.authState) {
          requestedState.set(toState.name);
          $state.go('users.sessions.new');
        } else {
          $state.go('users.maps.index', {
            id: user.get().id
          });
        }
      }
    }
  };

  return user;
};
topNewsApp.factory('currentUser', currentUser);
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
topNewsApp.factory('requestedState', requestedState);
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
topNewsApp.factory('validation', validation);
var footer = function () {
  return {
    restrict: "E",
    scope: {},
    templateUrl: "views/partials/_footer.html"
  };
};
topNewsApp.directive('footer', footer);
var header = function () {
  return {
    restrict: "E",
    templateUrl: "views/partials/_header.html",
    controller: function($scope, $state, User) {
      $scope.signOut = function () {
        User.signOut();
      };
    }
  };
};
topNewsApp.directive('header', header);
var threejsScene = function ($rootScope, $window, THREEService) {
  return {
    restrict: 'EA',
    scope: {
      width: '=',
      height: '=',
      points: '='
    },
    link: function(scope, element, attrs) {
      THREEService.load().then(function (THREE) {

        scope.container = element[0];
        scope.renderer = THREEService.getRenderer();
        scope.cameraShift = 0;
        scope.cameraOffset = 400;
        scope.rotation = 0;
        scope.coordinatesFactor = 10;
        scope.pointRadius = 1;
        var animation;

        scope.init = function () {
          scope.renderer.setSize(scope.width, scope.height);
          scope.container.appendChild(scope.renderer.domElement);

          scope.scene = new THREE.Scene();

          scope.addCamera({x: scope.cameraOffset, y: scope.cameraOffset, z: scope.cameraOffset});

          scope.addAxes(300);

          scope.addPlane({x: 0, z: 0, color: 0xf5f5f5});

          scope.drawPoints();

          scope.addLight({x: -400, y: 800, z: -100});

          scope.renderer.setClearColor(0xf9f9f9, 1);
        };

        scope.addPlane = function (params) {
          if (!params) {
            params = {};
          }
          var defaultParams = {x: 0, y: 0, z: 0, color: 0xcccccc, width: 500, height: 500};
          angular.extend(defaultParams, params);

          var planeGeometry = new THREE.PlaneBufferGeometry(defaultParams.height, defaultParams.width),
            planeMaterial = new THREE.MeshLambertMaterial({
              color: defaultParams.color
            }),
            plane = new THREE.Mesh(planeGeometry, planeMaterial);

          plane.rotation.x = -0.5 * Math.PI;
          plane.position.x = defaultParams.x;
          plane.position.y = defaultParams.y;
          plane.position.z = defaultParams.z;

          scope.scene.add(plane);
        };

        scope.addSphere = function (params) {
          if (!params) {
            params = {};
          }
          var defaultParams = {x: 0, y: 0, color: 0xff0000, radius: 10};
          angular.extend(defaultParams, params);

          var sphereGeometry = new THREE.SphereGeometry(defaultParams.radius, 20, 20),
            sphereMaterial = new THREE.MeshLambertMaterial({
              color: defaultParams.color
            }),
            sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

          if (defaultParams.name) {
            sphere.name = defaultParams.name;
          }
          sphere.position.x = defaultParams.x;
          sphere.position.y = defaultParams.y;
          sphere.position.z = defaultParams.z;

          scope.scene.add(sphere);
        };

        scope.addCamera = function (params) {
          if (!params) {
            params = {};
          }
          var defaultParams = {x: 0, y: 0, z: 0, angle: 45, near: 0.1, far: 10000};
          angular.extend(defaultParams, params);

          scope.camera = new THREE.PerspectiveCamera(
            defaultParams.angle,
            scope.width / scope.height,
            defaultParams.near,
            defaultParams.far
          );
          scope.camera.position.y = 400;
          //scope.camera.position.set(defaultParams.x, defaultParams.y, defaultParams.z);
          //scope.camera.lookAt(scope.scene.position);
          scope.scene.add(scope.camera);
        };

        scope.addLight = function (params) {
          if (!params) {
            params = {};
          }
          var defaultParams = {x: 0, y: 0, z: 0, color: 0xffffff};
          angular.extend(defaultParams, params);

          var light = new THREE.PointLight(defaultParams.color);
          light.position.set(defaultParams.x, defaultParams.y, defaultParams.z);
          scope.scene.add(light);
        };

        scope.addAxes = function (size) {
          size = size || 20;
          var axes = new THREE.AxisHelper(size);
          scope.scene.add(axes);
        };

        scope.drawPoints = function () {
          scope.points.forEach(function (point) {
            var oldSphere = scope.scene.getObjectByName(point.id), color;

            if (point.type === 0) {
              color = 0xff0000;
            } else {
              color = 0x336699;
            }

            if (oldSphere) {
              scope.scene.remove(oldSphere);
            }
            scope.addSphere({
              x: point.x * scope.coordinatesFactor,
              y: scope.pointRadius / 2,
              z: point.y * scope.coordinatesFactor,
              radius: scope.pointRadius,
              color: color,
              name: point.id});
          });
        };

        scope.$watchCollection('points', function () {
          scope.drawPoints(scope.points);
        });

        $rootScope.$on('$stateChangeStart', function () {
          cancelAnimationFrame(animation);
        });

        angular.element(document).bind('keydown', function (event) {
          if (event.which === 37) {
            scope.cameraShift = -1;
          } else if (event.which === 39) {
            scope.cameraShift = 1;
          } else if (event.which === 38) {
            if (scope.cameraOffset > 100) {
              scope.cameraOffset -= 10;
            }
          } else if (event.which === 40) {
            scope.cameraOffset += 10;
          }
        });

        angular.element(document).bind('keyup', function (event) {
          if (event.which === 37 || event.which === 39) {
            scope.cameraShift = 0;
          }
          event.preventDefault();
        });

        scope.animate = function () {
          animation = requestAnimationFrame(scope.animate);
          scope.render();
        };

        scope.render = function () {
          var radius = Math.sqrt(Math.pow(scope.cameraOffset, 2) * 2);
          //sphere.rotation.x += 0.006;
          //sphere.rotation.y += 0.006;
          scope.rotation += scope.cameraShift * 0.05;
          scope.camera.position.x = Math.sin(scope.rotation) * radius;
          scope.camera.position.z = Math.cos(scope.rotation) * radius;
          scope.camera.position.y = scope.cameraOffset;
          scope.camera.lookAt(scope.scene.position);
          scope.renderer.render(scope.scene, scope.camera, null, true); // forceClear == true
        };

        scope.init();
        scope.animate();

      });
    }
  };
}
topNewsApp.directive('threejsScene', threejsScene);
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
topNewsApp.controller('UsersCollectionsIndexCtrl', UsersCollectionsIndexCtrl);
var UsersEditCtrl = function ($scope, $state, $stateParams) {
};
topNewsApp.controller('UsersEditCtrl', UsersEditCtrl);
var UsersMapsIndexCtrl = function ($scope, $state, currentUser, validation, Map) {
  $scope.user = currentUser.get();
  $scope.maps = $scope.user.maps;

  $scope.map = {};

  Map.index().then(function (maps) {
    $scope.maps = maps;
  });

  $scope.createMap = function () {
    Map.create($scope.map).then(function (id) {
      $state.go('users.maps.show', {
        id: id
      });
    }, function (error) {
      validation.danger(error.data.error);
    });
  };
};
topNewsApp.controller('UsersMapsIndexCtrl', UsersMapsIndexCtrl);
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
topNewsApp.controller('UsersMapsShowCtrl', UsersMapsShowCtrl);
var UsersNewCtrl = function ($scope, $state, validation, User) {
  $scope.user = {};

  $scope.submit = function () {
    User.create($scope.user).then(function (user) {
      if (user) {
        validation.success('Welcome to Map builder app!');
        $state.go('users.maps.index');
      }
    }, function (error) {
      console.log(error);
      validation.danger(error.data.error);
    });
  };
};
topNewsApp.controller('UsersNewCtrl', UsersNewCtrl);
var UsersPasswordsNewCtrl = function ($scope, $state, validation, User) {
  $scope.user = {};
  
  $scope.submit = function () {
    User.updatePassword($scope.user.email).then(function () {
      validation.success('Update password link has been successfully sent to your email');
    }, function (error) {
      validation.danger(error.data.error);
    });
  };
};
topNewsApp.controller('UsersPasswordsNewCtrl', UsersPasswordsNewCtrl);
var UsersSessionsNewCtrl = function ($scope, $state, validation, requestedState, User) {
  $scope.user = {};
  
  $scope.submit = function () {
    User.signIn($scope.user).then(function (user) {
      var toState = requestedState.get() || 'users.maps.index';
      requestedState.clear();
      $state.go(toState);
      validation.success('You have successfully log in');
    }, function (error) {
      validation.danger(error.data.error);
    });
  };
};
topNewsApp.controller('UsersSessionsNewCtrl', UsersSessionsNewCtrl);
angular.element(document).ready(function() {
    angular.bootstrap(document, ['topNewsApp']);
});
/**!
 * THREEjs Angular module implmenting
 * THREEjs https://github.com/mrdoob/three.js/
 * see http://threejs.org by mrdoob
 * @author  Mike Goodstadt  <mikegoodstadt@gmail.com>
 * @version 0.1.2
 */
(function() {
  'use strict';
  angular.module('threejs', []);

  angular
    .module('threejs')
    .factory('THREEService', THREEService);

  function THREEService($log, $document, $q, $rootScope) {
    var deferred = $q.defer();

    // RENDER VARIABLES
    var renderer;
      
    function setRenderer() {
      if (window.WebGLRenderingContext) {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });
      } else {
        renderer = new THREE.CanvasRenderer({
          alpha: true
        });         
      }
      renderer.setPixelRatio( window.devicePixelRatio );
      // var clearColor = "0x000000";
      //  renderer.setClearColor( clearColor, 0.0 ); // defaults: 0x000000, 0.0
      // renderer.setSize( 100, 100 );
      // renderer.autoClear = false; // To allow render overlay on top of sprited sphere
    }

    function onScriptLoad() {
      if (!renderer) setRenderer();
      $log.log("THREE.js loaded OK!");
      $rootScope.$apply(function() {
        deferred.resolve(window.THREE);
      });
    }

    // Create a script tag with ThreeJS as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    var online = true;
    if (online) {
      scriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r71/three.min.js';
    } else {
      scriptTag.src = 'assets/js/three.min.js';
    }
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') {
        onScriptLoad(); 
      }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    function resetRenderer() {
      // Reset when switching between views, routes or states (with ui-router module).
      // Use of renderer.setSize in a directive resets the viewport to full size.
      // No view independent reset availible for scissor so can only set ScissorTest to false
      renderer.enableScissorTest ( false );
      renderer.setClearColor( 0x000000, 0.0 );
    }

    return {
      load: function() {
        $log.log("THREE.js loading...");
        return deferred.promise;
      },
      getRenderer: function() {
        resetRenderer();
        return renderer;
      }
    };
  }
})();
/**!
 * THREEjs Plugins Service for
 * THREEjs Angular module implmenting
 * THREEjs https://github.com/mrdoob/three.js/
 * see http://threejs.org by mrdoob
 * @author  Mike Goodstadt  <mikegoodstadt@gmail.com>
 * @version 0.1.2
 */
(function() {
  'use strict';
  angular
    .module('threejs')
    .factory('THREEPlugins', THREEPlugins);

  function THREEPlugins($log, $document, $q, $rootScope) {
    var plugins = {
      loaded: []
    };

    return {
      load: function(filenames) {
        var self = this;
        var pluginsToLoad = []; // push async functions into list for subsequent processing
        angular.forEach(filenames, function(filename, key) {
          var newPlugin = true;
          for (var i = plugins.loaded.length - 1; i >= 0; i--) {
            if (plugins.loaded[key] == filename) newPlugin = false;
          }
          if (newPlugin) {
            var loadPlugin = self.add(filename);
            pluginsToLoad.push(loadPlugin);
          }
        });
        return $q.all(pluginsToLoad)
        .then(function(results) {
          if (results.length > 0) $log.info("THREE.js plugins loaded: " + results);
          return window.THREE;
        });
      },
      add: function(filename) {
        var deferred = $q.defer();

        function onScriptLoad() {
          $rootScope.$apply(function() {
            plugins.loaded.push(filename);
            $log.debug(plugins.loaded);
            deferred.resolve(filename);
          });
        }

        var pluginTag = $document[0].createElement('script');
          pluginTag.type = 'text/javascript';
          pluginTag.src = 'assets/js/' + filename + '.js';
          pluginTag.async = true;
          pluginTag.onreadystatechange = function () {
            if (this.readyState == 'complete') {
              onScriptLoad();
            }
          };
          pluginTag.onload = onScriptLoad;

        var t = $document[0].getElementsByTagName('body')[0];
          t.appendChild(pluginTag);

        return deferred.promise;
      },
      remove: function(filename) {
        angular.forEach(plugins.loaded, function(plugin, key) {
          if (plugin == filename) {
            plugins.loaded[key].pop();
            // REMOVE DOM ELEMENT?
            $log.info("THREE.js plugin " + filename + " removed.");
          }
        });
      }
    };
  }
})();
/**!
 * THREEjs Textures Service for
 * THREEjs Angular module implmenting
 * THREEjs https://github.com/mrdoob/three.js/
 * see http://threejs.org by mrdoob
 * @author  Mike Goodstadt  <mikegoodstadt@gmail.com>
 * @version 0.1.2
 */
(function() {
  'use strict';
  angular
    .module('threejs')
    .factory('THREETextures', THREETextures);

  function THREETextures(THREEService, $log, $document, $q, $rootScope) {
    // TODO: check if texture already loaded - add and remove from array
    var textures = {
      loaded: []
    };

    return {
      load: function(filenames) {
        $log.debug(filenames);
        
        var self = this;
        var imagesToLoad = []; // push async functions into list for subsequent processing
        angular.forEach(filenames, function(filename, key) {
          var newImage = true;
          for (var i = textures.loaded.length - 1; i >= 0; i--) {
            if (textures.loaded[key] == filename) newImage = false;
          }
          if (newImage) {
            var loadImage = self.add(key, filename);
            imagesToLoad.push(loadImage);
          }
        });
        return $q.all(imagesToLoad)
        .then(function(results) {
          if (results.length > 0) $log.debug("Images loaded: " + results);
          return window.THREE;
        });
      },
      add: function(textureName, filename) {
        var deferred = $q.defer();

        // Create Manager
        var textureManager = new THREE.LoadingManager();
        textureManager.onProgress = function ( item, loaded, total ) {
          // this gets called after any item has been loaded
          $log.debug( item, loaded, total );
        };
        textureManager.onLoad = function () {
          // all textures are loaded
          $rootScope.$apply(function() {
            deferred.resolve(filename);
          });
        };

        // Create New Texture
        var newTexture = new THREE.Texture();
        var onProgress = function ( xhr ) {
          if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            $log.debug( Math.round(percentComplete, 2) + '% downloaded' );
          }
        };
        var onError = function ( xhr ) {
        };
        var loader = new THREE.TextureLoader( textureManager );
        loader.load( filename, function ( texture ) {
          newTexture = texture;
          newTexture.name = textureName;
          textures.loaded.push( newTexture );
        }, onProgress, onError );

        return deferred.promise;
      },
      remove: function(filename) {
        angular.forEach(textures.loaded, function(texture, key) {
          if (texture == filename) {
            textures.loaded[key].pop();
            // REMOVE DOM ELEMENT?
            $log.info("Removed " + filename + " texture.");
          }
        });
      },
      get: function(textureName) {
        var texture, found;
        if (textureName !== undefined || textureName !== false) {
          for (var i = textures.loaded.length - 1; i >= 0; i--) {
            if (textures.loaded[i].name === textureName) {
              texture = textures.loaded[i];
              found = true;
              $log.info("Texture \"" + textureName + "\" found!");
            }
          }
        }
        if (!found) {
          texture = textures.loaded[0];
          $log.warn("Texture \"" + textureName + "\" not found: returning \"" + texture.name + ".\"");
        }
        $log.debug(texture);
        return texture;

      }
    };
  }
})();
(function() {
    angular.module('validation.rule', ['validation'])
        .config(['$validationProvider',
            function($validationProvider) {

                var expression = {
                    required: function(value) {
                        return !!value;
                    },
                    url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                    number: /^\d+$/,
                    minlength: function(value, scope, element, attrs, param) {
                        return value.length >= param;
                    },
                    maxlength: function(value, scope, element, attrs, param) {
                        return value.length <= param;
                    }
                };

                var defaultMsg = {
                    required: {
                        error: 'This should be Required!!',
                        success: 'It\'s Required'
                    },
                    url: {
                        error: 'This should be Url',
                        success: 'It\'s Url'
                    },
                    email: {
                        error: 'This should be Email',
                        success: 'It\'s Email'
                    },
                    number: {
                        error: 'This should be Number',
                        success: 'It\'s Number'
                    },
                    minlength: {
                        error: 'This should be longer',
                        success: 'Long enough!'
                    },
                    maxlength: {
                        error: 'This should be shorter',
                        success: 'Short enough!'
                    }
                };

                $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);

            }
        ]);

}).call(this);

(function() {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);

(function() {
    angular.module('validation.provider', [])
        .provider('$validation', function() {


            var $injector,
                $scope,
                $http,
                $q,
                $timeout,
                _this = this;


            /**
             * Setup the provider
             * @param injector
             */
            var setup = function(injector) {
                $injector = injector;
                $scope = $injector.get('$rootScope');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
            };


            /**
             * Define validation type RegExp
             * @type {{}}
             */
            var expression = {};


            /**
             * default error, success message
             * @type {{}}
             */
            var defaultMsg = {};


            /**
             * Allow user to set a custom Expression, do remember set the default message using setDefaultMsg
             * @param obj
             * @returns {*}
             */
            this.setExpression = function(obj) {
                angular.extend(expression, obj);
                return _this;
            };


            /**
             * Get the Expression
             * @param exprs
             * @returns {*}
             */
            this.getExpression = function(exprs) {
                return expression[exprs];
            };


            /**
             * Allow user to set default message
             * @param obj
             * @returns {*}
             */
            this.setDefaultMsg = function(obj) {
                angular.extend(defaultMsg, obj);
                return _this;
            };


            /**
             * Get the Default Message
             * @param msg
             * @returns {*}
             */
            this.getDefaultMsg = function(msg) {
                return defaultMsg[msg];
            };


            /**
             * Override the errorHTML function
             * @param func
             * @returns {*}
             */
            this.setErrorHTML = function(func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getErrorHTML = func;

                return _this;
            };


            /**
             * Invalid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getErrorHTML = function(message) {
                return '<p class="validation-invalid">' + message + '</p>';
            };


            /**
             * Override the successHTML function
             * @param func
             * @returns {*}
             */
            this.setSuccessHTML = function(func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getSuccessHTML = func;

                return _this;
            };


            /**
             * Valid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getSuccessHTML = function(message) {
                return '<p class="validation-valid">' + message + '</p>';
            };


            /**
             * Whether show the validation success message
             * You can easily change this to false in your config
             * example: $validationProvider.showSuccessMessage = false;
             * @type {boolean}
             */
            this.showSuccessMessage = true;


            /**
             * Whether show the validation error message
             * You can easily change this to false in your config
             * example: $validationProvider.showErrorMessage = false;
             * @type {boolean}
             */
            this.showErrorMessage = true;

            /**
             * Check form valid, return true
             * checkValid(Form): Check the specific form(Form) valid from angular `$valid`
             * @param form
             * @returns {boolean}
             */
            this.checkValid = function(form) {
                if (form.$valid === undefined) {
                    return false;
                }
                return (form && form.$valid === true);
            };


            /**
             * Validate the form when click submit, when `validMethod = submit`
             * @param form
             * @returns {promise|*}
             */
            this.validate = function(form) {

                var deferred = $q.defer(),
                    idx = 0;

                if (form === undefined) {
                    console.error('This is not a regular Form name scope');
                    deferred.reject('This is not a regular Form name scope');
                    return deferred.promise;
                }

                if (form.validationId) { // single
                    $scope.$broadcast(form.$name + 'submit-' + form.validationId, idx++);
                } else if (form.constructor === Array) { // multiple
                    for (var k in form) {
                        $scope.$broadcast(form[k].$name + 'submit-' + form[k].validationId, idx++);
                    }
                } else {
                    for (var i in form) { // whole scope
                        if (i[0] !== '$' && form[i].hasOwnProperty('$dirty')) {
                            $scope.$broadcast(i + 'submit-' + form[i].validationId, idx++);
                        }
                    }
                }

                deferred.promise.success = function(fn) {
                    deferred.promise.then(function(value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                deferred.promise.error = function(fn) {
                    deferred.promise.then(null, function(value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                $timeout(function() {
                    if (_this.checkValid(form)) {
                        deferred.resolve('success');
                    } else {
                        deferred.reject('error');
                    }
                });

                return deferred.promise;
            };

            /**
             * Do this function if validation valid
             * @param element
             */
            this.validCallback = null;

            /**
             * Do this function if validation invalid
             * @param element
             */
            this.invalidCallback = null;

            /**
             * reset the specific form
             * @param form
             */
            this.reset = function(form) {
                if (form === undefined) {
                    console.error('This is not a regular Form name scope');
                    return;
                }

                if (form.validationId) {
                    $scope.$broadcast(form.$name + 'reset-' + form.validationId);
                } else if (form.constructor === Array) {
                    for (var k in form) {
                        $scope.$broadcast(form[k].$name + 'reset-' + form[k].validationId);
                    }
                } else {
                    for (var i in form) {
                        if (i[0] !== '$' && form[i].hasOwnProperty('$dirty')) {
                            $scope.$broadcast(i + 'reset-' + form[i].validationId);
                        }
                    }
                }
            };


            /**
             * $get
             * @returns {{setErrorHTML: *, getErrorHTML: Function, setSuccessHTML: *, getSuccessHTML: Function, setExpression: *, getExpression: Function, setDefaultMsg: *, getDefaultMsg: Function, checkValid: Function, validate: Function, reset: Function}}
             */
            this.$get = ['$injector',
                function($injector) {
                    setup($injector);
                    return {
                        setErrorHTML: this.setErrorHTML,
                        getErrorHTML: this.getErrorHTML,
                        setSuccessHTML: this.setSuccessHTML,
                        getSuccessHTML: this.getSuccessHTML,
                        setExpression: this.setExpression,
                        getExpression: this.getExpression,
                        setDefaultMsg: this.setDefaultMsg,
                        getDefaultMsg: this.getDefaultMsg,
                        showSuccessMessage: this.showSuccessMessage,
                        showErrorMessage: this.showErrorMessage,
                        checkValid: this.checkValid,
                        validate: this.validate,
                        validCallback: this.validCallback,
                        invalidCallback: this.invalidCallback,
                        reset: this.reset
                    };
                }
            ];

        });
}).call(this);

(function() {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['$injector',
            function($injector) {

                var $validationProvider = $injector.get('$validation'),
                    $q = $injector.get('$q'),
                    $timeout = $injector.get('$timeout');

                /**
                 * Do this function if validation valid
                 * @param element
                 * @param validMessage
                 * @param validation
                 * @param callback
                 * @param ctrl
                 * @returns {}
                 */
                var validFunc = function(element, validMessage, validation, scope, ctrl) {
                    var messageElem,
                        messageToShow = validMessage || $validationProvider.getDefaultMsg(validation).success;

                    if (scope.messageId)
                        messageElem = angular.element(document.querySelector('#' + scope.messageId));
                    else
                        messageElem = element.next();

                    if ($validationProvider.showSuccessMessage && messageToShow) {
                        messageElem.html($validationProvider.getSuccessHTML(messageToShow));
                        messageElem.css('display', '');
                    } else {
                        messageElem.css('display', 'none');
                    }
                    ctrl.$setValidity(ctrl.$name, true);
                    if (scope.validCallback) scope.validCallback();
                    if ($validationProvider.validCallback) $validationProvider.validCallback(element);

                    return true;
                };


                /**
                 * Do this function if validation invalid
                 * @param element
                 * @param validMessage
                 * @param validation
                 * @param callback
                 * @param ctrl
                 * @returns {}
                 */
                var invalidFunc = function(element, validMessage, validation, scope, ctrl) {
                    var messageElem,
                        messageToShow = validMessage || $validationProvider.getDefaultMsg(validation).error;

                    if (scope.messageId)
                        messageElem = angular.element(document.querySelector('#' + scope.messageId));
                    else
                        messageElem = element.next();

                    if ($validationProvider.showErrorMessage && messageToShow) {
                        messageElem.html($validationProvider.getErrorHTML(messageToShow));
                        messageElem.css('display', '');
                    } else {
                        messageElem.css('display', 'none');
                    }
                    ctrl.$setValidity(ctrl.$name, false);
                    if (scope.invalidCallback) scope.invalidCallback();
                    if ($validationProvider.invalidCallback) $validationProvider.invalidCallback(element);

                    return false;
                };


                /**
                 * If var is true, focus element when validate end
                 * @type {boolean}
                 ***private variable
                 */
                var isFocusElement = false;


                /**
                 * Check Validation with Function or RegExp
                 * @param scope
                 * @param element
                 * @param attrs
                 * @param ctrl
                 * @param validation
                 * @param value
                 * @returns {}
                 */
                var checkValidation = function(scope, element, attrs, ctrl, validation, value) {

                    var validators = validation.slice(0),
                        validatorExpr = validators[0].trim(),
                        paramIndex = validatorExpr.indexOf('='),
                        validator = paramIndex === -1 ? validatorExpr : validatorExpr.substr(0, paramIndex),
                        validatorParam = paramIndex === -1 ? null : validatorExpr.substr(paramIndex + 1),
                        leftValidation = validators.slice(1),
                        successMessage = validator + 'SuccessMessage',
                        errorMessage = validator + 'ErrorMessage',
                        expression = $validationProvider.getExpression(validator),
                        valid = {
                            success: function() {
                                validFunc(element, attrs[successMessage], validator, scope, ctrl);
                                if (leftValidation.length) {
                                    return checkValidation(scope, element, attrs, ctrl, leftValidation, value);
                                } else {
                                    return true;
                                }
                            },
                            error: function() {
                                return invalidFunc(element, attrs[errorMessage], validator, scope, ctrl);
                            }
                        };

                    if (expression === undefined) {
                        console.error('You are using undefined validator "%s"', validator);
                        if (leftValidation.length) {
                            return checkValidation(scope, element, attrs, ctrl, leftValidation, value);
                        } else {
                            return;
                        }
                    }
                    // Check with Function
                    if (expression.constructor === Function) {
                        return $q.all([$validationProvider.getExpression(validator)(value, scope, element, attrs, validatorParam)])
                            .then(function(data) {
                                if (data && data.length > 0 && data[0]) {
                                    return valid.success();
                                } else {
                                    return valid.error();
                                }
                            }, function() {
                                return valid.error();
                            });
                    }
                    // Check with RegExp
                    else if (expression.constructor === RegExp) {
                        // Only apply the test if the value is neither undefined or null
                        if (value !== undefined && value !== null)
                            return $validationProvider.getExpression(validator).test(value) ? valid.success() : valid.error();
                        else
                            return valid.error();
                    } else {
                        return valid.error();
                    }
                };


                /**
                 * generate unique guid
                 */
                var s4 = function() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                var guid = function() {
                    return (s4() + s4() + s4() + s4());
                };


                return {
                    restrict: 'A',
                    require: 'ngModel',
                    scope: {
                        model: '=ngModel',
                        initialValidity: '=initialValidity',
                        validCallback: '&',
                        invalidCallback: '&',
                        messageId: '@'
                    },
                    link: function(scope, element, attrs, ctrl) {

                        /**
                         * watch
                         * @type {watch}
                         *
                         * Use to collect scope.$watch method
                         *
                         * use watch() to destroy the $watch method
                         */
                        var watch = function() {};

                        /**
                         * validator
                         * @type {Array}
                         *
                         * Convert user input String to Array
                         */
                        var validation = attrs.validator.split(',');

                        /**
                         * guid use
                         */
                        var uid = ctrl.validationId = guid();


                        /**
                         * Set initial validity to undefined if no boolean value is transmitted
                         */
                        var initialValidity;
                        if (typeof scope.initialValidity === 'boolean') {
                            initialValidity = scope.initialValidity;
                        }

                        /**
                         * Default Valid/Invalid Message
                         */
                        if (!scope.messageId)
                            element.after('<span></span>');

                        /**
                         * Set custom initial validity
                         * Usage: <input initial-validity="true" ... >
                         */
                        ctrl.$setValidity(ctrl.$name, initialValidity);

                        /**
                         * Reset the validation for specific form
                         */
                        scope.$on(ctrl.$name + 'reset-' + uid, function() {

                            /**
                             * clear scope.$watch here
                             * when reset status
                             * clear the $watch method to prevent
                             * $watch again while reset the form
                             */
                            watch();

                            isFocusElement = false;
                            ctrl.$setViewValue('');
                            ctrl.$setPristine();
                            ctrl.$setValidity(ctrl.$name, undefined);
                            ctrl.$render();
                            if (scope.messageId)
                                angular.element(document.querySelector('#' + scope.messageId)).html('');
                            else
                                element.next().html('');
                        });

                        /**
                         * Check validator
                         */

                        (function() {
                            /**
                             * Click submit form, check the validity when submit
                             */
                            scope.$on(ctrl.$name + 'submit-' + uid, function(event, index) {
                                var value = ctrl.$viewValue,
                                    isValid = false;

                                if (index === 0) {
                                    isFocusElement = false;
                                }

                                isValid = checkValidation(scope, element, attrs, ctrl, validation, value);

                                if (attrs.validMethod === 'submit') {
                                    watch(); // clear previous scope.$watch
                                    watch = scope.$watch('model', function(value, oldValue) {

                                        // don't watch when init
                                        if (value === oldValue) {
                                            return;
                                        }

                                        // scope.$watch will translate '' to undefined
                                        // undefined/null will pass the required submit /^.+/
                                        // cause some error in this validation
                                        if (value === undefined || value === null) {
                                            value = '';
                                        }

                                        isValid = checkValidation(scope, element, attrs, ctrl, validation, value);
                                    });

                                }

                                // Focus first input element when submit error #11
                                if (!isFocusElement && !isValid) {
                                    isFocusElement = true;
                                    element[0].focus();
                                }
                            });

                            /**
                             * Validate blur method
                             */
                            if (attrs.validMethod === 'blur') {
                                element.bind('blur', function() {
                                    var value = ctrl.$viewValue;
                                    scope.$apply(function() {
                                        checkValidation(scope, element, attrs, ctrl, validation, value);
                                    });
                                });

                                return;
                            }

                            /**
                             * Validate submit & submit-only method
                             */
                            if (attrs.validMethod === 'submit' || attrs.validMethod === 'submit-only') {
                                return;
                            }

                            /**
                             * Validate watch method
                             * This is the default method
                             */
                            scope.$watch('model', function(value) {
                                /**
                                 * dirty, pristine, viewValue control here
                                 */
                                if (ctrl.$pristine && ctrl.$viewValue) {
                                    // has value when initial
                                    ctrl.$setViewValue(ctrl.$viewValue);
                                } else if (ctrl.$pristine) {
                                    // Don't validate form when the input is clean(pristine)
                                    if (scope.messageId)
                                        angular.element(document.querySelector('#' + scope.messageId)).html('');
                                    else
                                        element.next().html('');
                                    return;
                                }
                                checkValidation(scope, element, attrs, ctrl, validation, value);
                            });

                        })();

                        $timeout(function() {
                            /**
                             * Don't showup the validation Message
                             */
                            attrs.$observe('noValidationMessage', function(value) {
                                var el;
                                if (scope.messageId)
                                    el = angular.element(document.querySelector('#' + scope.messageId));
                                else
                                    el = element.next();
                                if (value == 'true' || value === true) {
                                    el.css('display', 'none');
                                } else if (value == 'false' || value === false) {
                                    el.css('display', 'block');
                                } else {}
                            });
                        });

                    }
                };
            }
        ])

    .directive('validationSubmit', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse');

            return {
                priority: 1, // execute before ng-click (0)
                require: '?ngClick',
                link: function postLink(scope, element, attrs) {
                    var form = $parse(attrs.validationSubmit)(scope);

                    $timeout(function() {
                        // Disable ng-click event propagation
                        element.off('click');
                        element.on('click', function(e) {
                            e.preventDefault();

                            $validationProvider.validate(form)
                                .success(function() {
                                    $parse(attrs.ngClick)(scope);
                                });
                        });
                    });

                }
            };
        }
    ])

    .directive('validationReset', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse');

            return {
                link: function postLink(scope, element, attrs) {
                    var form = $parse(attrs.validationReset)(scope);

                    $timeout(function() {
                        element.on('click', function(e) {
                            e.preventDefault();
                            $validationProvider.reset(form);
                        });
                    });

                }
            };
        }
    ]);

}).call(this);
