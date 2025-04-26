/**
 * A single log entry
 */
export type TLog = {
    /**
     * @property JS timestamp for when an event was dispatched
     */
    time: number,

    /**
     * @property The name of the event being dispatched
     */
    event: string,

    /**
     * @property Whatever data was dispatched with the event
     */
    data: any,

    /**
     * @property list of IDs of subscribers that were watching for the event
     */
    ids: string[],
};

export type TLogBits = {
  /**
   * @property Extra text to append to console group when outputing
   *           log info to console.
   */
  ext: string,
  /**
   * @property Source of the event being dispatched
   */
  src: string,
};

/**
 * Name of the method to use when dispatching a logged event
 */
export type TDispatcherMode = 'simpleDispatcher' | 'loggingDispatcher'

/**
 * Event dispatcher (behaves much like DOM event dispatch)
 *
 * @param event The name of the event being dispatched
 * @param data  Whatever data the dispatching client wanted to send
 *              with the event
 * @param src   Name of the component
 *
 * @returns List of ids of components that were watching for the
 *          dispatched event
 */
export type FDispatch = (event: string, data: any, src?: string) => string[];

/**
 * A callback function that watches for a specific event.
 *
 * @param data Whatever data was dispatched with the watched event
 */
export type FListener = (data: any) => void;

export type TListenerList = { [key:string] : FListener };

export type TEventListeners = { [key:string] : TListenerList };

export type FSetLogging = (logging: boolean) => void;

export type FAddListener = (
  event : string|string[],
  id : string,
  watcher : FListener,
  replace : boolean,
) => void;

export type FRemoveListener = (event : string, id : string) => boolean;
export type FRemoveListenersById = (id : string) => number;
export type FGetLogs = (
  event : string,
  limit : number,
  newestToOldest : boolean,
) => TLog[];

export type TComponentComms = {
  constructor: (logging: boolean) => void,
  enableLogging: () => void,
  disableLogging: () => void,
  addListener: FAddListener,
  removeListener: FRemoveListener,
  removeListenersById: FRemoveListenersById,
  dispatch: FDispatch,
  getLogs: FGetLogs,
  clearLogs: () => void,
};
