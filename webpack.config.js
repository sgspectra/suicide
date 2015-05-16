var webpack = require('webpack');

var bower = __dirname + '/lib/bower_components';

module.exports = {
    context : __dirname + '/lib/',
    entry : {
        app : ['./js/suicide.js']
    },
    module : {
        loaders : [
            {
                test : /\.css$/,
                loader : 'style-loader!css-loader'
            },
            {
                test : /\.png$/,
                loader : 'url-loader?mimetype=image/png'
            },
            {
                test : /\.gif/,
                loader : 'url-loader?mimetype=image/gif'
            },
            {
                test : /\.woff$/,
                loader : 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test : /\.ttf$/,
                loader : 'file-loader'
            },
            {
                test : /\.eot$/,
                loader : 'file-loader'
            },
            {
                test : /\.svg$/,
                loader : 'file-loader'
            }
        ],
        noParse : [
            bower + '/jquery/dist/jquery.js',
            bower + '/underscore/underscore.js'
        ]
    },
    plugins : [
        new webpack.ProvidePlugin({
            $ : 'jquery',
            _ : 'underscore',
            jQuery : 'jquery'
        })
    ],
    resolve : {
        alias : {
            jquery : bower + '/jquery/dist/jquery.js',
            underscore : bower + '/underscore/underscore.js'
        }
    },
    output : {
        filename : 'bundle.js',
        library : 'suicide',
        libraryTarget : 'var',
        path : __dirname + '/dist'
    }
};
