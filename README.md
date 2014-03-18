martaio
=======

Marta.io is currently a dashboard for Marta's realtime train API, and shows train arrival estimates:

![screenshot](https://dl.dropboxusercontent.com/u/32959843/marta_io_screenshot.png)

### Implementation

It's a simple [Nodejs](http://nodejs.org/) app that uses [AngularJS](http://angularjs.org/) on the client-side. It has no database or other server-side storage. The server-side simply serves as a cache of a single API endpoint from Marta. The client-side code consumes that proxied data and does the rest of the work. We scaffolded this app using [Yeoman](http://yeoman.io/)'s [Angular Fullstack Generator](https://www.npmjs.org/package/generator-angular-fullstack).

### Forking your own

#### requirements
You need an API key from Marta to run this app. You can [request from Marta](http://www.itsmarta.com/developers/data-sources/marta-rail-realtime-restful-api.aspx).

Once you have an API key, you can fork the repo and deploy your own to
