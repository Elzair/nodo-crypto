var assert = require('assert')
  , util = require('util')
  , stringformat = require('stringformat')
  , common = require('./common')
  ;

var f_func = function(s, x, y, z) {
  switch(s) {
    case 0: return (x & y) ^ (~x & z);
    case 1: return x ^ y ^ z;
    case 2: return (x & y) ^ (x & z) ^ (y & z);
    case 3: return x ^ y ^ z;
  }
};

// This function calculates the hash value of a given 512-bit chunk.
var sha1_hash_loop = function(w, h) {
  // Initialize the  hash values for this chunk:
  var a = h[0];
  var b = h[1]; 
  var c = h[2]; 
  var d = h[3]; 
  var e = h[4]; 
  var f = 0; 
  var k = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6]; 

  var t = 0;
  // Main loop
  console.log('\tA \t\tB \t\tC \t\tD \t\tE');
  for (var i=0; i<80; i++) {
    var s = Math.floor(i/20);
    f = f_func(s, b, c, d);
    t = (((a << 5) | (a >>> 27)) + f + e + k[s] + w[i]) & 0xffffffff;
    e = d;
    d = c;
    c = (b << 30) | (b >>> 2);
    b = a;
    a = t;

    console.log(util.format('t = %d\t%s\t%s\t%s\t%s\t%s', i,
          common.zpad(a.toString(16),8), common.zpad(b.toString(16),8), 
          common.zpad(c.toString(16),8), common.zpad(d.toString(16),8),
          common.zpad(e.toString(16),8)));
  }
  // Return result
  var ret = {a: a, b: b, c: c, d: d, e: e};
  console.log(common.printarr(ret,16));
  return ret;
};

exports.sha1 = function(message) {
  // Initialize constants
  var ret = null;
  var h = [];
  h[0] = 0x67452301;
  h[1] = 0xefcdab89;
  h[2] = 0x98badcfe;
  h[3] = 0x10325476;
  h[4] = 0xc3d2e1f0;
  console.log(common.printarr(h,16));

  // Break message into results.m 512-bit (64 byte) chunks
  var i = 0, j = 0, w = [];
  for (i=0; i<message.length; i+=64) {
    // Break each message chunk into 16 32-bit chunks
    for (j=i; j<i+64; j+=4) {
      w[(j-i)/4] = message.readUInt32BE(j);
    }

    for (j=0; j<16; j++) {
      console.log(util.format('w[%s] = %s', common.zpad(j.toString(10),2), common.zpad(w[j].toString(16),8)));
    }

    // Extend those 16 chunks into 80 chunks
    for (j=16; j<80; j++) {
      var n = w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16];
      w[j] = (n << 1) | (n >>> 31);
    }

    // Execute main loop for this chunk
    ret = sha1_hash_loop(w, h); 

    // Add this chunk's hash to the result
    h[0] = (h[0] + ret.a) & 0xffffffff;
    h[1] = (h[1] + ret.b) & 0xffffffff;
    h[2] = (h[2] + ret.c) & 0xffffffff;
    h[3] = (h[3] + ret.d) & 0xffffffff;
    h[4] = (h[4] + ret.e) & 0xffffffff;
  }

  // Calculate the 160-bit final hash value 
  var hh = '', hi;
  for (i=0; i<h.length; i++) {
    hi = common.zpad(h[i].toString(16), 8);
    hh = hh + hi;
  }
  return hh;
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

  return {m: m, x: x, m1: m1, hsize: m1/8, nb: numbits};
};

// Append bit '1' followed by results.x # of '0' bits such that the length
// of the message plus 64 is a multiple of 512. Then append a 64-bit
// integer representing the original length of the message in bits.
exports.postread_sha1 = function(buff, results, numbytes) {
  var i = 0;
  
  // Make first byte after message 0x80 (10000000)
  var n = 0x80;
  for (i=0; i<(results.x+1)/8; i++) {
    buff.writeUInt8(n, numbytes+i);
    n = 0x0;
  }

  // Append the 64-bit message length to the end of the buffer
  buff.writeUInt32BE(results.nb, numbytes+i+4);

  return {buff: buff};
};


