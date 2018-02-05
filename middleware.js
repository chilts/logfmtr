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

function getIp(req) {
  return req.ip || req._logfmtr.remoteAddress || (req.connection && req.connection.remoteAddress) || null
}

function recordTime(r) {
  r._logfmtr.at   = process.hrtime()
  r._logfmtr.time = new Date()
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
  req._logfmtr.remoteAddress = getIp(req)
  recordTime(req)

  // log now as the start of the request
  req.log.info('req-start')

  // log when request finished
  onFinished(req, (err, _) => {
    req.log.info('req-end')
  })

  // record response start
  onHeaders(res, () => {
    recordTime(res)
    req.log.info('res-start')
  })

  // log when response has finished
  onFinished(res, (err, _) => {
    req.log.info('res-end')
  })

  next()
}

// ----------------------------------------------------------------------------

module.exports = logger

// ----------------------------------------------------------------------------
