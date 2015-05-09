# suicide
Google+ Hangout Drinking Card Game

## Configuration
Google+ Hangout configuration file located at [http://ajstorch.com/suicide-hangout/hangout.xml](http://ajstorch.com/suicide-hangout/hangout.xml).

## Dependencies
Install gulp globally
    
    sudo npm install -g gulp
    
Install the other dependencies

    sudo npm install

## Building
Clean the dist directory

    gulp clean
    
Compile all resources into dist/hangout.xml

    gulp compile
    
Lint the gulpfile

    gulp lint:gulpfile
    
Lint the lib directory

    gulp lint:lib
    
Run all lint tasks

    gulp lint
    
Run all build tasks

    gulp
