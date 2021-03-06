const test = require('tape')

const LogFmtr = require('.')

test('Plain log events', (t) => {
  t.plan(1)

  const log = new LogFmtr()

  log.debug('1')
  log.info('2')
  log.warn('3')
  log.error('4')

  t.pass('Passed')

  t.end()
})

test('Events with Objects', (t) => {
  t.plan(1)

  const log = new LogFmtr()

  log.debug({ a : 1 }, '1')
  log.info({ b : 2, c : 3 }, '2')
  log.warn({ hi : 'Hi!', 'hello-world' : 'Hello, World!' }, '3')
  log.error({}, '4')

  t.pass('Passed')

  t.end()
})

test('Test LogFmtr._fmt() levels // internal method', (t) => {
  t.plan(6)

  const log = new LogFmtr({ ts : false })
  t.equal(log._fmt('debug', {}, 'ok'), 'level=debug evt=ok\n', 'Log debug')
  t.equal(log._fmt('info', {}, 'ok'), 'level=info evt=ok\n', 'Log info')
  t.equal(log._fmt('log', {}, 'ok'), 'level=log evt=ok\n', 'Log log (same as info)')
  t.equal(log._fmt('warn', {}, 'ok'), 'level=warn evt=ok\n', 'Log warn')
  t.equal(log._fmt('error', {}, 'ok'), 'level=error evt=ok\n', 'Log error')

  // and since this is just an internal method, it just reflects the log level back
  t.equal(log._fmt('misc', {}, 'ok'), 'level=misc evt=ok\n', 'Log misc')

  t.end()
})

test('Test LogFmtr._fmt() // internal method', (t) => {
  t.plan(12)

  const logPlain = new LogFmtr({ ts : false })
  t.equal(logPlain._fmt('info', {}, 'save-ok'), 'level=info evt=save-ok\n', 'A simple log works')
  t.equal(logPlain._fmt('info', { a : '' }, 'key-set'), 'level=info a= evt=key-set\n', 'An empty string value')
  t.equal(logPlain._fmt('info', { a : 'b' }, 'logged-in'), 'level=info a=b evt=logged-in\n', 'One field provided')
  t.equal(logPlain._fmt('info', { a : 'b', c : 'd' }, 'started'), 'level=info a=b c=d evt=started\n', 'Two fields provided')
  t.equal(logPlain._fmt('info', { a : true }, 'found-it'), 'level=info a=true evt=found-it\n', 'A boolean field')
  t.equal(logPlain._fmt('info', { a : false }, 'not-found'), 'level=info a=false evt=not-found\n', 'Another boolean field')
  t.equal(logPlain._fmt('info', { a : null }, 'loaded'), 'level=info a evt=loaded\n', 'A blank field with no value')
  t.equal(logPlain._fmt('info', { port : 3000 }, 'listening'), 'level=info port=3000 evt=listening\n', 'An integer field')
  t.equal(logPlain._fmt('info', { pi : 3.14 }, 'found-pi'), 'level=info pi=3.14 evt=found-pi\n', 'A float field')

  t.equal(logPlain._fmt('info', { obj : {} }, 'got-obj'), 'level=info obj={} evt=got-obj\n', 'An object field')
  t.equal(logPlain._fmt('info', { obj : { ok: true, msg: "Hello" } }, 'got-arr'), 'level=info obj={"ok":true,"msg":"Hello"} evt=got-arr\n', 'An array field')

  t.equal(logPlain._fmt('info', { arr : [] }, 'got-arr'), 'level=info arr=[] evt=got-arr\n', 'An array field')

  t.end()
})

test('Test LogFmtr._fmt() for escaping // internal method', (t) => {
  t.plan(9)

  const logPlain = new LogFmtr({ ts : false })
  t.equal(logPlain._fmt('info', { msg : 'Hello, World!' }, 'ok'), 'level=info msg="Hello, World!" evt=ok\n', 'Simple quoting')
  t.equal(logPlain._fmt('info', { msg : 'Heading\nParagraph.' }, 'ok'), 'level=info msg=Heading\\nParagraph. evt=ok\n', 'No quoting needed here')
  t.equal(logPlain._fmt('info', { msg : '"Quote"!' }, 'ok'), 'level=info msg=\\"Quote\\"! evt=ok\n', 'Quotes not necessarily required for quotes')
  t.equal(logPlain._fmt('info', { msg : 'A "Combination"\nfor everything!\n' }, 'ok'), 'level=info msg="A \\"Combination\\"\\nfor everything!\\n" evt=ok\n', 'Quotes definitely required')

  t.equal(logPlain._fmt('info', { msg : '☕' }, 'ok'), 'level=info msg=☕ evt=ok\n', "Emoji don't need quotes")
  t.equal(logPlain._fmt('info', { msg : ' ' }, 'ok'), 'level=info msg=" " evt=ok\n', "A single space needs quotes")
  t.equal(logPlain._fmt('info', { msg : '\n' }, 'ok'), 'level=info msg=\\n evt=ok\n', "A single newline doesn't need quotes")
  t.equal(logPlain._fmt('info', { msg : '"' }, 'ok'), 'level=info msg=\\" evt=ok\n', "A single quote doesn't need quotes")
  t.equal(logPlain._fmt('info', { msg : '\\' }, 'ok'), 'level=info msg=\\\\ evt=ok\n', "A single just needs one backslash escape")

  t.end()
})

