module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '@*/grunt-*', 'angular-grunt-*']});
    require('time-grunt')(grunt);

    var appConfig = {
        src: 'app',
        tmp: 'tmp',
        dist: 'public',
        name: 'mapBuilder'
    };

    grunt.initConfig({
        app: appConfig,

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= app.dist %>/js/**/*.js',
                    '<%= app.dist %>/css/**/*.css'
                ]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: {
                    '<%= app.tmp %>/js/app.js': ['<%= app.tmp %>/js/app.js']
                }
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= app.src %>/js/**/*.js'],
                tasks: ['angular_build:dist', 'concat:dist', 'copy:js'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            sass: {
                files: ['<%= app.src %>/styles/**/*.scss'],
                tasks: ['sass'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            html: {
                files: ['<%= app.src %>/index.tpl.html'],
                tasks: ['includeSource:dist'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            views: {
                files: ['<%= app.src %>/views/**/*.html'],
                tasks: ['copy:views'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: false,
                    middleware: function (connect) {
                        return [
                            connect.static(appConfig.dist)
                        ];
                    }
                }
            }
        },

        bower_concat: {
            dist: {
                dest: '<%= app.tmp %>/js/vendor/bower.js'
            }
        },

        includeSource: {
            options: {
                basePath: '<%= app.dist %>',
                baseUrl: '<%= app.dist %>'
            },
            dist: {
                files: {
                    '<%= app.dist %>/index.html': '<%= app.src %>/index.tpl.html'
                }
            }
        },

        clean: {
            tmp: {
                files: [{
                    expand: true,
                    src: [
                        '<%= app.tmp %>'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    src: [
                        '<%= app.dist %>'
                    ]
                }]
            }
        },

        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: '<%= app.tmp %>',
                    dest: '<%= app.dist %>',
                    src: [
                        '**/*.js'
                    ]
                }]
            },
            views: {
                files: [{
                    expand: true,
                    cwd: '<%= app.src %>',
                    dest: '<%= app.dist %>',
                    src: [
                        '*.html',
                        '!*.tpl.html',
                        'views/**/*.html'
                    ]
                }]
            },
            // styles: {
            //     files: [{
            //         expand: true,
            //         cwd: '<%= app.src %>',
            //         dest: '<%= app.dist %>',
            //         src: [
            //             'css/**/*.css'
            //         ]
            //     }]
            // },
            images: {
                files: [{
                    expand: true,
                    cwd: '<%= app.src %>',
                    dest: '<%= app.dist %>',
                    src: [
                        'img/**/*'
                    ]
                }]
            }
        },

        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.src %>',
                    dest: '<%= app.dist %>',
                    src: [
                        'styles/app.scss'
                    ],
                    ext: '.css'
                }]
            }
        },

        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>',
                    dest: '<%= app.dist %>',
                    src: [
                        'css/**/*.css'
                    ]
                }]
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({})
                ]
            },
            dist: {
                src: '<%= app.dist %>/styles/app.css'
            }
        },

        uglify: {
            // options: {
            //     mangle: false
            // },
            vendor: {
                files: [{
                    expand: true,
                    cwd: '<%= app.tmp %>/js/vendor',
                    src: '**/*.js',
                    dest: '<%= app.dist %>/js/vendor'
                }]
            },
            app: {
                files: [{
                    expand: true,
                    cwd: '<%= app.tmp %>/js',
                    src: ['**/*.js', '!vendor/**/*.js'],
                    dest: '<%= app.dist %>/js'
                }]
            }
        },

        ngtemplates: {
            options: {
                url: function (url) {
                    return url.replace('app/', '')
                }
            },
            'mapBuilder': {
                src: '<%= app.src %>/views/**/*.html',
                dest: '/js/templates.js',
                options: {
                    htmlmin: {collapseWhitespace: true, collapseBooleanAttributes: true}
                }
            }
        },

        mkdir: {
            dist: {
                options: {
                    create: ['<%= app.tmp %>']
                }
            }
        },

        concat: {
            dist: {
                src: ['<%= app.tmp %>/js/app.js', '<%= app.src %>/js/vendor/**/*.js'],
                dest: '<%= app.tmp %>/js/app.js'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            clean: [
                'clean:tmp',
                'clean:dist'
            ],
            dist1: [
                'bower_concat:dist',
                'angular_build:dist'
            ],
            dist2: [
                'ngAnnotate:dist',
                'sass',
                'postcss:dist',
                'copy:images'
            ],
            dev: [
                'copy:views',
                'copy:js'
            ],
            prod: [
                'cssmin:dist',
                'uglify:vendor',
                'uglify:app'
            ]
        },

        angular_build: {
            dist: {
                source: '<%= app.src %>',
                destination: '<%= app.tmp %>',
                appName: '<%= app.name %>'
            }
        }
    });


    grunt.registerTask('serve', [
        'concurrent:clean',
        'concurrent:dist1',
        'concat:dist',
        'concurrent:dist2',
        'concurrent:dev',
        'includeSource:dist',
        'connect:livereload',
        'watch'
    ]);

    grunt.registerTask('build', [
        'concurrent:clean',
        'mkdir:dist',
        'concurrent:dist1',
        'concat:dist',
        'concurrent:dist2',
        'concurrent:prod',
        'copy:views',
        'filerev:dist',
        'includeSource:dist'
    ]);

    grunt.registerTask('default', ['serve']);
};
