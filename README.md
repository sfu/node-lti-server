# node-lti-server

An extensible, general-purpose web server for serving [LTI](https://lti-examples.heroku.com/code.html) apps for [SFU Canvas](http://www.sfu.ca/canvas).

## Current LTI Apps
* libraryReserves: displays the items on reserve at the [SFU Library](http://www.lib.sfu.ca) for a given Canvas course
* courseDescription: allows a user to embed the official [SFU Academic Calendar](http://www.sfu.ca/calendar) course description in a page by clicking a button in the rich text editor.

## Adding Apps
To add an app, simply create a new folder in `./components`. Put your app logic (routes, etc) in `./components/[YOUR_APP]/index.js`. You can create a `public` folder to hold your static assets; this will become automatically available at `http://SERVER/YOUR_APP/{javascripts,stylesheets,images,etc}/FILENAME`. Create a `views` folder for your views. In order to render views, you must explicitly tell `res.render()` where to find them: `res.render(path.join(__dirname, 'views/index'))`.

Look at `components/libraryReserves` or `components/courseDescription` for examples. There are probably better ways to do this, but it works.

## Deploying
To deploy to your localhost for development, `NODE_ENV=development node app`. For convenience, you may want to create a `configuration-dev.xml` file for your LTI app so you don't have to keep modifying your production one to point to your workstation. Note that `configuration-dev.xml` is in `.gitignore`.

To deploy to staging or production, use [Bamboo](https://bamboo.its.sfu.ca/bamboo/browse/NODELTI).