import type { TLog } from '../../types/comms.d.ts';

/**
 * Get log list filtered by event type
 *
 * @param logs  Full list of logs
 * @param event Event name
 *
 * @returns {} Filtered list of event type log entries
 */
export const filterLogs = (logs : TLog[], event : string) : TLog[] => {
  if (event.trim() === '') {
    return [...logs];
  }

  return logs.filter((log) => (log.event === event));
}

/**
 * Get a limited sized filtered list of log entries for
 *
 * @param logs      Full list of logs
 * @param event     Event name
 * @param limit     Maximum number of log entries to return
 * @param lastFirst Get the filtered list of most recent events
 *
 * @returns Limited filtered list of event type log entries
 */
export const getLimitedLogs = (
  logs : TLog[],
  event : string = '',
  limit : number = 10,
  lastFirst : boolean = true
) : TLog[] => {
    let output = filterLogs(logs, event);

  if (lastFirst === true) {
    output = output.reverse();
  }

  return (limit > 0)
    ? output.slice(0, limit)
    : output;
};

/**
 *
 * @param input
 * @returns
 */
export const getLogBits = (input : string) : {ext:string, src:string} => {
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
