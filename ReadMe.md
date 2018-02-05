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

## In a Server Request ##

You can log some of the requests fields with `.withReq(req)`:

```js
const http = require('http')

const log = new LogFmtr()

const server = http.createServer((req, res) => {
  // create a new logger with a `Request ID` and some of the fields from the request
  const reqLogger = log.withFields({ rid : String(Math.random()).substr(2) }).withReq(req)

  reqLogger.info('New Request')

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello World\n')

  reqLogger.info('Request Finished')
})

server.listen(port, hostname, () => {
  log.info(`Server running at http://${hostname}:${port}/`)
})
```

Gives something like this (for one `curl localhost:3000`). Note: the 2nd two lines are split so it's easier to read in this file.

```
level=info ts=1517824170845 msg="Server running at http://127.0.0.1:3000/"

level=info
ts=1517824175239
rid=8197861118413432
method=GET
url=/
headers="{\"host\":\"localhost:3000\",\"user-agent\":\"curl/7.47.0\",\"accept\":\"*/*\"}"
remoteAddress=127.0.0.1
remotePort=52376
msg="New Request"

level=info
ts=1517824175245
rid=8197861118413432
method=GET
url=/
headers="{\"host\":\"localhost:3000\",\"user-agent\":\"curl/7.47.0\",\"accept\":\"*/*\"}"
remoteAddress=127.0.0.1
remotePort=52376
msg="Request Finished"
```

## Author ##

Andrew Chilton.

## License ##

ISC.
