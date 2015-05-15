# suicide
Google+ Hangout Drinking Card Game

## Configuration
Google+ Hangout configuration file located at [http://ajstorch.com/suicide-hangout/hangout.xml](http://ajstorch.com/suicide-hangout/hangout.xml).

## Dependencies
Install gulp globally
    
    sudo npm install -g gulp
    
Install the other dependencies

    sudo npm install
    gulp bower

## Building
Clean the dist directory

    gulp clean
    
Lint the gulpfile

    gulp lint:gulpfile
    
Lint the lib directory

    gulp lint:lib
    
Run all lint tasks

    gulp lint
    
Prepares the dev server, it will be accessible on [http://localhost:8080/](http://localhost:8080/)

    gulp dev
    
Builds the production hangout.xml file

    gulp
