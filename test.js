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
