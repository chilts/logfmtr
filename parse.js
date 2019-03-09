// Code originally from : https://github.com/csquared/node-logfmt/blob/master/lib/logfmt_parser.js

// Copied under the MIT license. Changed and updated for `logfmtr`.

function parse(line) {
  var key = ''
  var value = ''
  var is_number = true
  var in_key    = false
  var in_value  = false
  var in_quote  = false
  var had_quote = false
  var object    = {}
  // var esc_next  = false

  // remove any trailing newline
  if (line[line.length - 1] == '\n') {
    line = line.slice(0,line.length - 1)
  }

  for (var i = 0; i <= line.length; i++) {

    if ((line[i] == ' ' && !in_quote) || i == line.length) {
      if (in_key && key.length > 0) {
        object[key] = true
      }
      else if (in_value) {
        if (value == 'true') value = true
        else if (value == 'false') value = false
        else if (value === '' && !had_quote) value = null
        object[key] = value
        value = ''
      }

      if (i == line.length) {
        break
      }
      else {
        in_key   = false
        in_value = false
        in_quote = false
        had_quote = false
      }
    }

    if (line[i] == '=' && !in_quote) {
      debug('split')
      // split
      in_key = false
      in_value = true
    }
    else if (line[i] == '\\') {
      i = i + 1
      value += line[i]
      debug('escape: ' + line[i])
    }
    else if (line[i] == '"') {
      had_quote = true
      in_quote = !in_quote
      debug('in quote: ' + in_quote)
    }
    else if (line[i] != ' ' && !in_value && !in_key) {
      debug('start key with: ' + line[i])
      in_key = true
      key = line[i]
    }
    else if (in_key) {
      debug('add to key: ' + line[i])
      key += line[i]
    }
    else if(in_value) {
      debug('add to value: ' + line[i])
      value += line[i]
    }
  }

  // if we don't have any 'level', 'ts', and 'evt', then this probably isn't a proper logfmt line
  // if (!object.ts && !object.level && !object.evt) {
  //   return null
  // }

  return object
}

function debug(line) {
  if (exports.debug) {
    console.log(line)
  }
}

module.exports = parse
