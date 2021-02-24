# Yet Another Benchmarking Tool

A `Benchmark` is a set of `Suites` which are sets of `Cases`.

When running a `Benchmark`, each `Case` is run several times.

`Yet Another Benchmarking Tool` uses `window.performance.now` for browser or `perf_hooks.performance.now` for node to measure performance.

## Installation

Using NPM:

```bash
npm install yet-another-benchmarking-tool
```

Using Yarn:

```bash
yarn add yet-another-benchmarking-tool
```

## Running

First, import `Yet Another Benchmarking Tool`'s main classes:

```js
import { Benchmark, Suite } from 'yet-another-benchmarking-tool';
```

Second, configure a suite:

```js
const suite = new Suite("Checking for 'o' letter", [
  ['RegExp.test', () => /o/.test('Hello World!')],
  ['String.indexOf', () => 'Hello World!'.indexOf('o') > -1],
]);
```

Then, create a benchmark:

```js
const benchmark = new Benchmark([suite], {
  caseRunsCount: 10_000,
  suiteCooldown: 8_000,
  caseCooldown: 2_000,
  runCooldown: 0,
});
```

And run:

```js
benchmark.run();
```

# Output

![output example](./output.jpg)
