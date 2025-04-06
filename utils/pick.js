/**
 * Create an object composed of the picked object properties
 * @param {Object} object - The object to pick properties from
 * @param {string[]} keys - The keys to pick
 * @returns {Object} The new object with picked properties
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key]; // No error here
    }
    return obj;
  }, {}); // Explicitly no TypeScript type here
};

module.exports = pick;
