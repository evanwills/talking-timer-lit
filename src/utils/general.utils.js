
/**
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input is an object (and not NULL
 *                    and not an array).
 *                    FALSE otherwise
 */
export const isObj = (input) => (Object.prototype.toString.call(input) === '[object Object]');
