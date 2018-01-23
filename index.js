// ----------------------------------------------------------------------------

// core
const os = require('os')
const util = require('util')

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
  val = String(val).replace('\\', '\\\\').replace('\n', '\\n')

  if ( val.indexOf(' ') === -1 ) {
    // console.log('No space')
  }
  else {
    // console.log('Got a space')
    val = '"' + val + '"'
  }

  return val
}

// from bole
function format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  if (a16 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
  if (a15 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15)
  if (a14 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14)
  if (a13 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13)
  if (a12 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12)
  if (a11 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
  if (a10 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
  if (a9 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8, a9)
  if (a8 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7, a8)
  if (a7 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6, a7)
  if (a6 !== undefined)
    return util.format(a1, a2, a3, a4, a5, a6)
  if (a5 !== undefined)
    return util.format(a1, a2, a3, a4, a5)
  if (a4 !== undefined)
    return util.format(a1, a2, a3, a4)
  if (a3 !== undefined)
    return util.format(a1, a2, a3)
  if (a2 !== undefined)
    return util.format(a1, a2)
  return a1
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

LogFmtr.prototype.debug = function debug(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  this.logit('debug', inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
}

LogFmtr.prototype.info = function info(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  this.logit('info', inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
}

LogFmtr.prototype.log = function log(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  this.logit('info', inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
}

LogFmtr.prototype.warn = function warn(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  this.logit('warn', inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
}

LogFmtr.prototype.error = function error(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  this.logit('error', inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)
}

LogFmtr.prototype.logit = function logit(lvl, inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
  let m = 'level=' + lvl

  if ( this.opts.ts ) {
    m += ' ts=' + Date.now()
  }

  // for each field
  for ( let f in this.fields ) {
    m += ' ' + f + '=' + escape(this.fields[f])
  }

  m += ' msg=' + escape(format(inp, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16)) + '\n'

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

// LogFmtr.prototype.output = function output(opts) {
//   // check the level (if there)
//   if ( opts.level ) {
//     if ( valid.level[opts.level] ) {
//       this.level = opts.level
//     }
//     else {
//       throw new Error("logfmtr: Invalid logging level '" + opts.level + "'")
//     }
//   }

//   // check if the stream is provided
//   if ( opts.stream ) {
//     this.stream = opts.stream
//   }
// }

// ----------------------------------------------------------------------------

module.exports = LogFmtr

// ----------------------------------------------------------------------------
