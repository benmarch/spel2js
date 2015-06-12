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
    app: '.',
    dist: '.'
  };

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
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }
  });

  grunt.registerTask('test', [
    'karma:unit'
  ]);

  grunt.registerTask('build', [
    'uglify'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};