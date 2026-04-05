/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

import { isBoolTrue, isNonEmptyStr, isObj } from '../data.utils.ts';

import type { TKeys, TLoggableVars, TVarsToLog } from '../../types/console-logger.d.ts';
import { IStrKeyObj } from '../../types/generic-types';

/**
 * Get a 2D array of strings that where each top level item
 * represents a branch in a deep object and the leaves on that
 * branch represent a path down to the deepest level to be logged.
 *
 * @param {string[]} keys List of object keys (and possibly sub-keys)
 *
 * @returns {Array<{string[]}>} 2D array of object keys where the
 *                              first level represents a branch of
 *                              an object properties.
 */
const splitKeys = (keys : string[]) : string[][] => keys.map((key) => key.split('.').map((_key) => _key.trim()));

/**
 *
 * @param {string} key
 *
 * @returns {Array<{string[]}>}
 */
const splitMultiKeys = (key : string) : string[][] => splitKeys(
  key.replaceAll(/(?:^\[|\]$)/g, '')
    .split(',')
    .map((_key) => _key.trim()),
);

/**
 * Get keys in the right order based on reverse state (`rev`)
 *
 * @param {string[]} keys
 * @param {boolean} rev
 *
 * @returns {string[]}
 */
export const orderKeys = (keys : string[], rev : boolean) : string[] => { // eslint-disable-line arrow-body-style
  return (Array.isArray(keys) && rev === true)
    ? [...keys].reverse()
    : keys;
};

const getKeysInner = (
  objKeys : string[],
  keys : string[],
  includes : boolean = true,
) : string[][] => {
  const deepKeys = splitKeys(keys);
  const topKeys = new Set(deepKeys.map((key) => key[0]));

  const tmp = new Set(objKeys.filter((key) => topKeys.has(key) === includes));

  return deepKeys.filter((key) => tmp.has(key[0]));
};

/**
 * Get list of object property names to render in console
 *
 * > __Note:__ This function is *SUPER* for giving.
 * >           If you give it something it doesn't recognise it will
 * >           just ignore it and move on. If it can't recognise
 * >           anything, it will just return an empty array
 * >
 * > I will always return an array containging only known object
 * > property keys (or an empty array) if no keys could be matched).
 *
 * @param obj  Object whose key/value pairs are to be logged to
 *             console
 * @param keys List of object property keys to be rendered
 *
 * @returns List of object property names to render in console
 */
const getKeys = (obj : IStrKeyObj, keys : TKeys) : string[][] => {
  const objKeys = Object.keys(obj);

  if (isObj(obj)) {
    if (Array.isArray(keys) === true) {
      if (isNonEmptyStr(keys[0]) && keys[0].startsWith('!')) {
        // `keys` is an exclusion list so we're only going to return
        // property names that are not in the list of keys supplied

        // remove the NOT ("!") identifier from each key
        const _keys = keys.map((key) => key.replace(/^!/, ''));

        return getKeysInner(objKeys, _keys, false);
      }

      return getKeysInner(objKeys, keys, true);
    }

    if (isNonEmptyStr(keys) === true) {
      const _key = keys.trim();

      if (_key === '*') {
        return objKeys.map((key) => [key]);
      }

      return getKeysInner(objKeys, [keys], true);
    }
  }

  return [];
};

export const getOrderedKeys = (obj : IStrKeyObj, keys : TKeys, rev : boolean) : string[][] => orderKeys(getKeys(obj, keys), rev);

/**
 * Log object's deep key/value pair to console
 *
 * Recursively go through an object's properties until we find the
 * deepest one we need to log, then output its full property branch
 * name and its value.
 *
 * @param input    Object to find deep value in
 * @param baseKey  Console log label for value
 * @param deepKeys List of deep keys
 */
export const logObjDeepKeyVal = (
  input : any,
  baseKey : string,
  deepKeys : string[],
) => {
  if (isObj(input) === false || deepKeys.length === 0) {
    // There's nothing more we can do,
    // so we'll just log what we've got
    if (typeof input === 'function') {
      try {
        console.log(`${baseKey}():`, input());
      } catch (e) {
        // This is not unexpected.
        //
        // Sometimes, when logging the output of class methods,
        // `ConsoleLogger` looses the context for the method. This
        // causes an error to be thrown.
        //
        // This is annoying from a dev perspective but irrelevent to
        // end users. It would, however, be very annoying if an
        // unhandled exception within `ConsoleLogger` broke the end
        // user experience. Thus we're just letting the dev know we
        // couldn't log the method's output
        console.error(`Error rendering function output for ${baseKey}()`);
      }
    } else {
      console.log(`${baseKey}:`, input);
    }
  } else {
    const _deep = [...deepKeys];
    const key0 = _deep.shift();

    if (typeof key0 === 'string') {
      if (key0.startsWith('[')) {
        // Looks like there are multiple sub keys at this level we need
        // to log, so we'll split them up and log each one
        const _key0 = splitMultiKeys(key0);

        for (const subKeys of _key0) {
          const subKey0 = subKeys.shift();

          if (typeof subKey0 === 'string') {
            logObjDeepKeyVal(input[subKey0], `${baseKey}.${subKey0}`, subKeys);
          }
        }
      } else if (input[key0] !== undefined) {
        // Lets see if we can go any deeper
        logObjDeepKeyVal(input[key0], `${baseKey}.${key0}`, _deep);
      }
    }
  }
};

