exports.rotl32 = function(value, shift) {
  //return (value << shift) | (value >> (32 - shift));
  shift = shift % value;
  var val = value.toString(2);
  return parseInt(val.slice(shift) + val.slice(0, shift), 2);
};

exports.rotr32 = function(value, shift) {
  //return (value >>> shift) | (value << (32 - shift));
  shift = shift % value;
  var val = value.toString(2);
  return parseInt(val.slice(0, shift) + val.slice(shift), 2);
};
