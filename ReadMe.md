# logfmtr #

Structured logger. Works like `bole`. Formats like `logfmt`. Comes with `express` middleware that works like `morgan`.

Only needs two small dependencies (`on-headers` and `on-finished`) when using the Express middleware logger.

## Why? ##

Teaches you to just log events, rather than text. Easy to use, easy to extend with your own fields.

e.g. instead of `console.log('Program Started')` and `console.log('Listening on port %s', 3000)` you would instead log:

```
log.info('started')
log.info({ port : 3000 }, 'server-started')
```

The above code logs the following two lines:

```
level=info ts=1519382949789 evt=started
level=info ts=1519382949791 port=3000 evt=server-started
```

This allows you to parse your structured logs properly for the required info, rather than parsing your text.

This package is also opininated that you should only ever log each event to one place. In general, that should be
`process.stdout` or `process.stderr`. You may choose to create a logger for each, but you don't configure each log to
go to multiple outputs.

## Synopsis ##

```js
const LogFmtr = require('logfmtr')

// defaults to `process.stdout`
const log = new LogFmtr()

log.info('started')
// level=info ts=1516739804842 evt=started

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

## `.withFields()` ##

Works like `bole`. You can also add fields to be logged every time, such as a RequestID (also see below for Express middleware):

```
// create a new logger with extra fields
const reqLog = log.withFields({ rid : String(Math.random()).substr(2, 6) })
reqLog.info('request')
// level=info ts=1516740075103 rid=330353 evt=request
```

That's pretty much it.

## Express Middleware ##

Works like `morgan`, however this is fully integrated into a logger that you add to the incoming request. It also logs
the four main events of each request: request start, request end, response start, and response end. It doesn't pretty print
timings but instead gives you the raw values (in nano-seconds!).

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
RequestID. `morgan` only logs once on request OR response.

And finally, to log your own events during the request, just use `req.log` as a regular `LogFmtr` logger:

```
app.get('/', (req, res) => {
  req.log('homepage')
  res.send('Hello, World!\n')
})
```

Or perhaps log the start and end of a file upload:

```
app.get(
  '/upload',
  (req, res, next) => {
    // middleware to upload a file to Object Storage somewhere
    req.log('upload-start')
    // some async action
    req.log(upload-complete')
  },
  (req, res) => {
    res.send('Thanks.\n')
  }
)
```

See the `examples/express.js` for a complete example.

## Duplicate Field Names ##

`logfmtr` doesn't do anything to explicitly disallow duplicate field names appearing in a single log line. There are a few reasons why:

1. no data loss : we don't really want to throw an error if there is a duplicate field, better to log it anyway so you don't lose any data
2. speed : by not keeping a check on field names, we can just log things as soon as they appear so we can stay fast and nimble

Just remember that there are a few ways for fields to appear in a log line, so if you have duplicates you'll need to check in these places:

1. log `level` (so you shouldn't ever log a field called `level`)
2. `ts` if you have enabled timestamps
3. either `.pid()` or `.hostname()` (don't log `pid` or `hostname`)
4. any fields you've added to the logger using `.withFields()`
5. any fields you log directly with the log level functions (such as `log.info()`)
6. `evt` which comes from the log level functions like `log.info()` (never log a field called `evt`)
7. Express middleware logs various fields such as `ip`, `url`, `method`, `referrer`, `user-agent`, and `http-version`

If you have duplicates, make sure to check each of these places.

## Multiple Loggers - Logging to `stdout` and `stderr` ##

In general you log each event to one output only. To log to multiple places you need to create multiple loggers. There
is no way to configure the loggers so that the same event goes to multiple outputs. (You can also create two loggers to
go to the same output, but that's up to you.)

Logging to `stdout` and `stderr` is pretty easy:

```
// stdout - the follow two lines are equivalent
const logStdOut = new LogFmtr()
const logStdOut = new LogFmtr({ stream : process.stdout })

logStdOut.info('Hello, StdOut!')

// stderr
const logStdErr = new LogFmtr({ stream : process.stderr })

logStdErr.info('Hello, StdErr!')
```

You may, for example, log web requests to `stdout`, but all other diagnostic info to `stderr`. Make sure to use the
same RequestID in each place so you can correlate information at a later date.

## Default Logger ##

Just to make the simplest case easier (and be able to provide the same `log` to every part of your program. you can
call `LogFmtr.default()` to obtain it. It is roughly equivalent to `new LogFmtr()` (the only difference is that if you
want the `.pid()` or `.hostname()` you pass those as boolean options - see below).

```
const LogFmtr = require('logfmtr')

// create and return a default log
const log1 = LogFmtr.default()

// this just returns the above logger since one has already been created
const log2 = LogFmtr.default()

// in another file somewhere, returns the same logger as above
const log3 = require('logfmtr').default()
```

### opts ###

You can also pass an `opts` object into `.default()`. Any subsequent call will ignore opts.

```
const log1 = LogFmtr.default({ ts: true })
const log2 = LogFmtr.default({ pid: true })
const log3 = LogFmtr.default({ hostname: true})
const log4 = LogFmtr.default({ ts: true, pid: true, hostname: true }) // any combination
const log5 = LogFmtr.default({ stream: process.stderr }) // and stream too
```

### fields ###

You can also pass a `fields` object too, as the second argument (the first can't be omitted, so just pass `{}`).

```
const log1 = LogFmtr.default({ ts: true }, { request_id: 123 })
```

## Examples ##

On a Heroku dyno (web or worker) you wouldn't need the timestamp since their logging infrastructure gives you that
already.

```
const log = new LogFmtr()
log.info('This is the message.')
// level=info evt="This is the message."
```

## Author ##

```
$ npx chilts

   ╒════════════════════════════════════════════════════╕
   │                                                    │
   │   Andrew Chilton (Personal)                        │
   │   -------------------------                        │
   │                                                    │
   │          Email : andychilton@gmail.com             │
   │            Web : https://chilts.org                │
   │        Twitter : https://twitter.com/andychilton   │
   │         GitHub : https://github.com/chilts         │
   │         GitLab : https://gitlab.org/chilts         │
   │                                                    │
   │   Apps Attic Ltd (My Company)                      │
   │   ---------------------------                      │
   │                                                    │
   │          Email : chilts@appsattic.com              │
   │            Web : https://appsattic.com             │
   │        Twitter : https://twitter.com/AppsAttic     │
   │         GitLab : https://gitlab.com/appsattic      │
   │                                                    │
   │   Node.js / npm                                    │
   │   -------------                                    │
   │                                                    │
   │        Profile : https://www.npmjs.com/~chilts     │
   │           Card : $ npx chilts                      │
   │                                                    │
   ╘════════════════════════════════════════════════════╛
```

## License ##

ISC.
