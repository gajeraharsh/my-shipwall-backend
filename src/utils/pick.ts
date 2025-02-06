/**
 * Create an object composed of the picked object properties
 * @param {Record<string, any>} object - The object to pick properties from
 * @param {string[]} keys - The keys to pick
 * @returns {Record<string, any>} The new object with picked properties
 */
const pick = (object: Record<string, any>, keys: string[]): Record<string, any> => {
    return keys.reduce((obj, key) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        obj[key] = object[key]; // No TypeScript error here
      }
      return obj;
    }, {} as Record<string, any>); // Explicitly cast to Record<string, any>
  };
  
  export default pick;
  