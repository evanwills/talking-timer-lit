import {
  getLimitedLogs,
  getLogBits,
  isNonEmptyStr,
  normalise,
  normaliseID,
} from './utils.js';

/**
 * @typedef {import('../types/comms.d.ts').FListener} FListener
 */
/**
 * @typedef {import('../types/comms.d.ts').TDispatcherMode} TDispatcherMode
 */
/**
 * @typedef {import('../../types/comms').TEventListeners} TEventListeners
 */
/**
 * @typedef {import('../types/comms.d.ts').TLog} TLog
 */
/**
 * @typedef {import('../types/comms.d.ts').TListenerList} TListenerList
 */

/**
 * FileSelectCommunicator provides a way of passing data to another
 * part of an application that may be interested in something
 * changing.
 *
 * It behaves vaguely similarly to how DOM event listeners work, in
 * that something can add a watcher. Then whenever any event is fired
 * the watcher is called. The watcher can then do something if the
 * event being fired is relevant to it.
 *
 * In retrospect, I think this is not an ideal pattern. Really this
 * should be rearchitected so that it behaves exactly like DOM events
 * where where a client listens for individual events. Then, when an
 * event is fired only the listeners for that event are called.
 *
 * @method disableLogging()   Turn logging __off__ for ComponentComms
 * @method enableLogging()    Turn logging __on__ for ComponentComms
 * @method addListener(event:string,id:string,watcher:FListener,replace:boolean)
 *                 Add a watcher for a given event for a given
 *                 compoenent
 * @method removeListener(event:string,id:string)
 *                 Remove a watcher matching event/ID pair
 * @method removeListenersById(id:string)
 *                 Remove watchers for all events for a given
 *                 component ID
 * @method dispatch(event:string,data:any,src:string)
 *                 Dispatch an event (and maybe some data) to all the
 *                 components that are watching for that event
 * @method getLogs(event:string,limit:number,lastFirst:boolean)
 *                 Get logs for dispatched events.
 * @method clearLogs()
 *                 Delete all the logs that have been stored
 */
export class ComponentComms {
  // ----------------------------------------------------------------
  // START: Private properties

  /**
   * @property {TEventListeners}
   */
  _actions = {};

  /**
   * @property {TLog[]}
   */
  _log = [];

  /**
   * @property {TDispatcherMode}
   */
  _dispatcher = 'simpleDispatcher';

  //  END:  Private properties
  // ----------------------------------------------------------------
  // START: Constructor

  /**
   * Create a FileSelectCommunicator Object and add the root watcher
   *
   * @param {boolean} logging Whether or not CommponentComms should
   *                          operate in logging mode or not
   */
  constructor(logging = false) {
    this._setLogging(logging === true);
  }

  //  END:  Constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   * Check whether or not a watcher has already been set for the
   * given event and component
   *
   * @param {string} event Name of the event being dispatched
   * @param {string} id    ID of the component that is watching for
   *                       the given event
   *
   * @returns {boolean} TRUE there is already a watcher set for the event and
   *          component ID. FALSE otherwise.
   */
  _exists(event, id) {
    return (typeof this._actions[event] !== 'undefined'
      && typeof this._actions[event][id] === 'function');
  }

  /**
   * Dispatch an event (without any logging)
   *
   * @param {string} event Name of the event being dispatched
   * @param {any}    data  Whatever data the dispatcher wanted to
   *                       send with the event
   * @param {string} _src  Name of the component that dispatched the
   *                       event
   *
   * @returns {string[]} List of IDs of components that were watching
   *                     for the dispatched event
   */
  _simpleDispatcher(event, data, _src = '') {
    const _event = normalise(event);

    if (typeof this._actions[_event] !== 'undefined') {
      const IDs = Object.keys(this._actions[_event]);

      for (const key of IDs) {
        this._actions[_event][key](data);
      }

      return IDs;
    }

    return [];
  }

  /**
   * Dispatch an event and log the action to the console as well as
   * to an internal log
   *
   * @param {string} event Name of the event being dispatched
   * @param {any}    data  Whatever data the dispatcher wanted to
   *                       send with the event
   * @param {string} _src  Name of the component that dispatched the
   *                       event
   *
   * @returns {string[]} List of IDs of components that were watching
   *                     for the dispatched event
   */
  _loggingDispatcher(event, data, _src) {
    const { ext, src } = getLogBits(_src);
    const _event = normalise(event);

    // eslint-disable-next-line no-console
    console.groupCollapsed(`ComponentComms.dispatch("${_event}")${ext}`);

    if (src !== '') {
      console.log('SOURCE:', src); // eslint-disable-line no-console
    }

    console.log('event:', _event); // eslint-disable-line no-console
    console.log('data:', data); // eslint-disable-line no-console

    const IDs = this._simpleDispatcher(_event, data);

    console.log('dispatched to:', IDs);

    this._log.push({
      time: Date.now(),
      event: _event,
      data,
      ids: IDs,
    });

    console.groupEnd(); // eslint-disable-line no-console

    return IDs;
  }