/**
 * Log all the key/value pairs in an object
 * (as listed in the `keys` argument)
 *
 * @param obj
 * @param keys
 * @param extra
 * @param isPre
 */
export const logDeepObjProps = (
  obj : any,
  keys : string[][] | string[],
  extra : string = '',
  isPre : boolean = true,
) => {
  let pre = '';
  let post = '';

  if (extra !== '') {
    if (isPre === true) {
      pre = extra;
    } else {
      post = extra;
    }
  }

  if (Array.isArray(keys)) {
    for (const deepKeys of keys) {
      if (Array.isArray(deepKeys) === true) {
        const key0 = deepKeys.shift();
        if (typeof key0 === 'string' && obj[key0] !== undefined) {
          const propVal = obj[key0];

          if (propVal === undefined) {
            console.warn(`${key0}:`, '[undefined]');
          } else {
            logObjDeepKeyVal(propVal, pre + key0 + post, deepKeys);
          }
        }
      }
    }
  }
};

/**
 * Log input event specific event properties to console.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|FauxTarget} propVal
 *                         Keyboard event (or event like) object
 * @param {string} grpName Name of the parent console group event
 *                         values will be logged into
 *
 * @returns {void}
 */
const logFormEvent = (
  target : HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement,
  grpName : string
) : void => {
  if (target !== undefined
      && (target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target instanceof HTMLButtonElement)
  ) {
    console.group(`${grpName} - form event`);
    console.log('event.target.value:', target.value);
    if (typeof (target as HTMLInputElement).defaultValue === 'string') {
      console.log('event.target.defaultValue:', (target as HTMLInputElement).defaultValue);
    }
    console.log('event.target.validity:', target.validity);

    if (typeof target.checkValidity === 'function') {
      console.log('event.target.checkValidity():', target.checkValidity());
    }
    if (typeof target.reportValidity === 'function') {
      console.log('event.target.reportValidity():', target.reportValidity());
    }
    console.groupEnd();
  }
};

/**
 * Log keyboard specific event properties to console.
 *
 * @param propVal Keyboard event (or event like) object
 * @param grpName Name of the parent console group event values will
 *                be logged into
 *
 * @returns {void}
 */
const logKeyEvent = (
  event : KeyboardEvent,
  grpName : string,
) : void => {
  if (event instanceof KeyboardEvent) {
    console.group(`${grpName} - keyboard event`);
    console.log('event.altKey:', event.altKey);
    console.log('event.code:', event.code);
    console.log('event.ctrlKey:', event.ctrlKey);
    console.log('event.key:', event.key);
    console.log('event.location:', event.location);
    console.log('event.metaKey:', event.metaKey);
    console.log('event.shiftKey:', event.shiftKey);
    console.log('event.getModifierState("AltGraph"):', event.getModifierState('AltGraph'));
    console.log('event.getModifierState("CapsLock"):', event.getModifierState('CapsLock'));
    console.log('event.getModifierState("NumLock"):', event.getModifierState('NumLock'));
    console.log('event.getModifierState("ScrollLock"):', event.getModifierState('ScrollLock'));
    console.groupEnd();
  }
};

/**
 * Handle outer wrapping for logging event details.
 *
 * @param localVal Event (or event like) object
 * @param grpName  Name of the parent console group event values will
 *                 be logged into
 */
const logEventObjProps = (localVal : Event | KeyboardEvent, grpName : string) : void => {
  let extra = 'event';

  if (localVal.target === undefined) {
    extra = `${localVal.type} event`;
  }

  console.groupCollapsed(`${grpName} - ${extra}`);
  console.log('event.type:', localVal.type);

  if (extra === 'event') {
    console.log('event.target:', localVal.target);

    if (localVal.target !== undefined
        && (localVal.target instanceof HTMLInputElement
        || localVal.target instanceof HTMLTextAreaElement
        || localVal.target instanceof HTMLSelectElement
        || localVal.target instanceof HTMLButtonElement)
    ) {
      logFormEvent(localVal.target, grpName);
    }
  }

  if (localVal instanceof KeyboardEvent) {
    logKeyEvent(localVal, grpName);
  }
  console.groupEnd();
};

/**
 * Console log all the properties of an object (and their names)
 *
 * @param local Object containing values to be logged
 * @param rev   Whether or not to log the values in
 *                        reverse order
 */
export const logLocalObjProps = (
  local : IStrKeyObj,
  grpName : string,
  rev : boolean = false,
) : void => {
  if (isObj(local)) {
    for (const key of orderKeys(Object.keys(local), rev)) {
      const localVal = local[key];

      console.log(`${key}:`, localVal);

      if (localVal !== undefined
        && (localVal instanceof Event || isBoolTrue(localVal?.faux) === true)
      ) {
        logEventObjProps(localVal, grpName);
      }
    }
  }
};

/**
 * Call a console method with a given message (or list of messages)
 *
 * @param method Name of the console method to call
 * @param msg    Value to pass to the console method
 */
export const consoleMsg = (
  method : 'log' | 'info' | 'warn' | 'error',
  msg : string | string[] | unknown,
) : void => {
  if (isNonEmptyStr(msg)) {
    console[method](msg);
  } else if (Array.isArray(msg)) {
    for (const str of msg) {
      console[method](str);
    }
  }
};

export const getSetFromCSV = (input : string) : Set<string> => {
  if (isNonEmptyStr(input)) {
    return new Set(
      input.split(',')
        .map((_input) => _input.trim())
        .filter((_input) => _input !== ''),
    );
  }

  return new Set([]);
};
