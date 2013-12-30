var assert = require('assert')
  , util = require('util')
  , stringformat = require('stringformat')
  , common = require('./common')
  ;


// This function calculates the hash value of a given 512-bit chunk.
var sha1_hash_loop = function(w, h) {
  // Initialize the  hash values for this chunk:
  var a = h[0];
  var b = h[1]; 
  var c = h[2]; 
  var d = h[3]; 
  var e = h[4]; 
  var f = 0; 
  var k = 0; 
  var temp = 0;

  // Main loop
  var i = 0;
  console.log('\tA \t\tB \t\tC \t\tD \t\tE');
  for (i=0; i<80; i++) {
    if (i>=0 && i<20) {
      f = ((b & c) | ((~b) & d)) % 0x100000000;
      k = 0x5A827999;
    }
    if (i>=20 && i<40) {
      f = (b ^ c ^ d) % 0x100000000;
      k = 0x6ED9EBA1;
    }
    if (i>=40 && i<60) {
      f = ((b & c) | (b & d) | (c & d)) % 0x100000000;
      k = 0x8F1BBCDC;
    }
    if (i>=60 && i<80) {
      f = (b ^ c ^ d) % 0x100000000;
      k = 0xCA62C1D6;
    }

    temp = (common.rotl32(a, 5) + f + e + k + w[i]) % 0x100000000;
    e = d;
    d = c;
    c = common.rotl32(b, 30) % 0x100000000;
    b = a;
    a = temp;

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
  h[1] = 0xEFCDAB89;
  h[2] = 0x98BADCFE;
  h[3] = 0x10325476;
  h[4] = 0xC3D2E1F0;
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
      w[j] = common.rotl32(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1) % 0x100000000;
    }

    // Execute main loop for this chunk
    ret = sha1_hash_loop(w, h); 

    // Add this chunk's hash to the result
    h[0] = (h[0] + ret.a) % 0x100000000;
    h[1] = (h[1] + ret.b) % 0x100000000;
    h[2] = (h[2] + ret.c) % 0x100000000;
    h[3] = (h[3] + ret.d) % 0x100000000;
    h[4] = (h[4] + ret.e) % 0x100000000;
    //console.log(common.printarr(h,16));
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
  //console.log(util.format('%j', results));
  //for (i = 0; i<buff.length; i++) {
  //  console.log(buff.readUInt8(i).toString(16));
  //}
  // Make first byte after message 0x80 (10000000)
  var n = 0x80;
  for (i=0; i<(results.x+1)/8; i++) {
    buff.writeUInt8(n, numbytes+i);
    //console.log(buff.readUInt8(numbytes+1).toString(16));
    n = 0x0;
  }

  // Append the 64-bit message length to the end of the buffer
  buff.writeUInt32BE(results.nb, numbytes+i+4);
  //console.log(buff.readUInt32BE(numbytes+i+4).toString(16));

  //console.log(JSON.stringify(buff));
  return {buff: buff};
};


