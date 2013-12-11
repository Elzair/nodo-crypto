var assert = require('assert')
  , util = require('util')
  , stringformat = require('stringformat')
  , common = require('./common')
  ;

// This function calculates the hash value of a given 512-bit chunk.
var sha1_chunk_hash = function(w, h) {
  // Initialize the  hash values for this chunk:
  var a = h.readUInt32BE(0);
  var b = h.readUInt32BE(1); 
  var c = h.readUInt32BE(2); 
  var d = h.readUInt32BE(3); 
  var e = h.readUInt32BE(4); 
  var f = 0; 
  var k = 0; 
  var temp = 0;

  // Main loop
  var i = 0;
  for (i=0; i<80; i++) {
    if (i>=0 && i<20) {
      f = (b & c) | ((!b) & d);
      k = 0x5A827999;
    }
    if (i>=20 && i<40) {
      f = b ^ c ^ d;
      k = 0x6ED9EBA1;
    }
    if (i>=40 && i<60) {
      f = (b & c) | (b & d) | (c & d);
      k = 0x8F1BBCDC;
    }
    if (i>=60 && i<80) {
      f = b ^ c ^ d;
      k = 0xCA62C1D6;
    }

    temp = (common.rotl32(a, 5) + f + e + k + w.readUInt32BE(i)) & 0xffffffff;
    e = d;
    d = c;
    c = common.rotl32(b, 30) & 0xffffffff;
    b = a;
    a = temp;
  }
  // Return result
  return {a: a, b: b, c: c, d: d, e: e};
};

exports.sha1 = function(message) {
  var xx = 0x08FFDDCC;
  console.log(stringformat('{0:32}', xx.toString(2)));
  console.log(stringformat('{0:32}', common.rotl32(xx, 4).toString(2)));
  // Initialize constants
  var ret = null;
  var h = new Buffer(20); 
  h.writeUInt32BE(0x67452301, 0);
  h.writeUInt32BE(0xEFCDAB89, 4);
  h.writeUInt32BE(0x98BADCFE, 8);
  h.writeUInt32BE(0x10325476,12);
  h.writeUInt32BE(0xC3D2E1F0,16);

  // Break message into results.m 512-bit (64 byte) chunks
  var i = 0, j = 0, w = [];
  for (i=0; i<message.length; i+=64) {
    console.log(JSON.stringify(h));
    // Initialize buffer with room for 80 32-bit (4 byte) integers
    w = new Buffer(80*4);
    // Break each message chunk into 16 32-bit chunks
    for (j=i; j<i+64; j+=4) {
      w.writeUInt32BE(message.readUInt32BE(j), j-i);
    }

    // Extend those 16 chunks into 80 chunks
    for (j=16*4; j<80*4; j++) {
      console.log(stringformat('{0:32}', (w.readUInt32BE(j-3)^w.readUInt32BE(j-8)^w.readUInt32BE(j-14)^w.readUInt32BE(j-16)).toString(2)));
      console.log(stringformat('{0:32}', common.rotl32(w.readUInt32BE(j-3) ^ w.readUInt32BE(j-8) ^w.readUInt32BE(j-14) ^ w.readUInt32BE(j-16), 1).toString(2)));
      w.writeUInt32BE(common.rotl32(w.readUInt32BE(j-3) ^ w.readUInt32BE(j-8) ^
        w.readUInt32BE(j-14) ^ w.readUInt32BE(j-16), 1), j);
    }

    // Execute main loop for this chunk
    ret = sha1_chunk_hash(w, h); 

    // Add this chunk's hash to the result
    h.writeUInt32BE((h.readUInt32BE(0) + ret.a) & 0xffffffff, 0);
    h.writeUInt32BE((h.readUInt32BE(1) + ret.b) & 0xffffffff, 1);
    h.writeUInt32BE((h.readUInt32BE(2) + ret.c) & 0xffffffff, 2);
    h.writeUInt32BE((h.readUInt32BE(3) + ret.d) & 0xffffffff, 3);
    h.writeUInt32BE((h.readUInt32BE(4) + ret.e) & 0xffffffff, 4);
  }

  // Calculate the 160-bit final hash value 
  //var hh = new Buffer(20);
  //for (i=0,j=0; i<hh.length; i+=4,j++) {
  //  console.log(util.format('%d %d', i, j));
  //  hh.writeUInt32BE(h[j], i);
  //}
  return h;
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

  //console.log(JSON.stringify(buff));
  return {buff: buff};
};


