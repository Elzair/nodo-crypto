exports.rotl32 = function(value, shift) {
  return (value << shift) | (value >> (32 - shift));
};
