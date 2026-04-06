import type { FEpre, IStrKeyObj, ITimeObj, TWholePart } from '../types/generic-types.d.ts';

export const multipliers : ITimeObj = {
  hours: 3600000,
  minutes: 60000,
  seconds: 1000,
  tenths: 100,
};

/**
 * Get a function that returns the start of an error message
 * (or console group name) string for a given method
 *
 * @param {string} componentName Name of the component `ePre()` is
 *                               being called from
 * @param {string} componentID   ID of component (if component is
 *                               used multiple times on a page)
 *
 * @returns {(method: string, before: boolean|null|string) : string}
 */
export const getEpre = (componentName : string, componentID : string = '') : FEpre => {
  const tail = (componentID !== '')
    ? ` (#${componentID})`
    : '';

  return (
    method : string,
    before : boolean | string | null = null
  ) : string => {
    let suffix = '';

    if (typeof before === 'boolean') {
      suffix = (before === true)
        ? ' (before)'
        : ' (after)';
    } else if (typeof before === 'string') {
      const _before = before.trim();

      if (_before !== '') {
        suffix = ` ("${_before}")`;
      }
    }

    return `${componentName}.${method}()${tail}${suffix} `;
  };
};

/**
 * onlyGreaterThanZero() ensures that the most significant field in
 * the returned timeObj is non-zero
 *
 * @param currentValue containing seconds, minutes & hours
 *                representing the timer's duration
 *
 * @returns object containing only the least significant
 *                fields greater than zero
 */
export const onlyGreaterThanZero = (currentValue : ITimeObj) => {
  const fields = ['hours', 'minutes', 'seconds', 'tenths'];
  let tmpValue : IStrKeyObj = {};
  let allTheRest = false;

  for (let a = 0; a < 4; a += 1) {
    const field = fields[a];
    const isNum = typeof currentValue[field] === 'number';
    if (allTheRest === true || (isNum === true && currentValue[field] > 0)) {
      tmpValue[field] = (isNum === true)
        ? currentValue[field]
        : 0;
      allTheRest = true;
    }
  }

  return tmpValue;
};

/**
 * timeObjToString() converts the current time remaining for
 * the countdown into a human readable string
 *
 * @param {object} timeObj seconds, minutes and hours value
 *                representing the timer remaining for the timer.
 * @param {boolean} nonZeroOnly [default: TRUE] whether or not to
 *                remove most significant fields if they're zero
 *
 * @returns {string} has the following structure "SS", "MM:SS",
 *                "HH:MM:SS" or "HH:MM:SS:CC" ("CC" = hundredths of
 *                a second) depending on the value of the `timeObj`
 *                attribute
 */
export const timeObjToString = (
  timeObj : ITimeObj,
  nonZeroOnly : boolean,
  noTenths : boolean = true,
) : string => {
  const tmpTimeObj = (typeof nonZeroOnly !== 'boolean' || nonZeroOnly === true)
    ? onlyGreaterThanZero(timeObj)
    : { ...timeObj };
  const fields = Object.keys(tmpTimeObj);
  const wholeTimeFields = fields.filter(field => field !== 'tenths');
  const tenthsField = fields.filter(field => field === 'tenths');

  let output = '';
  for (let a = 0; a < wholeTimeFields.length; a += 1) {
    const field = wholeTimeFields[a];
    const zero = (tmpTimeObj[field] < 10 && output !== '')
      ? '0'
      : '';
    const colon = (output === '')
      ? ''
      : ':';
    output += colon + zero + Math.round(tmpTimeObj[field]);
  }

  if (noTenths === false) {
    if (tenthsField.length > 0) {
      const colon = (output === '')
        ? '0.'
        : '.'
      output += `${colon}${Math.round(tmpTimeObj.tenths)}`;
    } else if (output === '') {
      output = '0';
    }
  }

  return output;
};

/**
 * timeObjToMilliseconds() converts the values of a time object to
 * milliseconds
 *
 * @param timeObj
 *
 * @returns number of milliseconds the time object represents
 */
