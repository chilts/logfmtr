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

test('Test LogFmtr._fmt() with ts // internal method', (t) => {
  t.plan(1)

  const logWithTs = new LogFmtr({ ts : true })
  t.equal(logWithTs._fmt('info', {}, 'found-something').replace(/\d+/, 'xxx'), 'level=info ts=xxx evt=found-something\n', 'With timestamp')

  t.end()
})
