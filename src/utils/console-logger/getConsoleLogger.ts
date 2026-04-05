import { isObj } from '../data.utils.ts';
import { getSetFromCSV } from './console-logger.utils.ts';
import ConsoleLoggerDummy from './ConsoleLoggerDummy.class.ts';
import ConsoleLogger from './ConsoleLogger.class.ts';
import { getLocalValue } from '../local-storage.utils.ts';
import { TVarsToLog } from '../../types/console-logger';

// ------------------------------------------------------------------
// START: Local constants

/**
 * @constant PAST_OFFSET Number of milliseconds in the past to allow
 *                       outputting of console logs
 */
const PAST_OFFSET : number = 3600000; // 1 hour in milliseconds

/**
 * @constant FUTURE_OFFSET Number of milliseconds in the future to
 *                         allow outputting of console logs
 */
const FUTURE_OFFSET : number = 300000; // 5 minutes in milliseconds

/**
 *
 *
 * @constant {boolean} DEBUG_ALL Whether or not the end user has set
 *                               a LocalStorage value for
 *                               `forceDebug` to "1"
 */
const DEBUG_ALL = getLocalValue('debugForceAll', '0', 'string') === '1';

/**
 * A Date value to anchor console logging to.
 *
 * If DEBUG_NOW is greater than PAST_OFFSET millisecons in the past
 * and less than FUTURE_OFFSET milliseconds in the future.
 *
 * @constant {Date} DEBUG_NOW
 */
const DEBUG_NOW = new Date(getLocalValue('debugNow', '', 'string') as string);

/**
 * List of component names that should be forced into console logging
 * mode regardless of their currnent environment or `LOGGING` state
 *
 * @constant {Set<string>} DEBUG_ONLY
 */
const DEBUG_ONLY = getSetFromCSV(getLocalValue('debugForceOnly', '', 'string') as string);

/**
 * List of ID whose components should be forced into console logging
 * mode regardless of their currnent environment or `LOGGING` state
 *
 * @constant {Set<string>} DEBUG_ONLY_ID
 */
const DEBUG_ONLY_ID = getSetFromCSV(getLocalValue('debugForceOnlyID', '', 'string') as string);

//  END:  Local constants
// ------------------------------------------------------------------
// START: function declarations

/**
 * Check whether the user has manually created a LocalStorage value
 * for `debugNow` with a value that is within the PAST_OFFSET of the
 * current time,
 * AND has either forced all logging (via the LocalStorage value
 *     `debugForceAll` set to "1"),
 * OR forced logging for all instances of the component by including
 *    the component's `name` in the comma separated list in
 *    LocalStorage value `debugForceOnly`
 * OR has forced logging for a single instance of the component
 *    (identified by `id`) by including the component's ID in the
 *    comma separated list in LocalStorage value `debugForceOnlyID`
 *
 * @param show Whether or not the component wishing to instantiate
 *             ConsoleLogger is in "dummy" (or "hide") mode
 *             i.e. does not feel the need to show console logs
 * @param name Name of the component initialising ConsoleLogger
 * @param id    ID of the component initialising ConsoleLogger
 *
 * @returns `TRUE` if the user wants to see console logs
 */
const _forceLogging = (
  show : boolean,
  name : string,
  id : string,
) : boolean => {
  if (DEBUG_NOW.toString() === 'Invalid Date') {
    // No (valid) LocalStorage value for `debugNow`
    return false;
  }

  const when = DEBUG_NOW.getTime();
  const now = Date.now();

  if ((when < (now - PAST_OFFSET)) || (when > (now + FUTURE_OFFSET))) {
    // We're outside of the user defined (`debugNow`) time
    return false;
  }

  return (show === true || DEBUG_ALL === true
    || DEBUG_ONLY.has(name) || DEBUG_ONLY_ID.has(id));
};

/**
 * Get a list of possible configuration option strings for
 * ConsoleLogger
 *
 * @param options Possible options
 *
 * @returns List of config options
 */
const _getOptionsArray = (options : unknown) : string[] => { // eslint-disable-line arrow-body-style
  return (typeof options === 'string')
    ? options.replaceAll(/[\s,]+/g, ',')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => (item !== ''))
    : [];
};

/**
 * Check whether or not the end user is running in a local
 * development environment
 *
 * @returns TRUE if user is running in a locally hosted Node/Deno or
 *          Sitecore environment. FALSE otherwise
 */
const _isLocal = () : boolean => {
  const location = new URL(
    (typeof globalThis.window?.location === 'string')
      ? globalThis.window.location
      : globalThis.window.location.href,
  );

  return (location.hostname === 'localhost'
    // If this is true we're in a local Sitecore Dev environment
    || location.hostname.endsWith('smithfamily.localhost'));
};

/**
 * Whether or not to return ConsoleLogger or ConsoleLoggerDummy
 * object
 *
 * > __Note:__ The end user can override client code's "show"
 * >           preference by setting the localStorage property
 * >           `debugForce` to "1"
 *
 * @param {boolean} show Whether or not the client code things it
 *                       should be in logging mode
 *
 *
 * @returns {boolean}
 */
const _inLogMode = (
  show : boolean,
  name : string,
  id : string,
) : boolean => { // eslint-disable-line arrow-body-style
  return ((show === true
    && (globalThis.window === undefined || globalThis.window === null))
    || ((show === true && _isLocal() === true)
    // If we're calling _forceLogging() here, we're in a hosted
    // Sitecore environment
    || _forceLogging(show, name, id) === true)
  );
};

/**
 * Get an instance of ConsoleLogger or ConsoleLoggerDummy based on
 * whether the component wants to show console logs, the site is
 * being hosted in a local dev environment and/or the end user has
 * foced logging to be enabled via LocalStorage values being set
 *
 * __`LocalStorage` values__ used:
 * * `debugNow` - ISO8601 full date/time string (including time zone)
 * * `debugForce` - "1" if end user wants to force debugging
 *
 * > __Note:__ If `debugForce` is set to "1" even hidden console
 * >           logs will be output
 *
 * @param {string} name    Name of the component or class where
 *                         console logs will be called from
 * @param {string} id      ID of the component or class
 * @param {object} values  Collection of `props`, `ref` & `_this`
 *                         objects whose property names & values
 *                         can be rendered
 * @param {string} options Comma separated list of option strings:
 *                         "collapse" - make console groups collapsed
 *                         "show" - use `ConsoleLogger` class instead
 *                         of `ConsoleLoggerDummy`
 *
 * @returns {ConsoleLoggerDummy|ConsoleLogger}
 */
const getConsoleLogger = (
  name : string,
  id : string | TVarsToLog = '',
  vars : TVarsToLog | string = {},
  options : string = '',
) : ConsoleLogger | ConsoleLoggerDummy => {
  let _id = '';
  let _vars = {};
  let _tmpOptions = '';

  if (isObj(id)) {
    _id = '';
    _vars = id;
    _tmpOptions = (typeof vars === 'string')
      ? vars
      : '';
  } else {
    _id = id;
    _vars = (isObj(vars))
      ? vars
      : {};
    _tmpOptions = options;
  }

  const _options = _getOptionsArray(_tmpOptions);

  const expanded = (_options.includes('collapse') === false);
  const show = _options.includes('show') === true;

  if (_inLogMode(show, name, _id) === true) {
    return new ConsoleLogger(name, _id, _vars, expanded);
  }

  return new ConsoleLoggerDummy(name, _id, _vars, expanded);
};

//  END:  function declarations
// ------------------------------------------------------------------

export default getConsoleLogger;