export const timeObjToMilliseconds = (timeObj : ITimeObj) : number => {
  const fields = ['tenths', 'seconds', 'minutes', 'hours'];

  const tmpTimeObj : ITimeObj = (typeof timeObj.tenths === 'undefined')
    ? { ...timeObj, 'tenths': 0 }
    : { ...timeObj };

  let output = 0;
  for (let a = 0; a < 4; a += 1) {
    const field = fields[a];
    output += tmpTimeObj[field] * multipliers[field];
  }

  return output;
};

/**
 * millisecondsToTimeObj() converts the number of milliseconds
 * provided to a timeObj object
 *
 * @param milliseconds
 *
 * @returns time object with the form {hours, minutes, seconds, tenths}
 */
export const millisecondsToTimeObj = (milliseconds : number) : ITimeObj => {
  const fields = ['hours', 'minutes', 'seconds', 'tenths'];

  let output : ITimeObj = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    tenths: 0,
  };
  let remainder = milliseconds;

  for (var a = 0; a < 4; a += 1) {
    const field = fields[a];
    const tmp = getWholePart(remainder, multipliers[field]);
    remainder = tmp.part;
    output[field] = tmp.whole;
  }

  return output;
};

/**
 * getWholePart() (PURE) converts the number of milliseconds
 * provided into the whole number of units
 *
 * @param input      the number of millseconds to be converted
 *                   into approprate time unit
 *                   (e.g. hours, minutes, seconds, tenths of a second)
 * @param multiplier the value used to multiply (or divide in this
 *                   case) the number of milliseconds to get the
 *                   unit value
 *
 * @returns Two part object containing the "whole" value for the unit
 *          and the remaining number of milliseconds to be passed to
 *          the next unit
 */
export const getWholePart = (
  input : number,
  multiplier : number,
) : TWholePart => {
  const wholeVal = Math.floor(input / multiplier);

  return {
    whole: wholeVal,
    part: input - (wholeVal * multiplier),
  };
};

export const validateDurationStr = (str : string) : number | false => {
  const regex = /^(?:(?:(?:([0-1]?[0-9]|2[0-4]):)?([0-5]?[0-9]):)?([0-5]?[0-9])|([6-9][0-9]|[1-9][0-9]{2,5}))$/;
  const matches = regex.exec(str);

  if (matches !== null) {
    const len = matches.length

    if (len === 5 && typeof matches[4] !== 'undefined') {
      let seconds = Number.parseInt(matches[4], 10)

      if (seconds > 86400) {
        // limit the maximum duration of the timer to 24 hours
        seconds = 86400
      }

      return seconds * 1000
    } else if (len > 0) {
      let seconds = Number.parseInt(matches[3], 10)
      let minutes = (typeof matches[2] === 'string' && matches[2] !== '')
        ? Number.parseInt(matches[2], 10)
        : 0;
      let hours = (typeof matches[1] === 'string' && matches[1] !== '')
        ? Number.parseInt(matches[1], 10)
        : 0;

      return ((seconds + (minutes * 60) + (hours * 3600)) * 1000);
    }
  }
  return false;
};

/**
 * validateTimeDuration() validates the value of the element's `start`
 * attribute
 *
 * __NOTE:__ the parsed value of `start` must be less than 24 hours
 *
 * __NOTE ALSO:__ this method also assigns parsed values to object
 *       properties
 *
 * @param time the string value of the
 *                 element's `start` attribute
 *
 * @returns TRUE if hoursMinutesSeconds can be parsed.
 *          FALSE otherwise
 */
export const validateTimeDuration = (time : number | string) : number | false => {
  if (typeof time === 'number') {
      if (time > 86400000) {
        return 86400000;
      }
      if (time > 86400) {
        // assume time is already in miliseconds
        return time;
      }
      return (time * 1000);
  }

  if (typeof time === 'string') {
    return validateDurationStr(time);
  }

  return false;
};

export const getPublicWarning = (
  action : string,
  needed : string,
  state : string,
  join : string = 'not ',
) : string => `You cannot ${action} <talking-timer> because it is `
  + `${join} in a "${needed}" state. Current state is: "${state}"`;
