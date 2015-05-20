// Dependencies
var bower = require('gulp-bower');
var del = require('del');
var gulp = require('gulp');
var inject = require('gulp-inject');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var webpackDevServer = require('webpack-dev-server');
var webpackGulp = require('gulp-webpack');
var w3cjs = require('gulp-w3cjs');
var scp = require('gulp-scp');

/**
 * Installs the front end dependencies using bower
 */
gulp.task('bower', function(){
    return bower()
        .pipe(gulp.dest('lib/bower_components'));
});

/**
 * Creates a development server
 */
gulp.task('webpack-dev-server', function(){
    // Modify some webpack config options
    var config = Object.create(webpackConfig);
    config.devtool = 'eval';
    config.debug = true;

    // Start a webpack-dev-server
    new webpackDevServer(webpack(config), {
        contentBase : __dirname + '/dist',
        stats : {
            colors : true
        }
    }).listen(8080, 'localhost', function(err){
        console.log('error', err);
    });
});

/**
 * Builds the final optimized bundle
 */
gulp.task('webpack', function(){
    // Modify some webpack config options
    var config = Object.create(webpackConfig);
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());

    return gulp.src('./lib/js/suicide.js')
        .pipe(webpackGulp(config))
        .pipe(gulp.dest('dist/'));
});

/**
 * Puts XML file at ajstorch.com
 */
gulp.task('scp', function(){
    gulp.src('./dist/hangout.xml')
		.pipe(scp({
    		host : 'ajstorch.com',
    		user : 'andsto45',
    		port : 22,
    		path : '~/ajstorch.com/suicide-hangout'
		}));
});

/**
 * Cleans dist
 */
gulp.task('clean', function(){
    del([
        'dist/*',
        '!dist/.gitignore'
    ]);
});

/**
 * Injects the lib/js/script.js into lib/index.html and writes to dist/index.html. Should be used for prod only.
 */
gulp.task('inject:prod', ['webpack'], function(){
    return gulp.src('./lib/index.html')
        .pipe(inject(gulp.src(['./dist/bundle.js']), {
            starttag : '<!-- inject:js -->',
            transform : function(filePath, file){
                return '<script type="text/javascript">' + file.contents.toString('utf8') + '</script>';
            }
        }))
        .pipe(gulp.dest('./dist'));
});

/**
 * Injects a reference to the bundle created by webpack-dev-server. Should be used for dev only.
 */
gulp.task('inject:dev', function(){
    return gulp.src('./lib/index.html')
        .pipe(inject(gulp.src(['./lib/js/suicide.js']), {
            starttag : '<!-- inject:js -->',
            transform : function(){
                return '<script type="text/javascript" src="bundle.js"></script>';
            }
        }))
        .pipe(gulp.dest('./dist'));
});

/**
 * Compiles the final hangout.xml file to dist by creating file and injecting dist/index.html
 */
gulp.task('compile', ['inject:prod'], function(){
    var builder = require('xmlbuilder');
    var fs = require('fs');

    // Read the script file
    fs.readFile(__dirname + '/dist/index.html', 'utf-8', function(err, data){
        if (err) {
            return console.log(err);
        }

        // Create root XML node
        var root = builder.create('Module',
            {
                version : '1.0',
                encoding : 'UTF-8'
            }
        );

        // Populate XML file with the contents of the script file
        root.ele({
            'ModulePrefs' : {
                '@title' : 'Suicide: The Drinking Game',
                '#list' : [
                    {
                        'Require' : {
                            '@feature' : 'rpc'
                        }
                    },
                    {
                        'Require' : {
                            '@feature' : 'views'
                        }
                    },
                    {
                        'Require' : {
                            '@feature' : 'locked-domain'
                        }
                    }
                ]
            },
            'Content' : {
                '@type' : 'html',
                '#cdata' : data
            }
        });

        // Convert the XML to a string
        var xml = root.end({pretty : true});

        // Write compiled file to dist
        fs.writeFile(__dirname + '/dist/hangout.xml', xml, function(err){
            if (err) {
                return console.log(err);
            }
        });
    });
});

/**
 * Lints the gulpfile
 */
gulp.task('lint:gulpfile', function(){
    return gulp.src('./gulpfile.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

/**
 * Lints all js in the lib/js dir
 */
gulp.task('lint:lib', function(){
    return gulp.src('./lib/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

/**
 * Runs style check on all js in lib/js
 */
gulp.task('jscs:lib', function(){
    return gulp.src('./lib/js/*.js')
        .pipe(jscs({
            configPath : '.jscsrc',
            fix : true
        }))
        .pipe(gulp.dest('./lib/js'));
});

/**
 * Runs style check on config files
 */
gulp.task('jscs:config', function(){
    return gulp.src(['./gulpfile.js', './webpack.config.js'])
        .pipe(jscs({
            configPath : '.jscsrc',
            fix : true
        }))
        .pipe(gulp.dest('./'));
});

/**
 * Copies all the images from lib/img to dist/img
 */
gulp.task('copy', function(){
    return gulp.src('./lib/img/**/*.*')
        .pipe(gulp.dest('./dist/img'));
});

/**
 * Validates HTML using W3C validation
 */
gulp.task('w3cjs', function(){
    gulp.src('./lib/index.html')
        .pipe(w3cjs());
});

/**
 * Task to run all lint subtasks
 */
gulp.task('lint', ['lint:gulpfile', 'lint:lib', 'jscs:lib', 'jscs:config', 'w3cjs']);

/**
 * Task to be used during development. Starts up a dev server at http://localhost:8080/
 */
gulp.task('dev', ['copy', 'inject:dev', 'webpack-dev-server']);

/**
 * Default gulp task
 */
gulp.task('default', function(){
    runSequence('bower', 'clean', 'lint', 'copy', 'compile');
});
