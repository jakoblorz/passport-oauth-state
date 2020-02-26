# passport-oauth-state
Fixes passport.js broken security on passport-oauth strategies when passport is used sessionless.

## DO NOT USE YET, TESTS PENDING

## Vulnerability / Problem
During a recent [PR](https://github.com/outline/outline/pull/1183) in [outline/outline](https://github.com/outline/outline) to introduce [passport.js](http://www.passportjs.org/), I realized that when using

- [koa](https://koajs.com/)
- **and** [passport.js](http://www.passportjs.org/) (only using sessionless actions, so without mounted session-middleware such as `koa-session`, `express-session` and `passport.session()`)
- **and** [koa-passport](https://www.npmjs.com/package/koa-passport) to translate koa's `ctx` object into express.js's `req` object
- **and** any direct or inherited strategies from [passport-oauth](https://github.com/jaredhanson/passport-oauth) (that includes *passport-oauth2*),

the state store fails to initialize (when `state: true` is set in the strategie's options). Thus the `state=` query argument is not set and verified, which may result in possible replay-attacks / session-hijacking.

## What fails in the given environment?
[passport-oauth](https://github.com/jaredhanson/passport-oauth) requires the presence of a `session` object to set the state on, not only the `cookies` object. Because [passport.js](http://www.passportjs.org/) is configured to be sessionless, there is no such object. Please note that this incompatibility may also occur on express.js.

## How does this package solve this problem?
[passport-oauth](https://github.com/jaredhanson/passport-oauth) includes the (undocument _sigh_) option (`store` in the options object) to configure the store itself. It does not export the included stores, so this package implements a store which uses the `cookies` object instead of the `session` object.


## What is a State Store?
[passport-oauth](https://github.com/jaredhanson/passport-oauth) introduces a `StateStore` which sets a cookie called `state` on the intiating computer before redirecting to the third-party provider (this redirect includes the state value). When the third-party provider redirects back, he includes the given state value again. The client must then verify that a cookie `state` exists on the computer and that the value corresponds to the one in the second redirect. If that is not the case, the session might have been hijacked and user data may has been exposed. Finally, the cookie is removed.