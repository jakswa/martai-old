martaio
=======

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jakswa/martaio?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Marta.io is currently a dashboard for Marta's realtime train API, and shows train arrival estimates:

![screenshot](https://dl.dropboxusercontent.com/u/32959843/marta_io_screenshot.png)

## Implementation

It's a simple [Nodejs](http://nodejs.org/) app that uses [AngularJS](http://angularjs.org/) on the client-side. It has no database or other server-side storage. The server-side simply serves as a cache of a single API endpoint from Marta. The client-side code consumes that proxied data and does the rest of the work. We scaffolded this app using [Yeoman](http://yeoman.io/)'s [Angular Fullstack Generator](https://www.npmjs.org/package/generator-angular-fullstack).

As of March 2015, there now exists a dev-only task that parses MARTA's GTFS
files (CSV format), and creates JSON files for schedule-related data. See 
[here](https://medium.com/@jakswa/marta-realtime-gaps-15614c34dfa1) 
or [here](https://github.com/jakswa/martaio/pull/10) for more information.

## API-related caveats

- A train stopped at its final destination (like doraville or north springs) will not "switch directions" in the API until it leaves. So you'll only see northbound trains for north springs, and you'll only see southbound trains for airport. Same for the east/west extremes.
- The API currently doesn't give estimates for trains about to change directions. If a train leaves chamblee, and it's next stop is doraville, there won't be an estimate for when that train turns around and hits chamblee again. A semi-workaround is to watch the northbound train that is about to switch directions.
- The train API is new, and is bound to change on me. The script is tied to the current API response, which is a list of arrivals:

```json
[{
  DESTINATION: "Airport",
  DIRECTION: "S",
  EVENT_TIME: "3/12/2014 5:40:28 PM",
  LINE: "RED",
  NEXT_ARR: "05:40:37 PM",
  STATION: "WEST END STATION",
  TRAIN_ID: "403506",
  WAITING_SECONDS: "-37",
  WAITING_TIME: "Boarding"
},
...
]
```

## Forking your own

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

##### Optional Newrelic Integration

I installed newrelic on this app today, to see how well it works for Node apps. If you're running your own and want to start reporting to newrelic, set the `NEWRELIC_LICENSE_KEY` environment variable to your newrelic key.
