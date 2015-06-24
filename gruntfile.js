/**
 * @file
 *
 * ### Responsibilities
 * - automate common tasks using grunt
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author  <>
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
                src: ['src/**/*.js'],
                options: {
                    breakOnErrors: false,
                    checkstyleXML: 'complexity/checkstyle.xml', // create checkstyle report
                    errorsOnly: false,               // show only maintainability errors
                    maintainability: 100
                }
            }
        },

        concat: {
            dist: {
                src: [
                    '<%= config.app %>/lib/**/*.js',

                    '<%= config.app %>/TokenKind.js',
                    '<%= config.app %>/Token.js',
                    '<%= config.app %>/Tokenizer.js',

                    '<%= config.app %>/ast/SpelNode.js',
                    '<%= config.app %>/ast/*.js',

                    '<%= config.app %>/SpelExpressionParser.js',
                    '<%= config.app %>/SpelExpressionEvaluator.js',
                    '<%= config.app %>/StandardContext.js'
                ],
                dest: '<%= config.dist %>/spel2js.js'
            }
        },

        uglify: {
            dist: {
                src: '<%= config.dist %>/spel2js.js',
                dest: '<%= config.dist %>/spel2js.min.js'
            }
        },

        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        }
    });

    grunt.registerTask('test', [
        'karma:unit'
    ]);

    grunt.registerTask('lint', [
        'jshint'
    ]);

    grunt.registerTask('gpa', [
        'complexity'
    ]);

    grunt.registerTask('build', [
        'concat',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'lint',
        'gpa',
        'test',
        'build'
    ]);
};
