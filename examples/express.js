const express = require('express')
const LogFmtr = require('..')

// create a logger
const log = new LogFmtr()

const app = express()

app.use((req, res, next) => {
  const rid = String(Math.random()).substr(2, 6)
  req._rid = rid
  req.log = log.withFields({ rid })
  next()
})

app.use(LogFmtr.middleware)

app.get('/', (req, res) => {
  // add a delay of between 50-150ms
  const delay = (Math.random() * 100) + 50
  req.log.withFields({ delay }).info('req-delay')
  setTimeout(() => {
    res.send('Hello, World!\n')
  }, Math.random() * 1000)
})

app.listen(3000, () => log.withFields({ port : 3000 }).info('server-listening'))
