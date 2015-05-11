module.exports = {
    context : __dirname + '/lib/',
    entry: {
        app: ['./js/suicide.js']
    },
    output : {
        filename : 'bundle.js',
        library : 'suicide',
        libraryTarget : 'var',
        path: __dirname + '/lib'
    }
};
