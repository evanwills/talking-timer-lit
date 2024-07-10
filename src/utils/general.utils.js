
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

export const isNum = (input) => (typeof input === 'number' && !Number.isNaN(input) && Number.isFinite(input));

export const makeInt = (input) => {
  let tmp = input;
  if (typeof tmp === 'string') {
    tmp = parseInt(tmp, 10);
  }
  return (isNum(tmp))
    ? tmp
    : 0;
};

export const makeNullNum = (input, preceeding = null, max = 59) => {
  const t = typeof input;
  let output = input;

  if (typeof output === 'string' && output.trim() !== '') {
    output = parseInt(output, 10);
  }

  if (isNum(output)) {
    output = (!Number.isInteger(output))
      ? Math.round(output)
      : output;

    if (output < 1 && preceeding === null) {
      return null;
    }

    if (output > max) {
      return max.toString();
    }

    return (output < 10 && preceeding !== null)
      ? `0${output}`
      : output.toString();
  }

  return null;
}

export const getHumanOption = (options, value) => {
  const tmp = options.find((option) => option.value === value);
  return (typeof tmp !== 'undefined')
    ? tmp.label
    : '';
};

export const getTypeLabel = (type) => type.substring(0,1).toUpperCase() + type.substring(1, (type.length - 1));

export const getTimerlabel = (type, count) => `${getTypeLabel(type)} number ${count}`;

export const getWaitinglabel = (type, count) => `Waiting to start ${getTypeLabel(type)} number ${count}`;

export const getDoingSayData = (time) => [
  {
    message: 'You should be finishing centering and opening up.',
    offset: Math.round(time / 3) - 5000,
  },
  {
    message: 'You should be starting to pull up now.',
    offset: Math.round(time / 2) - 5000,
  },
];

export const getWaitingSayData = (type, time) => {
  const output = [];

  if (time > 60000) {
    output.push(
      {
        message: `You will be starting your next ${type} in 1 minute`,
        offset: 60000,
      },
    );
  }
  output.push(
    {
      message: `Get ready to start your next ${type} in twenty seconds`,
      offset: 22000,
    },
    {
      message: 'OK!',
      offset: 5000,
    },
  );
  return output
};

export const setLocalValue = (key, value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export const getLocalValue = (key, defaultVal, type = 'string') => {
  if (typeof localStorage !== 'undefined') {
    let output = localStorage.getItem(key);

    if (output !== null) {
      const t = typeof output;
      if (typeof output === type) {
        return output;
      }
      if (t === 'string') {
        switch (type.substring(0,4).toLowerCase()) {
          case 'numb':
          case 'int':
            return parseInt(output, 10);

          case 'floa':
            return parseFloat(output);

          case 'bool':
            return (output.toLowerCase().trim() === 'true');

          case 'json':
            try {
              return JSON.parse(output);
            } catch (e) {
              console.error('could not parse JSON from localStorage prop: ')
            }
        }
      }
      return output;
    }

    setLocalValue(key, defaultVal);
  }

  return defaultVal;
};

