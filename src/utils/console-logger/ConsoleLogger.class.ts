import { isNonEmptyStr, isObj } from '../data.utils.ts';
import {
  consoleMsg,
  getOrderedKeys,
  logDeepObjProps,
  logLocalObjProps,
  logObjDeepKeyVal,
} from './console-logger.utils';
import ConsoleLoggerDummy from './ConsoleLoggerDummy.class';
import type { TKeys, TLoggableVars, TVarsToLog } from '../../types/console-logger.d.ts';

const toRaw = (input : unknown) : unknown => input;

/**
 * ConsoleLogger is a collection of methods for making console
 * logging easier for Vue components and pure JS classes
 *
 * > __Note:__ When ready to disable logging the developer only needs
 * >           to change the file path in the import statement from
 * >           `ConsoleLogger.class.js` to `ConsoleLoggerDummy.class.js`
 *
 * > __Note also:__ Disabling logging could also be done autmatically
 * >           for different target build environments based on values
 * >           in the `.ENV` file
 */
export default class ConsoleLogger extends ConsoleLoggerDummy {
  // ----------------------------------------------------------------
  // START: Private properties

  //  END:  Private properties
  // ----------------------------------------------------------------
  // START: Constructor

  /**
   * @param name     Name of the component or class where
   *                           console logs will be called from
   * @param id       ID of the component or class
   * @param values   Collection of `props`, `ref` & `_this`
   *                           objects whose property names & values
   *                           can be rendered
   * @param expanded Whether or not all console groups
   *                           should be normal (expanded) or
   *                           collapsed
   */
  constructor(
    name : string,
    id : string | TVarsToLog = '',
    vars : TVarsToLog | boolean = {},
    expanded : boolean = true,
  ) {

    const bump = (isObj(id) === true);
    const _id : string = (typeof id === 'string')
      ? id
      : '';
    const _vars : TVarsToLog = (typeof id === 'object' && id !== null)
      ? id
      : (typeof vars === 'object' && vars !== null)
        ? vars
        : {};
    const _expanded : boolean = (typeof vars === 'boolean')
      ? vars
      : expanded;

    super(name, _id, _vars, _expanded);

    const { props, refs, _this } = _vars;

    this._props = isObj(props)
      ? props
      : {};
    this._refs = isObj(refs)
      ? refs
      : {};
    this._this = isObj(_this)
      ? _this
      : {};
  }

  //  END:  Constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   * Log selected selected Vue component property name/value pairs to
   * the console
   *
   * @param keys List of Vue component property names to be logged to
   *             console
   * @param rev  Whether or not to log the property name/value pairs
   *             in reverse order
   */
  _logProps(keys : TKeys | undefined, rev : boolean = false) : void {
    if (typeof keys === 'string' || Array.isArray(keys)) {
      const _keys = getOrderedKeys(this._props, keys, rev);

      if (Array.isArray(_keys) && _keys.length > 0) {
        for (const deepKeys of _keys) {
          const key0 = deepKeys.shift();

          if (typeof key0 === 'string') {
            if (this._props[key0] === undefined) {
              console.warn(`props.${key0}:`, '[undefined]');
            } else {
              logObjDeepKeyVal(toRaw(this._props[key0]), `props.${key0}`, deepKeys);
            }
          }
        }
      }
    }
  }

  /**
   * Log selected selected Vue component `ref` variable name/value
   * pairs to the console
   *
   * @param keys List of Vue component `ref` variable names to be
   *             logged to console
   * @param rev  Whether or not to log the `ref` variable name/value
   *             pairs in reverse order
   */
  _logRefs(keys : TKeys | undefined, rev : boolean = false) : void {
    if (typeof keys === 'string' || Array.isArray(keys)) {
      const _keys = getOrderedKeys(this._refs, keys, rev);

      if (Array.isArray(_keys) && _keys.length > 0) {
        for (const deepKeys of _keys) {
          const key0 = deepKeys.shift();

          if (typeof key0 === 'string') {
            if (this._refs[key0] === undefined) {
              console.warn(`(Ref/Computed) ${key0}.value: [undefined]`);
            } else if (isObj(this._refs[key0]) === false
              || this._refs[key0].value === undefined
            ) {
              // It's unclear what this is,
              // so we'll just render it as is
              console.log(`${key0}:`, this._refs[key0]);
            } else {
              // This value is definitely a Vue Ref/Computed object
              logObjDeepKeyVal(toRaw(this._refs[key0].value), `${key0}.value`, deepKeys);
            }
          }
        }
      }
    }
  }

