import type { TLoggableVars, TVarsToLog } from '../../types/console-logger.d.ts';
import { IStrKeyObj } from '../../types/generic-types';
import { isNonEmptyStr } from '../data.utils.ts';

/**
 * ConsoleLoggerDummy does absolutely nothing.
 *
 * It is intended to be used in Production to prevent errors
 * when logging is disabled but not all the logging calls have been
 * removed from the code base.
 *
 * The idea is that you would simply change the file path in the
 * `ConsoleLogger` import statement (from `ConsoleLogger.class.js`
 * to `ConsoleLoggerDummy.class.js`) when ready to turn off logging
 * in a given file.
 *
 * It's also possible to automatically rewrite import paths for
 * different build targets based on `.ENV` file values.
 */
export default class ConsoleLoggerDummy {
  //  END:  Private properties
  // ----------------------------------------------------------------
  // START: Constructor

  /**
   * Name of the console group being rendered.
   *
   * This is used to identify where the logging was called from
   * because source file name and line numbers rendered in the
   * console are not relevant
   */
  _groupName : string = '';

  /**
   * Vue component's props object
   */
  _props : IStrKeyObj = {};

  /**
   * An object containing a Vue component's `ref` variables
   */
  _refs : IStrKeyObj = {};

  /**
   * If the client code is a Class, `_this` is the client's `this`
   * value
   */
  _this : IStrKeyObj = {};

  /**
   * Name of `console` function used to render the opening of a
   * console group.
   *
   * Is either "group" or "groupCollapsed"
   */
  _groupFunc : 'group' | 'groupCollapsed' = 'group';

  /**
   * The Name of the instantiating component
   */
  _ogName : string = '';

  /**
   * The ID of the instantiating component (when that component can
   * be used by other components.)
   */
  _ogID : string = '';

  /**
   * @param name     Name of the component or class where console
   *                 logs will be called from
   * @param id       ID of the component or class
   * @param values   Collection of `props`, `ref` & `_this` objects whose property names & values
   *                           can be rendered
   * @param expanded Whether or not all console groups
   *                           should be normal (expanded) or
   *                           collapsed
   */
  constructor(
    name : string,
    id : string = '',
    _vars : TVarsToLog = {},
    _expanded : boolean = true,
  ) {
    this._groupName = name;
    this._ogName = name;

    this._setOgID(id);

    this._setGroupName();
  }

  //  END:  Constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   * Define the string used when rendering the group name of the
   * console group
   */
  _setGroupName() {
    if (this._ogName.endsWith('>')) {
      if (this._ogID !== '') {
        this._groupName = this._ogName.replace(/>$/, ` id="${this._ogID}">`);
      }
    } else if (this._ogID === '') {
      this._groupName = this._ogName;
    } else {
      this._groupName = `${this._ogName}#${this._ogID}`;
    }
  }

