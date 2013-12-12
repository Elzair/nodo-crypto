var util = require('util')
  , stringformat = require('stringformat')
  ;

exports.rotl32 = function(value, shift) {
  //return (value << shift) | (value >>> (32 - shift));
  shift = shift % value;
  var val = value.toString(2);
  return parseInt(val.slice(shift) + val.slice(0, shift), 2);
};

exports.rotr32 = function(value, shift) {
  //return (value >>> shift) | (value << (32 - shift));
  shift = shift % value;
  var val = value.toString(2);
  return parseInt(val.slice(0, shift) + val.slice(shift), 2);
};

exports.add = function() {
  var first = true;
  var sum = '00000000000000000000000000000000';
  var s = '', ss = '', sss = '', new_sum = '';
  var arg = 0, i = 0, j = 0;
  var c = 0, p;
  var args = [];
  debugger;
  for (arg in arguments) {
    if (arguments.hasOwnProperty(arg)) {
      args[i++] = arguments[arg];
    }
  }
  for (i=0; i<args.length; i++) {
    //output = output + (first ? '' : ' + ') + stringformat('{0:32}', arguments[arg].toString(2));
    s = args[i].toString(2);
    ss = '';
    for (j=0; j<(32-s.length); j++) {
      ss += '0';
    }
    sss = ss + s;
    //console.log((first ? '  ' : '+ ') + stringformat('{0:32}', sss));
    first = false;
    c = 0;
    new_sum = '';
    for (j=31; j>=0; j--) {
      p = parseInt(sss.charAt(j),2) + parseInt(sum.charAt(j),2) + c;
      c = (p >= 2) ? 1 : 0;
      new_sum = (p % 2).toString(2) + new_sum;
    }
    sum = new_sum;
  }
  //console.log('----------------------------------');
  //console.log(stringformat('  {0:32}', sum));
  //console.log(output);
  return parseInt(sum, 2);
};