  _logTrace(method : string) : void {
    console.groupCollapsed(this.groupName(method, '[[ TRACE ]]'));
    console.debug();
    console.trace();
    console.groupEnd();
  }

  /**
   * Log selected selected Class property name/value pairs to the
   * console
   *
   * @param keys List of Class property names to be logged to console
   * @param rev  Whether or not to log the Class property name/value
   *             pairs in reverse order
   */
  _logThis(keys : TKeys | undefined, rev : boolean = false) : void {
    if (typeof keys === 'string' || Array.isArray(keys)) {
      logDeepObjProps(
        this._this,
        getOrderedKeys(this._this, keys, rev),
        'this.',
      );
    }
  }

  /**
   * Render name value pairs (if applicable) in the following order
   *
   * 1. local variables
   * 2. Class properties
   * 3. Vue component `props`
   * 4. Vue component `refs`
   * 5. log message
   * 6. info message
   * 7. warn message
   * 8. error message
   *
   * @param {TLoggableVars} loggableVars List of things to log
   */
  _logAll(
    {
      refs,
      props,
      _this,
      local,
      info,
      log,
      warn,
      error,
    } : TLoggableVars,
    method : string,
    trace : boolean = false,
  ) : void {
    if (isObj(local) === true) {
      logLocalObjProps(local, this.groupName(method));
    }
    this._logThis(_this);
    this._logProps(props);
    this._logRefs(refs);

    consoleMsg('log', log);
    consoleMsg('info', info);
    consoleMsg('warn', warn);
    consoleMsg('error', error);

    if (trace === true) {
      this._logTrace(method);
    }
  }

  /**
   * Render name value pairs (if applicable) in the following
   * (reverse) order
   *
   * 1. error message
   * 2. warn message
   * 3. info message
   * 4. log message
   * 5. Vue component `refs` & `computed`
   * 6. Vue component `props`
   * 7. Class properties
   * 8. local variables
   *
   * @param {TLoggableVars} loggableVars List of things to log
   */
  _logAllRev(
    {
      refs,
      props,
      _this,
      local,
      info,
      log,
      warn,
      error,
    } : TLoggableVars,
    method : string,
    trace : boolean = false,
  ) {
    consoleMsg('error', error);
    consoleMsg('warn', warn);
    consoleMsg('info', info);
    consoleMsg('log', log);

    this._logRefs(refs, true);
    this._logProps(props, true);
    this._logThis(_this, true);

    if (isObj(local) === true) {
      logLocalObjProps(local, this.groupName(method), true);
    }

    if (trace === true) {
      this._logTrace(method);
    }
  }

  /**
   * Output to Console, a console error/warn/info message plus
   * *(optionally)* a number of values all wrapped within an
   * __expanded__ console group
   *
   * @param {string}        method      Name of method logging is done
   *                                    from
   * @param {string}        message     Error message to be rendered
   * @param {TLoggableVars} logableVars Lists of values to be logged
   * @param {string}        cMethod     Console method to call
   * @param {string}        typeStr     Type string to render as the second param in group name
   *
   * @returns {void}
   */
  _message(
    method : string,
    message : string,
    logableVars : TLoggableVars = {},
    cMethod : 'error' | 'warn' | 'info' | 'log' = 'error',
    typeStr : string = '( ERROR )',
    endTwice : boolean = false,
  ) : void {
    const grpFunc = this._groupFunc;

    // force group to be expanded
    this._groupFunc = 'group';

    this.group(`${method} ${typeStr}`);

    // revert to default group state
    this._groupFunc = grpFunc;

    this._logAll(logableVars, method);

    if (isNonEmptyStr(message)) {
      console[cMethod](message);
    }
    console.groupEnd();

    if (endTwice === true) {
      console.groupEnd();
    }
  }

