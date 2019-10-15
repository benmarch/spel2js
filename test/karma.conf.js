/**
 * @file
 *
 * ### Responsibilities
 * - configure karma for jasmine testing
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author  <>
 */
'use strict';
require('babel-register');
var webpackConfig = require('../webpack.config.babel').default;

webpackConfig.devtool = 'inline-source-map';
webpackConfig.externals = {};
webpackConfig.module.rules.unshift(
    //get coverage info from precompiled source code
    {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /(test|node_modules|bower_components)\//,
        use: 'babel-istanbul-loader',
    }
);

module.exports = function (config) {
    config.set({
        /*
         Path used to resolve file paths
         */
        basePath : '../',

        /*
         Test framework to use:
         jasmine, mocha, qunit etc.
         */
        frameworks: ['jasmine', 'source-map-support'],

        files: [
            'src/main.js',
            'test/spec/**/*.spec.js'
        ],

        /*
         Test pre-processors
         */
        preprocessors: {
            'src/**/*.js': ['webpack', 'sourcemap'],
            'test/**/*spec.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true,
        },

        /*
         Test results reporter to use:
         dots, progress, nyan, story, coverage etc.
         */
        reporters: ['dots', 'coverage'],

        /*
         Test coverage reporters:
         html, lcovonly, lcov, cobertura, text-summary, text, teamcity, clover etc.
         */
        coverageReporter: {
            reporters: [{
                type: 'text',
                dir: 'test/coverage'
            }, {
                type: 'lcov',
                dir: 'test/coverage'
            }]
        },

        /*
         Locally installed browsers
         Chrome, ChromeCanary, PhantomJS, Firefox, Opera, IE, Safari, iOS etc.
         */
        browsers: ['ChromeHeadless'],

        /*
         Enable / disable watching file and executing tests whenever any file changes
         */
        autoWatch: false,

        /*
         Continuous Integration mode: if true, it capture browsers, run tests and exit
         */
        singleRun: true,

        /*
         Report slow running tests, time in ms
         */
        reportSlowerThan: 250,

        /*
         If browser does not capture in given timeout [ms], kill it
         Increasing timeout in case connection in Travis CI is slow
         */
        captureTimeout: 100000,

        /*
         Logging Level:
         DISABLE, ERROR, WARN, INFO, DEBUG
         */
        logLevel: 'INFO',
    });
};
