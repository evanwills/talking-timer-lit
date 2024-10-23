import { html } from 'lit';
import { isNum } from './general.utils';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * Get the (human readable) amount time for centring a pot
 *
 * @param {number} time Number of milliseconds for each pot
 *
 * @returns {string}
 */
const getCenteringTime = (time) => {
  let third = Math.round((time / 3) / 1000);

  if (withinTollerance(third, 60)) {
    return 'minute';
  }
  if (third < 95) {
    return `${third} seconds`;
  }
  // Make 1 third from seconds into minutes
  third = Math.round((third / 60) * 100) / 100;
  // Get only the seconds part of the value

  let remainder = third % 1;

  // remove the excess seconds
  third -= remainder;

  // Make sure we have two decimal places to work with.
  remainder *= 100;

  const mPost = (third > 1)
    ? 's'
    : '';

  if (remainder < 5) {
    return  `${third} minute${mPost}`;
  }
  if (remainder > 95) {
    return  `${(third + 1)} minute${mPost}`;
  }

  if (withinTollerance(remainder, 50, 5)) {
    return `${third} and a half minutes`;
  }

  remainder = Math.round((remainder / 100) * 60);

  return `${third} minute${mPost} and ${remainder} seconds`;
};

export const getBtn = (value, label, clickHandler) =>  html`
<button
  class="special-btn ${value}-btn"
  id="ss-${value}"
  type="button"
  value="${value}"
  @click=${clickHandler}>
  ${label}
</button>`;

export const getRepOptions = () => {
  const reps = [];

  for (let a = 1; a <= 10; a += 1) {
    reps.push({
      label: a.toString(),
      value: a,
    })
  }

  return reps;
}

/**
 * Get a list of message to say while a pot is being thrown;
 *
 * @param {number} time
 * @returns {{message: string, offset: number}[]}
 */
export const getDoingSayData = (time) => {
  const output = [
    {
      message: 'Use the whole of your first '
        + `${getCenteringTime(time)} for centering.`,
      offset: (time - 10000),
    },
    {
      message: 'You should be finishing centering and starting to '
        + 'open up.',
      offset: (Math.round(time * (2/3)) - 5000),
    },
    {
      message: 'You should be starting to pull up now.',
      offset: (Math.round(time / 2) - 5000),
    },
  ];

  if (time > 90000) {
    output.push({
      message: 'Remember to clean up your rim and remove excess '
        + 'water before you run out of time',
      offset: 2500,
    });
  }

  return output;
};

export const getHumanOption = (options, value) => {
  const tmp = options.find((option) => option.value === value);
  return (typeof tmp !== 'undefined')
    ? tmp.label
    : '';
};

export const getTypeLabel = (type) => type.substring(0,1).toUpperCase() + type.substring(1, (type.length - 1));

export const getTimerlabel = (type, count, total) => `${getTypeLabel(type)} number ${count} of ${total}`;

export const getWaitinglabel = (type, count) => `Waiting to start ${getTypeLabel(type)} number ${count}`;

export const getWaitingSayData = (type, time) => {
  const output = [];

  if (time > 60000) {
    output.push(
      {
        message: `You will be starting your next ${type} in 1 minute`,
        offset: 60000,
      },
    );
  }
  output.push(
    {
      message: `Get ready to start your next ${type} in twenty seconds`,
      offset: 23000,
    },
    {
      message: `Are you ready to start your next ${type}?`,
      offset: 4500,
    },
  );
  return output
};

export const getWrappingLabel = (label) => {
  const post = label.replace(/^.*?(?=[0-9]+ of [0-9]+$)/i, '');
  const pre = label.replace(post, '');
  return (pre.trim() !== '')
    ? html`${pre}<br />${post}`
    : label;
}

export const iWillBe = (who, reps, duration, intermission, type, timerOptions) => {
  const s = (reps > 1)
    ? 's'
    : '';

  const _type = type.replace(/s$/i, '');

  return html`
    <p>
      ${who} will be throwing <span class="i-will--count">${reps}</span>,
      <span class="i-will--time">${unsafeHTML(getHumanOption(timerOptions, duration))}</span>
      <span class="i-will--type">${_type}${s}</span>, with maximum of
      <span class="i-will--break">${unsafeHTML(getHumanOption(timerOptions, intermission))}s</span>
      break between each ${_type}.<br />
      Total session time will be
      <span class="i-will--total">${Math.ceil((duration * reps) + ((reps - 1) * intermission)) / 60000} minutes</span>,
      plus reviewing time.
    </p>
  `;
};

export const makeInt = (input) => {
  let tmp = input;
  if (typeof tmp === 'string') {
    tmp = parseInt(tmp, 10);
  }
  return (isNum(tmp))
    ? tmp
    : 0;
};


const withinTollerance = (actual, target, tollerance = 5) => {
  return (actual >= (target - tollerance) && (actual <= target + tollerance));
};
