# `<speed-throwing>` & `<talking-timer>`

## Copyright & License

The [`<speed-throwing>`](#speed-throwing) app including tutorial
content is copyright by [Evan Wills](https://github.com/evanwills)
2024. It is released under the
[Createive Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
license.

The [`<talking-timer>`](#talking-timer) &amp; `<time-display>` web components `<speed-throwing>` is built on top of, are released under the [MIT License](https://opensource.org/license/mit).


## `<talking-timer>`

`<talking-timer>` is a web component that counts down a specific time and announces intervals at user defined times.

Initially, I created it as to help me while teaching pottery. I also use it on a regular basis when poaching eggs. It also useful if you have a child that needs priming before they transition between tasks/activities.

In its default configuration, you give it a time limit, the start it. It will anounce 30 second intervals, the half way point 15 seconds to go then count down the last 10 seconds.

### Acuracy of anouncements

Because different numbers take different amounts of time to say, variations in talking speed of different voices and the time it takes to initialising each "utterances", You may find that the last 10 second count down is up to two seconds behind the actual timer by the end.

## `<speed-throwing>`

`<speed-throwing>` is a web component that utilises the features of [`<talking-timer>`](#talking-timer) to create a structured/guided speed throwing session.

See speed throwing in action at [CodePen](https://codepen.io/evanwills/live/KKjpBVQ)
