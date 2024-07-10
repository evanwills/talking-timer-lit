import { isObj } from "./general.utils";

/**
 * tooClose() checks whether the current value is within 5 seconds
 * of the previous value
 *
 * @param {number} current value to be tested
 * @param {number} previous value to be tested against
 *
 * @returns {boolean} TRUE if within 5 seconds of previous value
 */
export const tooClose = (current, previous) => {
  return (current > (previous - 5000) && current < (previous + 5000));
};

export const s = (input) => {
  return (input === 0 || input > 1)
    ? 's'
    : '';
};

/**
 * tooCloseAny() checks a given offset value against previously seen
 * offsets
 *
 * @param {number} offset
 * @param {array} previous list of previously seen numbers
 *
 * @returns {boolean} TRUE if offset was too close to a previously
 *                seen offset value. FALSE otherwise
 */
export const tooCloseAny = (offset, previous) => {
  for (let a = 0; a < previous.length; a += 1) {
    if (tooClose(offset, previous[a]) === true) {
      return true;
    }
  }
  return false;
}

/**
 * posMinus() ensures that the value of a subtraction is always
 * positive (or zero)
 *
 * @param {number} a
 * @param {number} b
 *
 * @return {number} positive value of a - b
 */
export const posMinus = (a, b) => {
  return (a > b)
    ? a - b
    : b - a;
};

/**
 * makeTimeMessage() returns a string that can be passed to the text
 * to web speech API
 *
 * @param {number} offset milliseconds
 *
 * @returns {string} textual representation of offset
 */
export const makeTimeMessage = (offset, suffix, forceSufix) => {
  let output = '';
  let working = offset;
  let comma = '';

  forceSufix = (typeof forceSufix !== 'boolean')
    ? false
    : forceSufix;

  if (working < 20000) {
    // Do not append unit if 10 seconds or less
    const tmpSuffix = (forceSufix)
      ? ` seconds${suffix}`
      : (working > 10000)
        ? ' seconds'
        : '';
    return Math.round(working / 1000) + tmpSuffix;
  }

  if (working >= 3600000) {
    const hours = Math.floor(working / 3600000);
    working -= hours * 3600000;
    output += comma + hours.toString() + ' hour';
    output += s(hours);
    comma = ', ';
  }

  if (working >= 60000) {
    const minutes = Math.floor(working / 60000);
    working -= minutes * 60000;
    output = comma + minutes.toString() + ' minute';
    output += s(minutes);
    comma = ', ';
  }

  working = Math.round(working / 1000);
  if (working > 0) {
    output += comma + working.toString() + ' second';
    output += s(working);
    comma = ', ';
  }

  return output + suffix;
};

/**
 * makeFractionMessage() returns a string that can be passed to the
 * text to web speech API
 *
 * @param {number} numerator for fraction
 * @param {number} denominator for fraction
 *
 * @returns {string} textual representation of the fraction offset
 */
export const makeFractionMessage = (numerator, denominator, suffixes) => {
  let fraction = '';

  // reduce the denominator to its
  const newDenominator = (Number.isInteger(denominator / numerator))
    ? (denominator / numerator)
    : denominator;

  switch (newDenominator) {
    case 2:
      return suffixes.half;
    case 3:
      fraction = 'third';
      break;
    case 4:
      fraction = 'quarter';
      break;
    case 5:
      fraction = 'fifth';
      break;
    case 6:
      fraction = 'sixth';
      break;
    case 7:
      fraction = 'seventh';
      break;
    case 8:
      fraction = 'eighth';
      break;
    case 9:
      fraction = 'ninth';
      break;
    case 10:
      fraction = 'tenth';
      break;
  };

  const newNumerator = (numerator / (denominator / newDenominator));

  return `${newNumerator} ${fraction}${s(newNumerator)}`;
};

/**
 * sortOffsets() sorts a list of offset objects by their offset value
 *
 * @param {array} input list of offset objects to be sorted
 *
 * @returns {array} items are sorted by offset
 */
