/**
 * @typedef {import('../types/comms.d.ts').TLog} TLog
 */
/**
 * @typedef {import('../types/comms.d.ts').TLogBits} TLogBits
 */

/**
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input is an object (and not NULL
 *                    and not an array).
 *                    FALSE otherwise
 */
export const isObj = (input) => (
  Object.prototype.toString.call(input) === '[object Object]'
);

/**
 * Get log list filtered by event type
 *
 * @param {TLog[]} logs  Full list of logs
 * @param {string} event Event name
 *
 * @returns {TLog[]} Filtered list of event type log entries
 */
export const filterLogs = (logs, event) => {
  if (event.trim() === '') {
    return [...logs];
  }

  return logs.filter((log) => (log.event === event));
}

/**
 * Get a limited sized filtered list of log entries for
 *
 * @param {TLog[]}  logs      Full list of logs
 * @param {string}  event     Event name
 * @param {number}  limit     Maximum number of log entries to return
 * @param {boolean} lastFirst Get the filtered list of most recent
 *                            events
 *
 * @returns {TLog[]} Limited filtered list of event type log entries
 */
export const getLimitedLogs = (
  logs,
  event = '',
  limit = 10,
  lastFirst = true
) => {
    let output = filterLogs(logs, event);

  if (lastFirst === true) {
    output = output.reverse();
  }

  return (limit > 0)
    ? output.slice(0, limit)
    : output;
};

/**
 * Check whether object's string property is a non empty string
 *
 * @param {any} value value to be tested
 *
 * @returns {boolean} TRUE if property is string and non-empty.
 */
export const isNonEmptyStr = (value) => (
  typeof value === 'string' && value.trim() !== ''
);


export const propIsNonEmptyStr = (obj, prop) => (
  isObj(obj) && isNonEmptyStr(obj[prop])
);

/**
 *
 * @param {string} input
 * @returns {Object<{ext:string, src:string}>}
 */
export const getLogBits = (input) => {
  let src = '';
  let ext = '';

  if (typeof input === 'string') {
    src = input.trim();

    if (src !== '') {
      ext = ` - ${src}`;
    }
  }

  return { ext, src };
};

/**
 * normalise (and normalise) event name
 *
 * @param {string} input
 * @returns {string}
 */
export const normalise = (input) =>
  input.toLowerCase().replace(/[^a-z\d]+/ig, '');

/**
 * normalise (and normalise) event name
 *
 * @param {string} input
 * @returns {string}
 */
export const normaliseID = (input) =>
  input.replace(/[^a-z\d_-]+/ig, '');
