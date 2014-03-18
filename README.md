martaio
=======

Marta.io is currently a dashboard for Marta's realtime train API, and shows train arrival estimates:

![screenshot](https://dl.dropboxusercontent.com/u/32959843/marta_io_screenshot.png)

### Implementation

It's a simple [Nodejs](http://nodejs.org/) app that uses [AngularJS](http://angularjs.org/) on the client-side. It has no database or other server-side storage. The server-side simply serves as a cache of a single API endpoint from Marta. The client-side code consumes that proxied data and does the rest of the work. We scaffolded this app using [Yeoman](http://yeoman.io/)'s [Angular Fullstack Generator](https://www.npmjs.org/package/generator-angular-fullstack).

### Forking your own

1. You need an API key from Marta to run this app. You can [request one from Marta](http://www.itsmarta.com/developers/data-sources/marta-rail-realtime-restful-api.aspx).
2. Set the `MARTA_TRAIN_API_KEY` environment variable to the key you received from Marta.
3. Run the App. 
  - While developing, you use `grunt serve` to start things up.
  - When deploying to a hosting service, you use `grunt build` to generate a deployable version in the `/dist` directory, and then deploy the contents of that directory.

For example, after setting up a heroku app to deploy to heroku, I run:
 - `grunt build`
 - `cd dist`
 - `git commit [...]`
 - `git remote add heroku git@heroku.com:your-heroku-app.git` (if I haven't already run this)
 - `git push heroku master` to deploy to [Heroku](http://heroku.com/).
