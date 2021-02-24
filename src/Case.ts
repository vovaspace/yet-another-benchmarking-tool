import type { BenchmarkConfiguration } from './Benchmark';
import type { Output } from './Output';
import { Result } from './Result';
import { cooldown } from './cooldown';

const perf: Performance = process.env.IS_BROWSER_ENV
  ? window.performance
  : // eslint-disable-next-line global-require
    require('perf_hooks').performance;

export class Case {
  static run(fn: () => unknown): Promise<[number, unknown]> {
    return new Promise((resolve) => {
      const start = perf.now();
      const r = fn();
      const end = perf.now() - start;
      resolve([end, r]);
    });
  }

  public readonly result = new Result();

  public configuration!: BenchmarkConfiguration;

  private output!: Output;

  constructor(
    public readonly name: string,
    public readonly fn: () => unknown,
  ) {}

  public init(configuration: BenchmarkConfiguration, output: Output) {
    this.configuration = configuration;
    this.output = output;
  }

  public async run(): Promise<void> {
    this.result.clear();
    this.output.onCaseRun(this);

    const runs = Array<null>(this.configuration.caseRunsCount).fill(null);

    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
    for await (const _i of runs) {
      const result = await Case.run(this.fn);
      this.result.push(result[0]);
      await cooldown(this.configuration.runCooldown);
    }

    this.output.onCaseDone(this);
  }
}
