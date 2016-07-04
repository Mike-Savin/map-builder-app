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