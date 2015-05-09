// Dependencies
var gulp = require('gulp');

/**
 * Compiles the final hangout.xml file to dist
 */
gulp.task('compile', function(){
    var builder = require('xmlbuilder');
    var fs = require('fs');

    // Read the script file
    fs.readFile(__dirname + '/lib/index.html', 'utf-8', function(err, data){
        if (err) return console.log(err);

        // Create root XML node
        var root = builder.create('root',
            {
                version: '1.0',
                encoding: 'UTF-8'
            }
        );

        // Populate XML file with the contents of the script file
        root.ele({
            'Module': {
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
            }
        });

        // Convert the XML to a string
        var xml = root.end({pretty: true});

        // Write compiled file to dist
        fs.writeFile(__dirname + '/dist/hangout.xml', xml, function(err){
            if (err) return console.log(err);
        });
    });
});

gulp.task('default', function(){
    // place code for your default task here
});
