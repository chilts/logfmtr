# logfmtr #

Logger like bole but formats like logfmt.

** No Dependencies. **

## Synopsis ##

```js
const LogFmtr = require('logfmtr')

// defaults to `process.stdout`
const log = new LogFmtr()

log.info('Hello, World!')
// level=info ts=1516739804842 msg="Hello, World!"

// log with different levels
log.debug('1') // level=debug ts=1516740015113 msg=1
log.info('2')  // level=info ts=1516740015113 msg=2
log.warn('3')  // level=warn ts=1516740015113 msg=3
log.error('4') // level=error ts=1516740015113 msg=4

// create a new logger with extra fields
const reqLog = log.withFields({ rid : String(Math.random()).substr(2) })
reqLog.info('request')
// level=info ts=1516740075103 rid=3303532288237412 msg=request

// adding a PID and Hostname has built-in helpers (creates a new logger
// since it uses `.withFields()` above)
let newLog = log.pid().hostname()
newLog.log('Hi again')
// level=info ts=1516740100839 pid=16095 hostname=ryloth msg="Hi again"
```

That's pretty much it. Soon to be added will be an equivalent of bole's request logger (to log incoming requests) and
a logger similar to morgan (to log finalised requests with extra info).

## Express Middleware ##

Works like `morgan`, however this is fully integrated into a logger that you add to the incoming request.

See the `examples/express.js` for more details.

Essentially you just do the following:

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

## Author ##

Andrew Chilton.

## License ##

ISC.
