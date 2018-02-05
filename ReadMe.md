# logfmtr #

Logger like `bole` but formats like `logfmt`. Comes with `express` middleware that works like `morgan`.

Only needs two small dependencies (`on-headers` and `on-finished`) when using the Express middleware logger.

## Why? ##

Teaches you to just log events, rather than infomation. Easy to use, easy to extend with your own fields.

e.g. instead of `console.log('Listening on port %s', 3000)` you would instead log:

```
log.withFields({ port : 3000 }).info('server-started')

// or (coming soon)

log.info({ port : 3000 }, 'server-started')
```

This allows you to parse your logs properly for the required info, rather than parsing your messages.

## Synopsis ##

```js
const LogFmtr = require('logfmtr')

// defaults to `process.stdout`
const log = new LogFmtr()

log.info('start')
// level=info ts=1516739804842 evt=start

// log with different levels
log.debug('1') // level=debug ts=1516740015113 evt=1
log.info('2')  // level=info ts=1516740015113 evt=2
log.warn('3')  // level=warn ts=1516740015113 evt=3
log.error('4') // level=error ts=1516740015113 evt=4

// adding a PID and Hostname has built-in helpers (creates a new logger)
const newLog = log.pid().hostname()
newLog.log('something-happened')
// level=info ts=1516740100839 pid=16095 hostname=ryloth evt=something-happened
```

You can also add fields to be logged every time, such as a RequestID (also see below for Express middleware):

```
// create a new logger with extra fields
const reqLog = log.withFields({ rid : String(Math.random()).substr(2, 6) })
reqLog.info('request')
// level=info ts=1516740075103 rid=330353 evt=request
```

That's pretty much it.

## Express Middleware ##

Works like `morgan`, however this is fully integrated into a logger that you add to the incoming request.

See the `examples/express.js` for more details.

Essentially you create a new logger (perhaps based on the top-level one), and optionally add a RequestID or any other
fields you always want to log during the request lifecycle:

```js
const express = require('express')
const LogFmtr = require('logfmtr')

const log = new LogFmtr()

const app = express()
app.use((req, res, next) => {
  req.log = log
  next()
})

app.use(LogFmtr.middleware)
```

If you want a RequestID logged on every request change your middleware above:

```js
app.use((req, res, next) => {
  // or use `https://npm.im/yid` or `https://npm.im/zid`
  const rid = String(Math.random()).substr(2, 6)
  req.log = log.withFields({ rid })
  next()
})
```

We log 4 events for you: Request Start, Response Start, Response End, Request End. This gives you fine grained info
about exactly what is happening in your application. The Request Start logs info about the request. The Response Start
logs info about the response too. We don't duplicate info across these events since they can be linked together with a
RequestID.

And finally, to use your own logger for events, use `req.log` as you would normally use a logger:

```
app.get((req, res) => {
  req.log('homepage')
  res.send('Hello, World!\n')
})
```

## Author ##

Andrew Chilton.

## License ##

ISC.
