
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

export const isNum = (input) => (typeof input === 'number'
    && !Number.isNaN(input) && Number.isFinite(input));

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

const _setLocalVal = (key, value) => {
  localStorage.setItem(key, value);
};

const _getLocalVal = (key, defaultVal, type = 'string') => {
  let output = localStorage.getItem(key);

  if (output !== null) {
    const t = typeof output;
    if (typeof output === type) {
      return output;
    }
    if (t === 'string') {
      switch (type.substring(0,4).toLowerCase()) {
        case 'numb': // number
        case 'int':
          return parseInt(output, 10);

        case 'floa': // floating point number
          return parseFloat(output);

        case 'bool':
          return (output.toLowerCase().trim() === 'true');

        case 'arra': // array
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
};

const _dummyGetLocalVal = (_key, defaultVal, _type = 'string') => defaultVal;

const _dummySetLocalVal = (_key, _value) => {};

export const setLocalValue = (typeof localStorage !== 'undefined')
  ? _setLocalVal
  : _dummySetLocalVal;

export const getLocalValue = (typeof localStorage !== 'undefined')
  ? _getLocalVal
  : _dummyGetLocalVal;

export const getTimingMsg = (duration) => {
  const seconds = (duration / 1000);
  let thirdStr = 'minute';
  let sixthStr = '30 seconds';
  return 'Just a quick note about timing. '
      + 'If you make your pot in less than three minutes, you are '
      + 'probably missing things or not aiming for high enough '
      + 'quality. '
      + 'If you are not stopping when you run out of time, think '
      + 'about why. This is a three minute exercise. '
      + 'It\'s only an exercise. '
      + 'Stop at three minutes regardless of where you\'ve got to '
      + 'and think about which steps you can save a bit of time on, '
      + 'next time.'
      + 'For the purposes of this exercise:'
      + `The first ${thirdStr} of your time should be devoted to `
      + 'centering as perfectly as you can;'
      + `The next ${sixthStr} of your time should be for opening up.`
      + 'Most of the remaining time should be taken up by pulling '
      + 'up as high or as thin (or both) as you can.'
      + 'The final 10 to 15 seconds should be used for cleaning up '
      + 'the rim and the base and removing excess water. '
      + 'After the timer ends, cut your pot off the wheel and '
      + 'place it gently on your ware-board';
}

export const getSessionCompleteExtMsg = (type) => {
  const typeMsg = {
    cylinders: 'The base inside your pot should be flat; '
      + 'The walls should be straight and vertical; '
      + 'The base should be one and a half to two times the '
      + 'thickness of the walls; '
      + 'The walls should be the same thickness all the way up.',
    bowls: 'The steepest outside angle should be no less than 45 '
      + 'degrees; '
      + 'From about a third of the way up, the walls should be the '
      + 'same thickness; '
      + 'For this exercise, the curve of your bowl should not '
      + 'change direction.',
  };
  const pre = 'There are a few things you should look out for when '
      + 'critquing your';
  const post = 'There should be no water pooled in the bottom of your pot; '
      + 'The walls of your pot should be an even thickness; '
      + 'The walls of your pot should be an even thickness; '
      + 'The walls should be the same thickness on opposite sides.';

  return `${pre} ${type} ${post} ${typeMsg[type]}`;
}
