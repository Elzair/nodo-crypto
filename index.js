var fs = require('fs')
  , sha1 = require('./lib/sha1')
  ;

exports.sha1 = function(str) {
  var strbuf = new Buffer(str, 'utf8');
  var fsize = strbuf.length;
  
  var results = sha1.preread_sha1(fsize);

  var buff = new Buffer(results.hsize);
  buff.fill(0);
  strbuf.copy(buff);

  var post_results = sha1.postread_sha1(buff, results, fsize);

  var out = sha1.sha1(post_results.buff);

  return out;
};
