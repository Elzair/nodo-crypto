var fs = require('fs')
  , sha1 = require('./libs/sha1')
  ;

var process_file = function(path) {
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
      
      // Calculate needed size of file buffer
      var results = sha1.preread_sha1(fsize);

      // Initialize file buffer to size of file in bytes
      var buff = new Buffer(results.hsize);
      buff.fill(0);

      // Read file into new buffer
      fs.read(fd, buff, 0, stats.size, 0, function(err3, fsize, buff) {
        if (err3) {
          console.error(JSON.stringify(err3));
        }

        // Pad buffer & append original file size
        var post_results = sha1.postread_sha1(buff, results, fsize);

        // Generate SHA-1 hash of file
        var out = sha1.sha1(post_results.buff);
        console.log(out.toString());
      });
    });
  });
};

var process_string = function(str) {
  // Allocate temporary buffer containing str
  var strbuf = new Buffer(str, 'utf8');
  console.log(strbuf);

  // Get size of string buffer  in bytes
  var fsize = strbuf.length;
  
  // Calculate needed size of string buffer
  var results = sha1.preread_sha1(fsize);

  // Initialize string buffer to size of input in bytes
  var buff = new Buffer(results.hsize);
  buff.fill(0);

  // Write string to string buffer
  //buff.write(str, 0, fsize, 'utf8');
  strbuf.copy(buff);

  // Pad buffer & append original buffer size
  var post_results = sha1.postread_sha1(buff, results, fsize);

  // Generate SHA-1 hash of buffer
  var out = sha1.sha1(post_results.buff);
  console.log(out.toString());
};

var process_buffer = function(oldbuf) {
  console.log(oldbuf);

  // Get size of string buffer  in bytes
  var fsize = oldbuf.length;
  
  // Calculate needed size of string buffer
  var results = sha1.preread_sha1(fsize);

  // Initialize string buffer to size of input in bytes
  var buff = new Buffer(results.hsize);
  buff.fill(0);

  // Copy old buffer to new buffer
  oldbuf.copy(buff);

  // Pad buffer & append original buffer size
  var post_results = sha1.postread_sha1(buff, results, fsize);

  // Generate SHA-1 hash of buffer
  var out = sha1.sha1(post_results.buff);
  console.log(out.toString()); 
};

//process_file('example.txt');
process_string('abc');
//var testbuf = new Buffer(3);
//testbuf.writeUInt8(0x61, 0);
//testbuf.writeUInt8(0x62, 1);
//testbuf.writeUInt8(0x63, 2);
//process_buffer(testbuf);
