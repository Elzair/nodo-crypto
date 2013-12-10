var fs = require('fs')
  , assert = require('assert')
  ;

var sha1 = function(message, m1) {
  var out = message;

  // Initialize constants
  var h = new Buffer(20);
  h.writeUInt32BE(0x67452301, 0);
  h.writeUInt32BE(0xEFCDAB89, 4);
  h.writeUInt32BE(0x98BADCFE, 8);
  h.writeUInt32BE(0x10325476,12);
  h.writeUInt32BE(0xC3D2E1F0,16);

  return out;
};

var preread_sha1 = function(fsize) {
  // Get size of file in bits
  var numbits = fsize*8;

  // Append '1' bit to end of message and x # of '0' such that the length
  // of the message plus the 64-bit message length is a multiple of 512 bits.
  // There is an xeZ s.t. (fsize+x+64+1)%512==0 => fsize+x+1+64==512*m meZ 
  // => x==512*m-fsize-65.
  var m = Math.ceil((numbits+65)/512);
  var x = 512*m-numbits-65;

  assert.equal((((x+1)/8)%1), 0, 'x+1 must be a multiple of 8');

  // Get size of padded message in bits
  var m1 = 512*m;

  return {m: m, x: x, m1: m1, bsize: m1/8};
};

// Append bit '1' followed by results.x # of '0' bits such that the length
// of the message plus 64 is a multiple of 512. Then append a 64-bit
// integer representing the length of the message in bits.
var postread_sha1 = function(buff, results, numbytes) {
  // Make first byte after message 0x80 (10000000)
  var n = 0x80, i=0;
  for (i=0; i<(results.x+1)/8; i++) {
    buff.writeUInt8(n, numbytes+i);
    n = 0x0;
  }

  // Append the 64-bit message length to the end of the buffer
  buff.writeUInt64BE(results.m1, numbytes+i);

  return {buff: buff};
};

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
      
      var results = preread_sha1(fsize);

      // Initialize file buffer to size of file in bytes
      var buff = new Buffer(results.bsize);

      // Read file into new buffer
      fs.read(fd, buff, 0, stats.size, 0, function(err3, fsize, buff) {
        if (err3) {
          console.error(JSON.stringify(err3));
        }

        var post_results = postread_sha1(buff, results, fsize);

        var out = sha1(post_results.buff, results.m1);
        console.log(out.toString());
      });
    });
  });
};

open_file('example.txt');