export const sortOffsets = (input) => {
  return input.sort((a, b) => {
    if (a.offset < b.offset) {
      return 1;
    } else if (a.offset > b.offset) {
      return -1;
    } else {
      return 0;
    }
  });
};

  /**
   * filterOffsets() removes duplicates an items that are too close
   * to preceeding items
   *
   * @param {array} offsets list of offset objects
   *
   * @returns {array} list of offset objects excluding duplicates and
   *                closely occuring items
   */
export const filterOffsets = (offsets, max) => {
  let found = [];

  return offsets.filter(item => {
    if (found.indexOf(item.offset) === -1
      && (item.offset <= 30000 || !tooCloseAny(item.offset, found))
      && item.offset < max && item.offset > 0
    ) {
      found.push(item.offset);
      return true;
    } else {
      return false;
    }
  })
};

const getX = (unit) => {
  switch (unit) {
    case 'm':
      return 60000;

    case 'h':
      return 3600000;

    case 's':
    default:
      return 1000;
  }
}

const getNonRelativeMsgs = (intervalObj, milliseconds, suffixes) => {
  const half = (milliseconds / 2);
  const interval = (intervalObj.time * 1000);
  const output = [];

  for (let offset = interval; offset <= half; offset += interval) {
    output.push(
      sayItemAdapter({
        offset,
        message: makeTimeMessage(offset, suffixes.last),
        // raw: intervalObj.raw,
      }),
      sayItemAdapter({
        offset: milliseconds - offset,
        message: makeTimeMessage(offset, suffixes.first),
        // raw: intervalObj.raw,
      }),
    );
  }

  return output;
};

const getRate = (msg) => {
  const regex = /^1?[0-9]$/;
  return regex.test(msg)
    ? 1.5
    : 1;
};

const getRelativeMsgs = (intervalObj, milliseconds, suffix) => {
  const output = [];
  let interval = getX(intervalObj.unit);
  let count = 0;

  if (intervalObj.every === true) {
    interval *= intervalObj.time;
    count = milliseconds / interval;
  } else {
    count = intervalObj.time;
  }
  const modifier = (intervalObj.relative !== 'first')
    ? 0
    : milliseconds;
  const forceSufix = (intervalObj.relative === 'first');

  for (let a = count; a > 0; a -= 1) {
    const offset = a * interval;
    output.push(
      sayItemAdapter({
        message: makeTimeMessage(offset, suffix, forceSufix),
        offset: posMinus(modifier, offset),
        // raw: intervalObj.raw,
      }),
    );
  }

  return output;
};

export const sayItemAdapter = (item) => ({
  offset: item.offset,
  message: item.message,
  rate: getRate(item.message),
});

export const sayListAdapter = (data) => data.map(sayItemAdapter);

/**
 * Get a list of interval messages based on a multiplier
 *
 * @param {object} intervalObj  interval object parsed from speak
 *                              attribute
 * @param {number} milliseconds number of milliseconds remaining
 *                              for timer
 * @param {string} suffix       string to append to spoken messages
 *
 * @returns {array} list of interval objects containing offset &
 *                 message properties used for announcing intervals
 */
const getMultiplierMsgs = (intervalObj, milliseconds, suffix) => {
  const output = [];
  const interval = (intervalObj.time * getX(intervalObj.unit));
  const modifier = (intervalObj.relative === 'last')
    ? 0
    : milliseconds

  for (let offset = interval; offset <= intervalObj.time; offset += interval) {
    output.push(
      sayItemAdapter({
        offset: posMinus(modifier, offset),
        message: makeTimeMessage(offset, suffix),
        // raw: intervalObj.raw,
      }),
    );
  }

  return output;
};

/**
 * getTimeOffsetAndMessage() returns a list of time offset
 * objects for the given time interval.
 *
 * Used for announcing progress in timer
 *
 * @param {object} intervalObj interval object parsed from speak
 *                 attribute
 * @param {number} milliseconds number of milliseconds remaining
 *                 for timer
 * @param {object} suffixes    strings to append to spoken messages
 *
 * @returns {array} list of interval objects containing offset &
 *                 message properties used for announcing intervals
 */
