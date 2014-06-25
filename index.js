var fs = require('fs')
  , sha1 = require('./libs/sha1')
  ;

exports.sha1 = function(str) {
  // Allocate temporary buffer containing str
  var strbuf = new Buffer(str, 'utf8');

  // Get size of string buffer  in bytes
  var fsize = strbuf.length;
  
  // Calculate needed size of string buffer
  var results = sha1.preread_sha1(fsize);

  // Initialize string buffer to size of input in bytes
  var buff = new Buffer(results.hsize);
  buff.fill(0);

  // Write string to string buffer
  strbuf.copy(buff);

  // Pad buffer & append original buffer size
  var post_results = sha1.postread_sha1(buff, results, fsize);

  // Generate SHA-1 hash of buffer
  var out = sha1.sha1(post_results.buff);

  return out;
};
