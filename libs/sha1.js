var assert = require('assert')
  , util = require('util')
  ;

exports.sha1 = function(message, m1) {
  var out = message;
  //console.log(m1);

  // Initialize constants
  var h = new Buffer(20);
  h.writeUInt32BE(0x67452301, 0);
  h.writeUInt32BE(0xEFCDAB89, 4);
  h.writeUInt32BE(0x98BADCFE, 8);
  h.writeUInt32BE(0x10325476,12);
  h.writeUInt32BE(0xC3D2E1F0,16);

  return out;
};

exports.preread_sha1 = function(fsize) {
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


