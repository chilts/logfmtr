const test = require('tape')

const LogFmtr = require('.')

test('First test', (t) => {
  t.plan(1)

  const log = new LogFmtr()

  log.debug('1')
  log.info('2')
  log.warn('3')
  log.error('4')
  t.pass('Things seem to work')

  t.end()
})
