import type { Case } from './Case';
import { Logger } from './Logger';
import type { Suite } from './Suite';

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
    // eslint-disable-next-line no-nested-ternary
    const prefix = current > ref ? '+' : current < ref ? '-' : '';
    return `${prefix}${(Math.abs(current / ref - 1) * 100).toFixed(1)}%`;
  }

  constructor(private readonly logger: Logger = new ResolvedLogger()) {}

  public onCaseRun(testCase: Case): void {
    this.logger.message(`'${testCase.name}' case...`, {
      tab: 1,
      head: 'Running',
      headType: 'running',
    });
  }

  public onCaseCooldown(testCase: Case): void {
    this.logger.message(
      `for ${(testCase.configuration.caseCooldown / 1000).toFixed(2)}s`,
      {
        tab: 1,
        head: 'Cooldown',
      },
    );
  }

  public onCaseDone(testCase: Case): void {
    this.logger.message(
      `'${testCase.name}' case in ${(testCase.result.sum / 1000).toFixed(2)}s`,
      {
        tab: 1,
        head: 'Done',
        headType: 'done',
      },
    );
  }

  public onSuiteRun(suite: Suite): void {
    this.logger.message(`'${suite.name}' suite...`, {
      head: 'Running',
      headType: 'running',
    });
  }

  public onSuiteCooldown(suite: Suite): void {
    this.logger.message(
      `for ${(suite.configuration.suiteCooldown / 1000).toFixed(2)}s`,
      {
        head: 'Cooldown',
      },
    );
  }

  public onSuiteDone(suite: Suite): void {
    this.logger.message(`'${suite.name}' suite`, {
      head: 'Done',
      headType: 'done',
    });
  }

  public onResultsRunning() {
    this.logger.space();
    this.logger.space();
    this.logger.message('', { head: 'Results' });
  }

  public onBenckmarkDone(suites: Suite[]): void {
    suites.forEach((suite) => {
      this.logger.space();
      this.logger.message(`${suite.name}`, { bold: true });

      const { cases, fastestByMedian, fastestByOpsPerSec } = suite;
      const isFastestsSame = fastestByMedian === fastestByOpsPerSec;

      cases.forEach((testCase) => {
        this.logger.message(
          `${testCase.name}: ${Output.ms(
            testCase.result.median,
          )} (${Output.opsPerSec(
            testCase.result.opsPerSec,
          )}) (${Output.standardDeviation(testCase.result.standardDeviation)})${
            isFastestsSame
              ? ` (${Output.diff(
                  fastestByMedian.result.median,
                  testCase.result.median,
                )})`
              : ''
          }${
            !isFastestsSame
              ? ` (median: ${Output.diff(
                  fastestByMedian.result.median,
                  testCase.result.median,
                )} | ops/sec: ${Output.diff(
                  fastestByOpsPerSec.result.opsPerSec,
                  testCase.result.opsPerSec,
                )})`
              : ''
          }`,
          { tab: 1 },
        );
      });

      if (isFastestsSame) {
        this.logger.message(
          `'${fastestByMedian.name}' with ${Output.ms(
            fastestByMedian.result.median,
          )} (${Output.opsPerSec(fastestByMedian.result.opsPerSec)})`,
          { head: 'Fastest' },
        );
      } else {
        this.logger.message(
          `'${fastestByMedian.name}' with ${Output.ms(
            fastestByMedian.result.median,
          )}`,
          { head: 'Fastest by median ' },
        );
        this.logger.message(
          `'${fastestByOpsPerSec.name}' with ${Output.opsPerSec(
            fastestByOpsPerSec.result.opsPerSec,
          )}`,
          { head: 'Fastest by ops/sec' },
        );
      }
    });
  }
}
