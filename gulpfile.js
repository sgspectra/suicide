// Dependencies
var gulp = require('gulp');
var inject = require('gulp-inject');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');

/**
 * Compiles the final hangout.xml file to dist
 */
gulp.task('compile', function(){
    var builder = require('xmlbuilder');
    var fs = require('fs');

    // Inject the script directly into index.html file
    gulp.src('./lib/index.html')
        .pipe(inject(gulp.src(['./lib/js/script.js']), {
            starttag: '<!-- inject:js -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }))
        .pipe(gulp.dest('./dist'));

    // Read the script file
    fs.readFile(__dirname + '/dist/index.html', 'utf-8', function(err, data){
        if (err) {
            return console.log(err);
        }

        // Create root XML node
        var root = builder.create('Module',
            {
                version: '1.0',
                encoding: 'UTF-8'
            }
        );

        // Populate XML file with the contents of the script file
        root.ele({
            'ModulePrefs': {
                '@title': 'Suicide: The Drinking Game',
                '#list': [
                    {
                        'Require' : {
                            '@feature': 'rpc'
                        }
                    },
                    {
                        'Require' : {
                            '@feature': 'views'
                        }
                    },
                    {
                        'Require' : {
                            '@feature': 'locked-domain'
                        }
                    }
                ]
            },
            'Content': {
                '@type' : 'html',
                '#cdata' : data
            }
        });

        // Convert the XML to a string
        var xml = root.end({pretty: true});

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
gulp.task('lint-gulpfile', function(){
    return gulp.src('./gulpfile.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

/**
 * Lints all js in the lib/js dir
 */
gulp.task('lint-lib', function(){
    return gulp.src('./lib/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

/**
 * Task to run all lint subtasks
 */
gulp.task('lint', ['lint-gulpfile', 'lint-lib']);

/**
 * Default gulp task
 */
gulp.task('default', function() {
    runSequence('lint', 'compile');
});