test('Test LogFmtr._fmt() for Objects and Arrays', (t) => {
  t.plan(2)

  const obj = { a: 1, b: "Hello, World!", c: true }
  const arr = [ 1, "Hello, World!", true ]

  const logPlain = new LogFmtr()
  t.equal(logPlain._fmt('info', { obj }, 'ok'), 'level=info obj={"a":1,"b":"Hello, World!","c":true} evt=ok\n', 'Simple object JSON')
  t.equal(logPlain._fmt('info', { arr }, 'ok'), 'level=info arr=[1,"Hello, World!",true] evt=ok\n', 'Simple Array JSON')

  t.end()
})

test('Test LogFmtr._fmt() with ts // internal method', (t) => {
  t.plan(1)

  const logWithTs = new LogFmtr({ ts : true })
  t.equal(logWithTs._fmt('info', {}, 'found-something').replace(/\d+/, 'xxx'), 'level=info ts=xxx evt=found-something\n', 'With timestamp')

  t.end()
})

test('Get a default logger', (t) => {
  t.plan(3)

  const log1 = LogFmtr.default()
  const log2 = LogFmtr.default()

  t.equal(log1, log2, 'log1 and log2 are the same')

  const log3 = new LogFmtr()

  t.notEqual(log1, log3, 'log1 and log3 are different')
  t.notEqual(log2, log3, 'log2 and log3 are different')

  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  t.end()
})

test('Get a default logger with opts', (t) => {
  t.plan(8)

  let log = null

  // each test creates a new logger with options, but the 2nd call ignores the `opts`

  log = LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok'), 'level=log evt=ok\n', 'Default log looks okay - 1')
  LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok'), 'level=log evt=ok\n', 'Default log looks okay - 2')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  log = LogFmtr.default({ pid: true })
  t.equal(log._fmt('log', {}, 'ok').replace(/pid=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with PID - 1')
  LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok').replace(/pid=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with PID - 2')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  log = LogFmtr.default({ hostname: true })
  t.equal(log._fmt('log', {}, 'ok').replace(/hostname=\w+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Hostname - 3')
  LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok').replace(/hostname=\w+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Hostname - 3')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  log = LogFmtr.default({ ts: true })
  t.equal(log._fmt('log', {}, 'ok').replace(/ts=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Timestamp - 4')
  LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok').replace(/ts=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Timestamp - 4')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  t.end()
})

test('Get a default logger with fields', (t) => {
  t.plan(4)

  let log = null

  // each test creates a new logger with options, but the 2nd call ignores the `opts`

  log = LogFmtr.default({}, { rid: 1 })
  t.equal(log._fmt('log', {}, 'ok'), 'level=log rid=1 evt=ok\n', 'Default log looks okay - 1')
  LogFmtr.default()
  t.equal(log._fmt('log', {}, 'ok'), 'level=log rid=1 evt=ok\n', 'Default log looks okay - 2')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  log = LogFmtr.default({ ts: true, pid: true, hostname: true }, { rid: 2 })
  const line1 = log._fmt('log', {}, 'ok')
    .replace(/pid=\d+/, '{pid}')
    .replace(/hostname=\w+/, '{hostname}')
    .replace(/ts=\d+/, '{ts}')
  t.equal(line1, 'level=log {ts} {pid} {hostname} rid=2 evt=ok\n', 'Default log with PID - 1')
  LogFmtr.default()
  const line2 = log._fmt('log', {}, 'ok')
    .replace(/pid=\d+/, '{pid}')
    .replace(/hostname=\w+/, '{hostname}')
    .replace(/ts=\d+/, '{ts}')
  t.equal(line2, 'level=log {ts} {pid} {hostname} rid=2 evt=ok\n', 'Default log with PID - 2')
  LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  // log = LogFmtr.default({ hostname: true })
  // t.equal(log._fmt('log', {}, 'ok').replace(/hostname=\w+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Hostname - 3')
  // LogFmtr.default()
  // t.equal(log._fmt('log', {}, 'ok').replace(/hostname=\w+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Hostname - 3')
  // LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  // log = LogFmtr.default({ ts: true })
  // t.equal(log._fmt('log', {}, 'ok').replace(/ts=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Timestamp - 4')
  // LogFmtr.default()
  // t.equal(log._fmt('log', {}, 'ok').replace(/ts=\d+/, '{}'), 'level=log {} evt=ok\n', 'Default log with Timestamp - 4')
  // LogFmtr.clearLog_DO_NOT_USE_THIS_IS_ONLY_FOR_TESTS()

  t.end()
})