export const getTimeOffsetAndMessage = (
  intervalObj,
  milliseconds,
  suffixes,
) => {
  const suffix = (intervalObj.relative === 'first')
    ? suffixes.first
    : suffixes.last;

  if ((intervalObj.all === true || intervalObj.every === true) || intervalObj.multiplier > 1) {
    if ((intervalObj.all === true || intervalObj.every === true) && intervalObj.multiplier <= 1) {
      if (intervalObj.relative === '') {
        // not relative so announce time relative to nearest edge
        // of time (e.g. 1 minute to go & 1 minute gone)
        return getNonRelativeMsgs(intervalObj, milliseconds, suffixes);
      }

      // interval relative === false
      // i.e. relative = "first" or "last"
      return getRelativeMsgs(intervalObj, milliseconds, suffix);
    }
    if (intervalObj.multiplier > 1) {
      return getMultiplierMsgs(intervalObj, milliseconds, suffix);
    }
  }

  const interval = (intervalObj.time * 1000);
  const offset = (intervalObj.relative !== 'first')
    ? interval
    : (milliseconds - interval);
  return [
    sayItemAdapter({
      offset: offset,
      message: makeTimeMessage(interval, suffix),
      // raw: intervalObj.raw,
    }),
  ];
};

/**
 * getFractionOffsetAndMessage() returns a list of time offset
 * objects based on fractions of total duration of time.
 *
 * Used for announcing progress in timer
 *
 * @param {object} suffixes    strings to append to spoken messages
 * @param {object} intervalObj interval object parsed from speak
 *                 attribute
 * @param {number} milliseconds number of milliseconds remaining
 *                 for timer
 *
 * @returns {array} list of interval objects containing offset &
 *                 message properties used for announcing intervals
 */
export const getFractionOffsetAndMessage = (
  intervalObj,
  milliseconds,
  suffixes,
) => {
  let interval = 0;
  const half = milliseconds / 2;

  interval = milliseconds / intervalObj.denominator;
  if (intervalObj.denominator === 2) {
    return [{ message: 'Half way', offset: half, raw: intervalObj.raw }];
  }

  let offsets = [];

  const count = (intervalObj.multiplier === 0 || intervalObj.multiplier >= intervalObj.denominator)
    ? intervalObj.denominator
    : intervalObj.multiplier;

  if (intervalObj.relative !== '') {
    const suffix = (intervalObj.relative === 'first')
      ? suffixes.first
      : suffixes.last;
    const minus = (intervalObj.relative === 'first')
      ? milliseconds
      : 0;

    for (let a = 1; a <= count; a += 1) {
      offsets.push(
        sayItemAdapter({
          offset: posMinus(minus, (interval * a)),
          message: makeFractionMessage(a, intervalObj.denominator) + suffix,
          // raw: intervalObj.raw,
        }),
      );
    }
  } else {
    for (let a = 1; a <= (count / 2); a += 1) {
      const message = makeFractionMessage(a, intervalObj.denominator);
      offsets.push(
        sayItemAdapter({
          offset: (milliseconds - (interval * a)),
          message: message + suffixes.last,
          // raw: intervalObj.raw,
        }),
        sayItemAdapter({
          offset: (interval * a),
          message: message + suffixes.first,
          // raw: intervalObj.raw,
        }),
      );
    }
  }

  const filtered = offsets.map(item => {
    if (tooClose(item.offset, half)) {
      return {
        offset: half,
        message: suffixes.half,
        // raw: item.raw,
      };
    } else {
      return item;
    }
  });

  return filtered;
};

/**
 * Process the matches made by a regular expression, into something
 * that the rest of the parser can use.
 *
 * @param {mixed}   matches patterns matched by a regular expression
 * @param {boolean} exclude
 *
 * @returns {object}
 */
