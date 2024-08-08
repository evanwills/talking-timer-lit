import { html } from 'lit';
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

export const getWrappingLabel = (label) => {
  const post = label.replace(/^.*?(?=[0-9]+ of [0-9]+$)/i, '');

  return html`${label.replace(post, '')}<br />${post}`
}

export const getTypeLabel = (type) => type.substring(0,1).toUpperCase() + type.substring(1, (type.length - 1));

export const getTimerlabel = (type, count, total) => `${getTypeLabel(type)} number ${count} of ${total}`;

export const getWaitinglabel = (type, count) => html`Waiting to start ${getTypeLabel(type)} number ${count}`;

const withinTollerance = (actual, target, tollerance = 5) => {
  return (actual >= (target - tollerance) && (actual <= target + tollerance));
};

const getCenteringTime = (time) => {
  let third = Math.round((time / 3) / 1000);

  if (withinTollerance(third, 60)) {
    return 'minute';
  }
  if (third < 95) {
    return `${third} seconds`;
  }
  // Make 1 third from seconds into minutes
  third = Math.round((third / 60) * 100) / 100;
  // Get only the seconds part of the value
  let remainder = third % 1;

  // remove the excess seconds
  third -= remainder;

  // Make sure we have two decimal places to work with.
  remainder *= 100;

  mPost = (third > 1)
    ? 's'
    : '';

  if (remainder < 5) {
    return  `${third} minute${mPost}`;
  }
  if (remainder > 95) {
    return  `${(third + 1)} minute${mPost}`;
  }

  if (withinTollerance(remainder, 50, 5)) {
    return `${third} and a half minutes`;
  }

  return `${third} minute${mPost} and ${remainder} seconds`;
};

export const getDoingSayData = (time) => {
  const output = [
    {
      message: 'Use the whole of your first '
        + `${getCenteringTime(time)} for centering.`,
      offset: (time - 10000),
    },
    {
      message: 'You should be finishing centering and starting to '
        + 'open up.',
      offset: (Math.round(time * (2/3)) - 5000),
    },
    {
      message: 'You should be starting to pull up now.',
      offset: (Math.round(time / 2) - 5000),
    },
  ];
  if (time > 90000) {
    output.push({
      message: 'Remember to clean up your rim and remove excess '
        + 'water before you run out of time',
      offset: 2500,
    });
  }
  return output;
};

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
      offset: 23000,
    },
    {
      message: `Are you ready to start your next ${type}?`,
      offset: 4500,
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
