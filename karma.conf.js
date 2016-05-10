module.exports = function (config) {
    config.set({
        frameworks: ['browserify', 'jasmine'],
        basePath: '.',
        files: [
            './node_modules/reflect-metadata/Reflect.js',
            {pattern: 'dist/**/*.js', included: true, watched: true}
        ],
        preprocessors: {
            'dist/**/*.js': ['browserify']
        },
        logLevel: config.LOG_INFO,
        colors: true,
        autoWatch: true,
        browsers: ['Chrome'],
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-browserify'
        ],
        reporters: ['progress', 'dots']
    })
};