  /**
   * Do the inner work to add a watcher for single event/ID pair
   *
   * @param {string}    event   Name of the event being dispatched
   * @param {string}    id      ID of the component setting the
   *                            watcher
   * @param {FListener} watcher Function to be called when the
   *                            specified event is dispatched
   * @param {boolean}   replace Whether or not to replace the watcher
   *                            if the there is already a watcher set
   *                            for the event/ID pair.
   *
   * @return {void}
   */
  _addListenerInner(
    event,
    id,
    watcher,
    replace = false
  ) {
    const _event = normalise(event);
    const _id = normaliseID(id);

    if (this._exists(_event, _id) === true && replace !== true) {
      throw new Error(
        '_addListener() could not add new watcher because a '
        + `watcher with the ID "${_id}" already _exists`,
      );
    }

    if (typeof this._actions[_event] === 'undefined') {
      this._actions[_event] = {};
    }

    this._actions[_event][_id] = watcher;
  }

  /**
   * Set logging on dispatched event to on or off
   *
   * @param {boolean} logging Whether or not logging should be
   *                          enabled or not.
   *
   * @return {void}
   */
  _setLogging(logging) {
    this._dispatcher = (logging === true)
      ? '_loggingDispatcher'
      : '_simpleDispatcher';
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  enableLogging() {
    return this._setLogging(true);
  }

  disableLogging() {
    this._setLogging(false);
  }

  /**
   * Add a new listener function to the list of listener functions
   * that are called each time an event is dispatched.
   *
   * @function addListener
   *
   * @param {string|string[]} event Type of event that will to
   *                           dispatch
   * @param {function} listener A function to be called when an event
   *                           is dispatched
   * @param {string}   id      ID of listener so it can be removed or
   *                           replaced later
   * @param {boolean}  replace Whether or not to replace existing
   *                           listener (matched by `id`) with
   *                           supplied listener
   *
   * @returns {void}
   * @throws {Error} If :
   *                 * `watcher` is not a function
   *                   OR
   *                 * `id` is not a string
   *                   OR
   *                 * `id` is an empty string
   *                   OR
   *                 * `watcher` is matched by `id` but `replace`
   *                   is FALSE
   */
  addListener(
    event,
    id,
    listener,
    replace = false,
  ) {
    if ((!isNonEmptyStr(event) && !Array.isArray(event))
      || !isNonEmptyStr(id) || (typeof listener !== 'function')
    ) {
      throw new Error(
        'addListener() could not add new listener because '
        + '`event` or `id` were empty strings or supplied '
        + '`listener` was not a function.',
      );
    }

    if (Array.isArray(event)) {
      for (const ev of event) {
        this._addListenerInner(ev, id, listener, replace);
      }
    } else {
      this._addListenerInner(event, id, listener, replace);
    }
  }

  /**
   * Remove a known listener from the list of listener
   *
   * @param {string} event Type of event that will trigger a call to
   *                       dispatch
   * @param {string} id    ID of listener so it can be removed or
   *                       replaced later
   *
   * @returns {boolean} TRUE if listener was found and removed.
   *                    FALSE otherwise.
   */
  removeListener(event, id) {
    const _event = normalise(event);
    const _id = normaliseID(id);

    if (this._exists(event, _id) === true) {
      const tmp = {};

      for (const key of Object.keys(this._actions[_event])) {
        if (key !== _id) {
          tmp[key] = this._actions[_event][key];
        }
      }

      this._actions[event] = tmp;

      return true;
    }

    return false;
  }

  /**
   * Remove listeners from any event type that has a key matching
   * the ID supplied.
   *
   * If you are unmounting a component you should remove all
   * listeners. If you have multiple listeners registered for that
   * component you may not always remember to remove all listeners.
   * `removeListenersById()` allows you to remove listeners for
   * every event associated with the supplied ID.
   *
   * @param {string} id ID of the component that registered the
   *                    listeners
   *
   * @returns {number} The number of listeners that were actually
   *                   removed
   */
  removeListenersById(id) {
    let output = 0;
    const _id = normaliseID(id);

    for (const event of Object.keys(this._actions)) {
      if (this.removeListener(event, _id) === true) {
        output += 1;
      }
    }

    return output;
  }

  /**
   * Dispatch an event with some data
   *
   * @param {string} event Type of event that triggered the dispatch
   *                       call
   * @param {any}    data  Data to dispatch along with event
   * @param {string} src   Source of the event
   *
   * @returns {void}
   */
  dispatch(event, data = null, src = '') {
    this[this._dispatcher](event, data, src);
  }

  /**
   * Get list of logs
   *
   * @param {string} event      Type of event that triggered the
   *                            dispatch call
   * @param {number} limit      Number of log entries that should be
   *                            returned (Default is 10)
   * @param {boolean} lastFirst Whether or not logs should be
   *                            returned ordered newest to oldest
   *                            or oldest to newest
   *
   * @returns {TLog[]} list of logs
   */
  getLogs(
    event = '',
    limit = 10,
    lastFirst = true,
  ) {
    return getLimitedLogs(this._log, event, limit, lastFirst);
  }

  clearLogs() {
    this._log = [];
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ComponentComms;
