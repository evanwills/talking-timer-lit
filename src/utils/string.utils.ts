/**
 * normalise (and normalise) event name
 *
 * @param {string} input
 * @returns {string}
 */
export const normalise = (input : string) : string =>
  input.toLowerCase().replaceAll(/[^a-z\d]+/ig, '');

/**
 * normalise (and normalise) event name
 *
 * @param input
 * @returns Sanitised ID value
 */
export const normaliseID = (input : string) : string =>
  input.replaceAll(/[^a-z\d_-]+/ig, '');

/**
 * Make the first alphabetical character in a string upper case.
 *
 * @param _whole whole regular expression match
 * @param pre    preceeding non-alpha characters
 * @param first  first alpha character
 *
 * @returns String with the first alphabetical character converted to
 *          uppercase
 */
const ucFirstInner = (_whole : string, pre : string, first : string) : string => (pre + first.toUpperCase());

/**
 * Make the first alphabetical character in a string uppercase.
 *
 * @param input String to be modified
 *
 * @returns string with first alphabetical character uppercased.
 */
export const ucFirst = (input : string) : string => input.trim().replace(/([^a-z]*)([a-z])/i, ucFirstInner);
