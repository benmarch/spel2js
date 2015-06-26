/**
 * @file
 *
 * ### Responsibilities
 * - automate common tasks using grunt
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author  Ben March <bmarch89@gmail.com>
 */
'use strict';

module.exports = function (grunt) {
    var config = {
        app: 'src',
        dist: 'dist'
    };

    require('load-grunt-tasks')(grunt);     //auto-load tasks
    require('time-grunt')(grunt);           //keep track of task execution times

    grunt.initConfig({
        config: config,

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'gruntfile.js',
                '<%= config.app %>/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },

        complexity: {
            all: {
                src: ['dist/spel2js.js'],
                options: {
                    breakOnErrors: false,
                    checkstyleXML: 'complexity/checkstyle.xml', // create checkstyle report
                    errorsOnly: false,               // show only maintainability errors
                    maintainability: 100
                }
            }
        },

        uglify: {
            options: {
                banner: grunt.file.read('./license-banner.txt')
            },
            dist: {
                src: '<%= config.dist %>/spel2js.js',
                dest: '<%= config.dist %>/spel2js.min.js'
            }
        },

        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        },


        browserify: {
            dist: {
                options: {
                    transform: [
                        [
                            'babelify',
                            {
                                stage: 0
                            }
                        ]
                    ],
                    browserifyOptions: {
                        standalone: 'spel2js'
                    },
                    banner: grunt.file.read('./license-banner.txt')
                },
                files: {
                    'dist/spel2js.js': 'src/main.js'
                }
            }
        },

        release: {
            options: {
                additionalFiles: ['bower.json'],
                indentation: '    ',
                commitMessage: 'Committing release tag <%= version %>',
                tagMessage: 'Bumped version to <%= version %>'
            }
        }

    });

    grunt.registerTask('test', [
        'karma:unit'
    ]);

    grunt.registerTask('lint', [
        'jshint'
    ]);

    grunt.registerTask('build', [
        'browserify',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'lint',
        'test',
        'build'
    ]);
};
