var util = require('util')
  , stringformat = require('stringformat')
  ;

exports.rotl32 = function(value, shift) {
  return (value << shift) | (value >>> (32 - shift));
  //shift = shift % value;
  //var val = value.toString(2);
  //return parseInt(val.slice(shift) + val.slice(0, shift), 2);
};

exports.rotr32 = function(value, shift) {
  return (value >>> shift) | (value << (32 - shift));
  //shift = shift % value;
  //var val = value.toString(2);
  //return parseInt(val.slice(0, shift) + val.slice(shift), 2);
};

// Pad start of string with zeroes until it has a length of len
var zpad = function(str, len) {
  var out = '';
  var i = 0;
  if (str.length >= len) {
    return str;
  }
  for (i=0; i<(len-str.length); i++) {
    out += '0';
  }
  //return new Array(len-str.length).join('0') + str;
  out += str;
  //console.log(util.format("%s %s", str, out));
  return out;
};
exports.zpad = zpad;

exports.printarr = function(arr, base, numpad, isbare) {
  var i=0, j=0;
  base = base || 16;
  numpad = numpad || 8;
  var bare = isbare || false;
  var out = bare ? '' : '[ ';
  if (Array.isArray(arr) || Buffer.isBuffer(arr)) {
    for (i=0; i<arr.length-1; i++) {
      out = out + zpad(arr[i].toString(base), numpad) + (bare ? '' : ', ');
    }
    out = out + zpad(arr[i].toString(base), numpad) + (bare ? '' : ' ]');
  }
  else {
    for (i in arr) {
      if (arr.hasOwnProperty(i)) {
        if (j < Object.keys(arr).length-1) {
          out = out + zpad(arr[i].toString(base), numpad) + (bare ? '' : ', ');
        }
        else {
          out = out + zpad(arr[i].toString(base), numpad) + (bare ? '' : ' ]');
        }
        j++;
      }
    }
  }
  return out;
};

/**
 * NOTE: This function was derived from the JSHashes code.
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
exports.safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

exports.and = function(x, y) {
  var lsw = (x & 0xFFFF) & (y & 0xFFFF),
      msw = (x >>> 16) & (y >>> 16) & 0xFFFF;
  return (msw << 16) | (lsw & 0xFFFF);
};