const intervalAdapter = (matches, exclude) => {
  const tmp = matches.groups;
  const allEvery = (typeof tmp.allEvery !== 'undefined')
    ? tmp.allEvery.toLocaleLowerCase()
    : '';
  const relative = (typeof tmp.relative !== 'undefined')
    ? tmp.relative.toLocaleLowerCase()
    : '';

  const output = {
    all: (allEvery === 'all' || relative === ''),
    every: (allEvery === 'every' && relative !== ''),
    exclude,
    isFraction: false,
    multiplier: (typeof tmp.multiplyer !== 'undefined' && typeof (tmp.multiplyer * 1) === 'number')
      ? Number.parseInt(tmp.multiplyer, 10)
      : 1,
    relative,
    raw: matches[0],
    time: null,
    unit: null,
  };

  if (output.every === true) {
    output.all = false;
    output.multiplier = 0;
  } else if (output.all === true) {
    output.multiplier = 0;
  }

  return output;
}

const parseFraction = (matches, interval, durationMilli, post) => {
  // item is a fraction
  const denominator = Number.parseInt(matches.denominator, 10);

  interval.isFraction = true;
  interval.denominator = denominator;

  if (interval.multiplier > (denominator - 1)) {
    interval.multiplier = (denominator - 1);
  }

  return getFractionOffsetAndMessage(interval, durationMilli, post);

}

/**
 * parseRawIntervals() builds an array of objects which in turn can
 * be used to build promises that trigger speech events.
 *
 * @param {number} durationMilli
 * @param {string} rawIntervals
 * @param {boolean} omit
 * @param {string} priority talking timer config
 *
 * @returns {array}
 */
export const parseRawIntervals = (
  durationMilli,
  rawIntervals,
  omit = false,
  priority = 'fraction',
  suffixes = null,
) => {
  const post = (isObj(suffixes))
    ? suffixes
    : { first: ' gone', last: ' to go', half: 'Half way' };
  const regex = /(?<=^|\s)(?<allEvery>all|every)?[_-]?(?<multiplyer>[0-9]+)?[_-]?(?<relative>(?:la|fir)st)?[_-]?(?:(?<hmsNum>[1-9][0-9]*)[_-]?(?<hmsUnit>[smh]?)|(?<numerator>[1-9])?[_-]?1\/(?<denominator>[2-9]|10))(?=\s|$)/ig;
  let matches;
  let timeIntervals = [];
  let fractionIntervals = [];
  let orderIntervals = [];

  if (typeof rawIntervals !== 'string' || rawIntervals === '') {
    return [];
  }
  const exclude = (typeof omit === 'boolean')
    ? omit
    : false;

  while ((matches = regex.exec(rawIntervals)) !== null) {
    const tmp = matches.groups;
    const interval = intervalAdapter(matches, exclude);

    if (typeof tmp.denominator !== 'undefined') {
      const tmpIntervals = parseFraction(tmp, interval, durationMilli, post);

      if (priority === 'order') {
        orderIntervals = orderIntervals.concat(tmpIntervals);
      } else {
        fractionIntervals = fractionIntervals.concat(tmpIntervals);
      }
    } else {
      // item is a number
      tmp.hmsNum = Number.parseInt(tmp.hmsNum, 10);
      interval.unit = getX(tmp.hmsUnit);
      interval.time = tmp.hmsNum;

      const tmpIntervals = getTimeOffsetAndMessage(interval, durationMilli, post);

      if (priority === 'order') {
        orderIntervals = orderIntervals.concat(tmpIntervals);
      } else {
        timeIntervals = timeIntervals.concat(tmpIntervals);
      }
    }
  }

  let output = [];

  switch (priority) {
    case 'order':
      output = orderIntervals;
      break;
    case 'time':
      output = timeIntervals.concat(fractionIntervals);
      break;

    default:
      output = fractionIntervals.concat(timeIntervals);
  }

  return sortOffsets(filterOffsets(output, durationMilli));
};

export const sayDataIsValid = (data) => {
  let _data = data;
  if (typeof data === 'string') {
    try {
      _data = JSON.parse(data);
    } catch (e) {
      return false;
    }
  }
  if (!Array.isArray(_data) || _data.length === 0) {
    return false;
  }

  for (let a = 0; a < _data.length; a += 1) {
    if (!isObj(_data[a]) || typeof _data[a].offset !== 'number' || typeof _data[a].message !== 'string')  {
      return false;
    }
  }

  return sayListAdapter(_data);
};
