var fs = require('fs')
  , sha1 = require('./lib/sha1')
  ;

exports.sha1 = function(str, test_data_path) {
  var strbuf = new Buffer(str, 'utf8');
  var fsize = strbuf.length;
  
  var results = sha1.preread_sha1(fsize);

  var buff = new Buffer(results.hsize);
  buff.fill(0);
  strbuf.copy(buff);

  var post_results = sha1.postread_sha1(buff, results, fsize);

  var out = null;
  if (test_data_path) {
    var test_data = JSON.parse(fs.readFileSync(test_data_path));
    out = sha1.sha1(post_results.buff, test_data);
  }
  else {
    out = sha1.sha1(post_results.buff);
  }

  return out;
};
