var assert = require('assert')
  , util = require('util')
  ;

exports.sha1 = function(message, results) {
  var out = message;
  //console.log(m1);

  // Initialize constants
  var h = [];
  h[0] = 0x67452301;
  h[1] = 0xEFCDAB89;
  h[2] = 0x98BADCFE;
  h[3] = 0x10325476;
  h[4] = 0xC3D2E1F0;

  // Break message into results.m 512-bit (64 byte) chunks
  for (var i=0; i<message.length; i+=64) {
    
  }

  return out;
};

exports.preread_sha1 = function(fsize) {
  // Get size of file in bits
  var numbits = fsize*8;

  // Append '1' bit to end of message and x # of '0' such that the length
  // of the message plus the 64-bit message length is a multiple of 512 bits.
  // There is an xeZ s.t. (fsize+x+64+1)%512==0 => fsize+x+1+64==512*m meZ 
  // => x==512*m-fsize-65.
  var m = Math.ceil((numbits+65)/512); // # of 512-bit chunks in message
  var x = 512*m-numbits-65;            // # of '0's to pad message to 512m-64

  assert.equal((((x+1)/8)%1), 0, 'x+1 must be a multiple of 8');

  // Get size of padded message in bits
  var m1 = 512*m;

  return {m: m, x: x, m1: m1, bsize: m1/8};
};

// Append bit '1' followed by results.x # of '0' bits such that the length
// of the message plus 64 is a multiple of 512. Then append a 64-bit
// integer representing the length of the message in bits.
exports.postread_sha1 = function(buff, results, numbytes) {
  // Make first byte after message 0x80 (10000000)
  var n = 0x80, i=0;
  for (i=0; i<(results.x+1)/8; i++) {
    buff.writeUInt8(n, numbytes+i);
    n = 0x0;
  }

  // Append the 64-bit message length to the end of the buffer
  buff.writeUInt32BE(results.m1, numbytes+i+4);

  console.log(JSON.stringify(buff));
  return {buff: buff};
};


