// ----------------------------------------------------------------------------

// core
const os = require('os')

// ----------------------------------------------------------------------------

// setup
const valid = {
  level : {
    debug : true,
    info  : true,
    warn  : true,
    error : true,
  },
}
const levels = 'debug info warn error'.split(' ')

function escape(val) {
  // replace backslash with `\\`, replace newline with `\n`, and double-quote with `\"`
  val = String(val).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"')

  if ( val.indexOf(' ') >= 0 || val.indexOf('"') >= 0 ) {
    val = '"' + val + '"'
  }
  // else, no quotes needed

  return val
}

// ----------------------------------------------------------------------------

function LogFmtr(opts) {
  opts = opts || {}

  opts.name = opts.name || 'default'
  opts.stream = opts.stream || process.stdout
  opts.ts = opts.ts || true

  this.opts = opts

  // and start off the message prefix
  this.prefix = ''
  this.fields = {}
}

LogFmtr.prototype.debug = function debug(evt) {
  this.logit('debug', evt)
}

LogFmtr.prototype.info = function info(evt) {
  this.logit('info', evt)
}

LogFmtr.prototype.log = function log(evt) {
  this.logit('info', evt)
}

LogFmtr.prototype.warn = function warn(evt) {
  this.logit('warn', evt)
}

LogFmtr.prototype.error = function error(evt) {
  this.logit('error', evt)
}

LogFmtr.prototype.logit = function logit(lvl, evt) {
  let m = 'level=' + lvl

  if ( this.opts.ts ) {
    m += ' ts=' + Date.now()
  }

  // for each field
  for ( let f in this.fields ) {
    m += ' ' + f + '=' + escape(this.fields[f])
  }

  m += ' evt=' + escape(evt) + '\n'

  this.opts.stream.write(m)
}

LogFmtr.prototype.withFields = function withFields(fields) {
  let logFmtr = new LogFmtr(this.opts)

  logFmtr.fields = Object.assign({}, this.fields, fields)

  return logFmtr
}

// convenience functions so you don't have to figure this out locally
LogFmtr.prototype.pid = function pid() {
  return this.withFields({ pid : process.pid })
}

LogFmtr.prototype.hostname = function pid() {
  return this.withFields({ hostname : os.hostname() })
}

// ----------------------------------------------------------------------------

// add the middleware on too
LogFmtr.middleware = require('./middleware.js')

// ----------------------------------------------------------------------------

module.exports = LogFmtr

// ----------------------------------------------------------------------------
