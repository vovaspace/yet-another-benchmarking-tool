import type { Benchmark } from './Benchmark';
import { Logger } from './Logger';

const ResolvedLogger: new () => Logger = process.env.IS_BROWSER_ENV
  ? require('./BrowserLogger').BrowserLogger
  : require('./NodeLogger').NodeLogger;

export class Output {
  private static ms(num: number): string {
    return `${num.toFixed(8)}ms`;
  }

  private static opsPerSec(num: number): string {
    return `${Math.floor(num)} ops/sec`;
  }

  private static standardDeviation(num: number): string {
    return `σ ${num.toFixed(4)}`;
  }

  private static diff(ref: number, current: number) {
    return `+${((current / ref - 1) * 100).toFixed(1)}%`;
  }

  constructor(private readonly logger: Logger = new ResolvedLogger()) {}

  public print(benchmark: Benchmark): void {
    benchmark.suites.forEach((suite, index) => {
      this.logger.message(null, { head: suite.name });
      this.logger.space();

      const { cases, fastest } = suite;

      const table = cases.map((testCase) => [
        `${testCase.name}:`,
        Output.ms(testCase.result.median),
        `(${Output.opsPerSec(testCase.result.opsPerSec)})`,
        `(${Output.standardDeviation(testCase.result.standardDeviation)})`,
        fastest === testCase
          ? ''
          : `(${Output.diff(fastest.result.median, testCase.result.median)})`,
      ]);

      this.logger.table(table);
      this.logger.space();

      this.logger.message(
        `'${fastest.name}' with ${Output.ms(
          fastest.result.median,
        )} (${Output.opsPerSec(fastest.result.opsPerSec)})`,
        { head: 'Fastest:', headType: 'success' },
      );

      if (index < benchmark.suites.length - 1) {
        this.logger.space(2);
      }
    });
  }
}
