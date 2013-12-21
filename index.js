var fs = require('fs')
  , sha1 = require('./libs/sha1')
  ;

var open_file = function(path) {
  // Open file
  fs.open(path, 'r', function(err, fd) {
    if (err) {
      console.error(JSON.stringify(err));
    }
    // Get file statistics
    fs.fstat(fd, function(err2, stats) {
      if (err2) {
        console.error(JSON.stringify(err2));
      }
      // Get size of file in bytes
      var fsize = stats.size;
      
      var results = sha1.preread_sha1(fsize);

      // Initialize file buffer to size of file in bytes
      var buff = new Buffer(results.hsize);
      buff.fill(0);

      // Read file into new buffer
      fs.read(fd, buff, 0, stats.size, 0, function(err3, fsize, buff) {
        if (err3) {
          console.error(JSON.stringify(err3));
        }

        var post_results = sha1.postread_sha1(buff, results, fsize);

        var out = sha1.sha1(post_results.buff);
        console.log(out.toString());
      });
    });
  });
};

open_file('example.txt');