  _setOgID(id : string) : void {
    this._ogID = (isNonEmptyStr(id) === true)
      ? id.trim()
      : '';
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  /**
   * Get the name of the component that instantiated ConsoleLogger
   */
  getName() : string {
    return this._ogName;
  }

  /**
   * Call console.group() or console.groupCollapsed() with the method
   * name appended to the component/class identifier and optional
   * group suffix
   *
   * @param _method Name of the method consol logging is
   *                         comming from
   * @param _suffix Extra bit of text to render after the
   *                         group identifier
   *
   * @returns {void}
   */
  group(_method : string, _suffix : string | null = null) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  /**
   * Get a string that can be used as the name for a console.group
   * group
   *
   * @param method Name of the method consol logging is comming from
   * @param suffix Extra bit of text to render after the group
   *               identifier
   */
  groupName(method : string = '', suffix : string = '') : string {
    const _method = (method === '')
      ? ''
      : `.${method}()`;

    const _suffix = (suffix === '')
      ? ''
      : ` ${suffix}`;

    return this._groupName + _method + _suffix;
  }

  /**
   * (Alias of `groupName()`) Get a string that can be used as the
   * name for a console.group group
   *
   * @param {string}  method Name of the method consol logging is
   *                         comming from
   * @param {string?} suffix Extra bit of text to render after the
   *                         group identifier
   *
   * @returns {string}
   */
  gn(method : string = '', suffix : string = '') : string { return this.groupName(method, suffix); }

  /**
   * Log values to the console after some change has happened
   *
   * @param _method      Name of method logging is called from
   * @param _logableVars List of variable names to be logged
   * @param _endTwice    Whether or not to call console.groupEnd()
   *                     twice
   * @param _swapGroup   Whether or not to use the other console
   *                     group method. i.e. if the current group
   *                     method is `group()` then call
   *                     `groupCollapsed()` or vise versa
   *
   * @returns {void}
   */
  after(
    _method : string,
    _logableVars : TLoggableVars = {},
    _endTwice : boolean = true,
    _swapGroup : boolean = false,
  ) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  /**
   * Log values to the console after some change has happened
   *
   * @param _method      Name of method logging is called from
   * @param _logableVars List of variable names to be logged
   * @param _endTwice    Whether or not to call console.groupEnd()
   *                     twice
   * @param _swapGroup   Whether or not to use the other console
   *                     group method. i.e. if the current group
   *                     method is `group()` then call
   *                     `groupCollapsed()` or vise versa
   */
  before(
    _method : string,
    _logableVars : TLoggableVars = {},
    _startTwice : boolean = true,
    _swapGroup : boolean = false,
  ) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  /**
   * Console a console error plus (and optionally) a number of values
   * wrapped within a console error group
   *
   * > __Note:__ Error groups are always rendered expanded
   *
   * @param method       Name of method logging is done from
   * @param message      Error message to be rendered
   * @param _logableVars Lists of values to be logged
   * @param _endTwice    Whether or not to call console.groupEnd()
   *                     twice
   */
  error(
    method : string,
    message : string,
    _logableVars : TLoggableVars = {},
    _endTwice : boolean = false,
  ) : void {
    console.group(this.groupName(method, '[[ERROR]]'));
    console.error(message);
    console.groupEnd();
  }

  /**
   * Console a console error plus (and optionally) a number of values
   * wrapped within a console error group
   *
   * > __Note:__ Error groups are always rendered expanded
   *
   * @param _method      Name of method logging is done
   *                                    from
   * @param _message     Error message to be rendered
   * @param _logableVars Lists of values to be logged
   */
  info(
    _method : string,
    _message : string,
    _logableVars = {},
    _endTwice = false,
  ) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  /**
   * Console log a number of values wrapped within a console group
   *
   * @param _method      Name of method logging is done from
   * @param _logableVars Lists of values to be logged
   * @param _noEnd       Whether or not to call `console.groupEnd()`
   *                     after logging values
   * @param _swapGroup   Whether or not to use the other console
   *                     group method.
   *                     i.e. if the current group method is
   *                     `group()` then call `groupCollapsed()` or
   *                     vise versa
   *
   * @returns {void}
   */
  only(
    _method : string,
    _logableVars : TLoggableVars = {},
    _noEnd : boolean = false,
    _swapGroup : boolean = false,
  ) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  /**
   * reset the ID used to identify the block
   *
   * @param {string} id
   */
  resetID(id : string) : void {
    this._setOgID(id);

    this._setGroupName();
  }

  /**
   * Console a console error plus (and optionally) a number of values
   * wrapped within a console error group
   *
   * > __Note:__ Error groups are always rendered expanded
   *
   * @param method       Name of method logging is done from
   * @param message      Error message to be rendered
   * @param _logableVars Lists of values to be logged
   * @param _endTwice    Whether or not to call console.groupEnd()
   *                     twice
   */
  warn(
    _method : string,
    _message : string,
    _logableVars : TLoggableVars = {},
    _endTwice : boolean = false,
  ) : void {
    // This is intentionally empty to prevent unwanted logging in
    // production
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}
