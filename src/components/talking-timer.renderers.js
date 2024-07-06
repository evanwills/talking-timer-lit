import { html } from 'lit';
import { isNum, makeNullNum } from '../utils/general.utils';


export const colon = (input, sep = ':') => {
  const tmp = (sep === '.')
    ? 'colon colon--point'
    : 'colon';

  return (input !== null)
    ? html`<span class="${tmp}">${sep}</span>`
    : ''
};

export const num = (input, small = false) => {
  const tmp = (small === true)
    ? 'num num--small'
    : 'num'
  return (input !== null)
    ? html`<span class="${tmp}">${input}</span>`
    : ''
};

export const  wholeClass = (progress) => {
  return (progress !== null)
    ? 'whole whole--w-progress'
    : 'whole';
};

export const sanitiseTime = (hours, minutes, seconds, tenths, progress) => {
  const output = { hours, minutes, seconds, tenths, progress };

  output.hours = makeNullNum(output.hours);
  output.minutes = makeNullNum(output.minutes, output.hours);
  output.seconds = makeNullNum(output.seconds, output.minutes);
  output.progress = isNum(output.progress)
    ? output.progress
    : null;

  if (!isNum(output.tenths)) {
    if (typeof output.tenths === 'string' && output.tenths.trim() !== '') {
      output.tenths = parseInt(output.tenths.trim().substring(0,1), 10);
    } else {
      output.tenths = null;
    }
  }

  return output;
};

export const renderHumanTime = (hours, minutes, seconds, tenths, progress, label) => {

  const data = sanitiseTime(hours, minutes, seconds, tenths, progress);

  return html`
    <div class="human">
      <span class="${wholeClass()}">
        ${num(data.hours)}
        ${colon(data.hours)}
        ${num(data.minutes)}
        ${colon(data.minutes)}
        ${num(data.seconds)}
        ${colon(data.tenths, '.')}
        ${num(data.tenths, true)}
      </span>
      ${(data.progress !== null)
        ? html`
          <label for="tmpProg">
            Time remaining
            ${(label.trim() !== '') ? `for ${label}` : ''}
          </label>
          <progress id="tmpProg" max="100" .value="${data.progress}" tabindex="0">${data.progress}$</progress>`
        : ''
      }
    </div>
  `;
};

export const getMainBtn = (state, clicker, noPause) => {
  let txt = '';
  // console.group('getMainBtn()');
  // console.log('state:', state);
  // console.log('clicker:', clicker);
  // console.groupEnd();

  switch (state) {
    case 'ready':
      txt = 'Start';
      break;

    case 'running':
      if (noPause === true) {
        return '';
      }
      txt = 'Pause';
      break;

    case 'paused':
      txt = 'Resume';
      break;

    case 'ended':
      txt = 'Restart';
      break;

    default:
      return '';
  }

  if (txt === '') {
    return '';
  }

  let val = txt.toLowerCase();

  const cls = `btn btn--${val}`;
  return html`<button accesskey="S" class="${cls}" .value="${val}" @click=${clicker}>${txt}</button>`;
};

export const getOtherBtn = (text, clicker) => {
  let txt = text.trim();

  if (txt === '') {
    return '';
  }

  const val = txt.toLowerCase();
  const key = (val === 'restart')
    ? 'R'
    : 'N'

  return html`<button accesskey="${key}" class="btn btn--${val}" .value="${val}" @click=${clicker}>${txt}</button>`;
}

export const stateError = (action, requireStates, state) => {
  return `Cannot ${action} timer because it is not in the `
   +`"${requireStates}" state. Current state: "${state}"`;
};
