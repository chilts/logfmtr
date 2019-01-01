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

// does the escape and includes the equals if necessary
function escape(val) {
  if ( val === null ) {
    return ''
  }

  // replace backslash with `\\`, replace newline with `\n`, and double-quote with `\"`
  val = String(val).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"')

  if ( val.indexOf(' ') >= 0 ) {
    val = '"' + val + '"'
  }
  // else, no quotes needed

  return '=' + val
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

LogFmtr.prototype.debug = function debug(obj, evt) {
  this.logit('debug', obj, evt)
}

LogFmtr.prototype.info = function info(obj, evt) {
  this.logit('info', obj, evt)
}

LogFmtr.prototype.log = function log(obj, evt) {
  this.logit('info', obj, evt)
}

LogFmtr.prototype.warn = function warn(obj, evt) {
  this.logit('warn', obj, evt)
}

LogFmtr.prototype.error = function error(obj, evt) {
  this.logit('error', obj, evt)
}

// internal method - doesn't check `(lvl, obj, evt)`, but assumes they are all correct.
LogFmtr.prototype._fmt = function(lvl, obj, evt) {
  let m = 'level=' + lvl

  if ( this.opts.ts ) {
    m += ' ts=' + Date.now()
  }

  // for each field
  for ( let f in this.fields ) {
    m += ' ' + f + escape(this.fields[f])
  }

  // for each key in the obj
  if ( obj ) {
    for ( let f in obj ) {
      m += ' ' + f + escape(obj[f])
    }
  }

  m += ' evt' + escape(evt) + '\n'

  return m
}

LogFmtr.prototype.logit = function logit(lvl, obj, evt) {
  if (!evt) {
    evt = obj
    obj = undefined
  }

  if (!evt) {
    throw new Error("LogFmtr: `evt` should be provided")
  }

  // format the output line and write it out
  const line = this._fmt(lvl, obj, evt)
  this.opts.stream.write(line)
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
