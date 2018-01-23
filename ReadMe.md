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

// adding a PID and Hostname has built-in helpers
let newLog = log.pid().hostname()
newLog.log('Hi again')
// level=info ts=1516740100839 pid=16095 hostname=ryloth msg="Hi again"
```

That's pretty much it. Soon to be added will be an equivalent of bole's request logger (to log incoming requests) and
a logger similar to morgan (to log finalised requests with extra info).

## Author ##

Andrew Chilton.

## License ##

ISC.