  /**
   *
   */
  _swapGroup(swap : boolean) : void {
    if (swap === true) {
      this._groupFunc = (this._groupFunc === 'group')
        ? 'groupCollapsed'
        : 'group';
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  /**
   * Log values to the console after some change has happened
   *
   * @param method      Name of method logging is called from
   * @param logableVars List of variable names to be logged
   * @param endTwice    Whether or not to call console.groupEnd()
   *                    twice
   * @param swapGroup   Whether or not to use the other console
   *                    group method.
   *                    i.e. if the current group method is `group()`
   *                    then call `groupCollapsed()` or vise versa
   */
  after(
    method : string,
    logableVars : TLoggableVars = {},
    endTwice : boolean = true,
    swapGroup : boolean = false,
  ) : void {
    this._swapGroup(swapGroup);
    this.group(`${method} (after)`);
    this._swapGroup(swapGroup);

    this._logAllRev(logableVars, method, false);

    console.groupEnd();

    if (endTwice !== false) {
      console.groupEnd();
    }
  }

  /**
   * Log values to the console gefore some change has happened
   *
   * @param method      Name of method logging is called from
   * @param logableVars List of variable names to be logged
   * @param endTwice    Whether or not to call console.groupEnd()
   *                    twice
   * @param swapGroup   Whether or not to use the other console
   *                    group method.
   *                    i.e. if the current group method is `group()`
   *                    then call `groupCollapsed()` or vise versa
   */
  before(
    method : string,
    logableVars : TLoggableVars = {},
    startTwice : boolean = true,
    swapGroup : boolean = false,
  ) : void {
    this._swapGroup(swapGroup);

    if (startTwice !== false) {
      this.group(method);
    }

    this.group(`${method} (before)`);
    this._swapGroup(swapGroup);

    this._logAll(logableVars, method, true);

    console.groupEnd();
  }

  /**
   * Write an error message to console and (optionally) a number of
   * values all wrapped within an expanded console group
   *
   * @param method      Name of method logging is done from
   * @param message     Error message to be rendered
   * @param logableVars Lists of values to be logged
   * @param endTwice    Whether or not to call console.groupEnd()
   *                    twice
   */
  error(
    method : string,
    message : string,
    logableVars : TLoggableVars = {},
    endTwice : boolean = false,
  ) : void {
    this._message(
      method,
      message,
      logableVars,
      'error',
      '( ERROR )',
      endTwice,
    );
  }

  /**
   * Call console.group() or console.groupCollapsed() with the method
   * name appended to the component/class identifier and optional
   * group suffix
   *
   * @param method Name of the method consol logging is comming from
   * @param suffix Extra bit of text to render after the group
   *               identifier
   */
  group(method : string, suffix : string = '') : void {
    console[this._groupFunc](this.groupName(method, suffix));
  }

  /**
   * Write an info message to console and (optionally) a number of
   * values all wrapped within an expanded console group
   *
   * @param method      Name of method logging is done from
   * @param message     Error message to be rendered
   * @param logableVars Lists of values to be logged
   * @param endTwice    Whether or not to call console.groupEnd()
   *                    twice
   */
  info(
    method : string,
    message : string,
    logableVars : TLoggableVars = {},
    endTwice : boolean = false,
  ) : void {
    this._message(
      method,
      message,
      logableVars,
      'info',
      '( INFO )',
      endTwice,
    );
  }

  /**
   * Console log a number of values wrapped within a console group
   *
   * @param method      Name of method logging is done from
   * @param logableVars Lists of values to be logged
   * @param noEnd       Whether or not to call `console.groupEnd()`
   *                    after logging values
   * @param swapGroup   Whether or not to use the other console group
   *                    method.
   *                    i.e. if the current group method is `group()`
   *                    then call `groupCollapsed()` or vise versa
   */
  only(
    method : string,
    logableVars : TLoggableVars = {},
    noEnd : boolean = false,
    swapGroup : boolean = false,
  ) : void {
    this._swapGroup(swapGroup);
    this.group(method);
    this._swapGroup(swapGroup);

    this._logAll(logableVars, method, true);

    if (noEnd !== true) {
      console.groupEnd();
    }
  }

  /**
   * Write an warning message to console and (optionally) a number
   * of values all wrapped within an expanded console group
   *
   * @param method      Name of method logging is done from
   * @param message     Error message to be rendered
   * @param logableVars Lists of values to be logged
   * @param endTwice    Whether or not to call console.groupEnd()
   *                    twice
   */
  warn(
    method : string,
    message : string,
    logableVars : TLoggableVars = {},
    endTwice : boolean = false,
  ) : void {
    this._message(
      method,
      message,
      logableVars,
      'warn',
      '( WARNING )',
      endTwice,
    );
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}
