var fs = require('fs');

var sha1 = function(message, len) {
  var out = message;
  var h = new Uint32Array(5);
  var h[0] = parseInt('67452301',16);
  var h[1] = parseInt('EFCDAB89',16);
  var h[2] = parseInt('98BADCFE',16);
  var h[3] = parseInt('10325476',16);
  var h[4] = parseInt('C3D2E1F0',16);

  return out;
};

var open_file = function(path) {
  fs.open(path, 'r', function(err, fd) {
    if (err) {
      console.error(JSON.stringify(err));
    }
    fs.fstat(fd, function(err2, stats) {
      if (err2) {
        console.error(JSON.stringify(err2));
      }
      // Initialize file buffer
      var buff = new Buffer(stats.size);
      // Get size of file in bits
      var fsize = stats.size*8;
      fs.read(fd, buff, 0, stats.size, 0, function(err3, numbytes, buff) {
        if (err3) {
          console.error(JSON.stringify(err3));
        }
        var out = sha1(buff, fsize);
        console.log(out);
      });
    });
  });
};

open_file('example.txt');
