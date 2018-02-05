// ----------------------------------------------------------------------------
//
// This whole file was inspired by https://npm.im/morgan
//
// ----------------------------------------------------------------------------

"use strict"

// npm
const onHeaders = require('on-headers')
const onFinished = require('on-finished')

// ----------------------------------------------------------------------------

const NS_PER_SEC = 1e9

function headersSent(res) {
  return typeof res.headersSent !== 'boolean' ? Boolean(res._header) : res.headersSent
}

function diffInNs(start) {
  const diff = process.hrtime(start)
  return diff[0] * NS_PER_SEC + diff[1]
}

function logger(req, res, next) {
  if ( !req.log ) {
    console.warn('lgfmtr.middleware() - there is no logger on this request')
    next()
    return
  }

  // request and response data
  req._logfmtr = {}
  res._logfmtr = {}

  // set the start info and time
  const start = process.hrtime()

  // gather up some fields and replace the logger
  const fields = {
    ip            : req.ip || (req.connection && req.connection.remoteAddress) || '',
    url           : req.originalUrl || req.url,
    method        : req.method,
    referrer      : req.headers['referer'] || req.headers['referrer'] || '',
    'user-agent'  : req.headers['user-agent'] || '',
  }

  // log now as the start of the request
  req.log.withFields(fields).info('req-start')

  // record response start
  onHeaders(res, () => {
    const fields = {
      diff : diffInNs(start),
    }

    // log the start of the response
    req.log.withFields(fields).info('res-start')
  })

  // log when response has finished
  onFinished(res, (err, _) => {
    // gather up some info
    const fields = {}

    fields.diff = diffInNs(start)

    // status code
    if ( headersSent(res) ) {
      fields.status = res.statusCode
    }

    // log the end of the response
    req.log.withFields(fields).info('res-end')
  })

  // log when request finished
  onFinished(req, (err, _) => {
    const fields = {
      diff : diffInNs(start),
    }

    // log the end of the request
    req.log.withFields(fields).info('req-end')
  })

  next()
}

// ----------------------------------------------------------------------------

module.exports = logger

// ----------------------------------------------------------------------------
