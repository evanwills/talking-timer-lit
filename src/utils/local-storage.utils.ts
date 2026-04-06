

const _setLocalVal = (key : string, value : unknown) : void => {
  const _val = (value === undefined || value === null)
    ? ''
    : value;

  localStorage.setItem(
    key,
    (typeof _val === 'string')
      ? _val
      : _val.toString(),
  );
};

const _getLocalVal = (
  key : string,
  defaultVal : unknown,
  type : string = 'string',
) : unknown => {
  let output : string | null = localStorage.getItem(key);

  if (output !== null) {
    const t = typeof output;
    if (typeof output === type) {
      return output;
    }

    if (t === 'string') {
      switch (type.substring(0,4).toLowerCase()) {
        case 'numb': // number
        case 'int':
          return Number.parseInt(output, 10);

        case 'floa': // floating point number
          return Number.parseFloat(output);

        case 'bool':
          const bools = new Set(['true', 'yes', 'on', '1']);
          return (bools.has(output.toLowerCase().trim()) === true);

        case 'arra': // array
        case 'json':
          try {
            return JSON.parse(output);
          } catch (error : unknown) {
            console.error(
              'could not parse JSON from localStorage prop:',
              error,
            );
          }
      }
    }
    return output;
  }

  setLocalValue(key, defaultVal);

  return defaultVal;
};

const _dummyGetLocalVal = (_key : string, defaultVal : unknown, _type : string = 'string') => defaultVal;

const _dummySetLocalVal = (_key : string, _value : unknown) : unknown => _value;

/**
 * Save a value to local stora (if possible)
 *
 * __Note:__ If local storage is unavailable this function does
 *           nothing. (No error or warning will be reported.)
 *
 * @param key Local storage key
 * @param value Value to be saved to local storage
 */
export const setLocalValue = (typeof localStorage !== 'undefined')
  ? _setLocalVal
  : _dummySetLocalVal;

/**
 * Get a value from local storage
 *
 * __Note:__ If local storage is unavailable, `defaultVal` will be
 *           returned.
 *           If localStorage is available but the value does not
 *           exist, `defaultVal` will be saved to local storage and
 *           returned.
 *
 * @param key        Name of the local storage
 * @param defaultVal Default value to set if value does not exist in local
 *
 * @returns The value retrieved from local storage if available. Otherwise `defaultVal` is returned
 */
export const getLocalValue = (typeof localStorage !== 'undefined')
  ? _getLocalVal
  : _dummyGetLocalVal;
