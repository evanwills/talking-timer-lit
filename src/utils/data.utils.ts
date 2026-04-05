export const isBool = (input : unknown) : input is boolean => (typeof input === 'boolean');

export const isBoolTrue = (input : unknown) : boolean => (isBool(input) === true && input === true);

/**
 * Check whether object's string property is a non empty string
 *
 * @param {unknown} value value to be tested
 *
 * @returns {boolean} TRUE if property is string and non-empty.
 */
export const isNonEmptyStr = (value : unknown) : boolean => (
  typeof value === 'string' && value.trim() !== ''
);

export const isNum = (input : unknown) : input is number => (
  typeof input === 'number' && !Number.isNaN(input) && Number.isFinite(input)
);

/**
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input is an object (and not NULL
 *                    and not an array).
 *                    FALSE otherwise
 */
export const isObj = (input: unknown) : input is {[index:string]:any} => (
  Object.prototype.toString.call(input) === '[object Object]'
);

export const propIsNonEmptyStr = (obj : unknown, prop : string) : boolean => (
  isObj(obj) === true && isNonEmptyStr(obj[prop] as Object)
);

const forceNum = (
  input : unknown,
  defaultVal : number = 0,
  float: boolean = false,
) : number => {
  if (isNum(input) === false) {
    return defaultVal;
  }

  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    return (float === true)
      ? Number.parseFloat(input)
      : Number.parseInt(input, 10);
  }

  return defaultVal;
};

export const forceInt = (input : unknown, defaultVal : number = 0) : number => forceNum(input, defaultVal, false);

export const forceFloat = (input : unknown, defaultVal : number = 0) : number => forceNum(input, defaultVal, true);
