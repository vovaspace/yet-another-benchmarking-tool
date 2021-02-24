import type { BenchmarkConfiguration } from './Benchmark';
import { Case } from './Case';
import type { Output } from './Output';
import { cooldown } from './cooldown';

export class Suite {
  public readonly cases: Case[];

  private cache: Partial<{
    time: number;
    fastestByMedian: Case;
    fastestByOpsPerSec: Case;
  }> = {};

  public configuration!: BenchmarkConfiguration;

  private output!: Output;

  constructor(
    public readonly name: string,
    cases: [name: string, fn: () => unknown][],
  ) {
    this.cases = cases.map(([caseName, fn]) => new Case(caseName, fn));
  }

  public init(configuration: BenchmarkConfiguration, output: Output) {
    this.configuration = configuration;
    this.output = output;

    this.cases.forEach((testCase) =>
      testCase.init(this.configuration, this.output),
    );
  }

  public async run(): Promise<void> {
    this.cache = {};
    this.output.onSuiteRun(this);

    for await (const testCase of this.cases) {
      this.output.onCaseCooldown(testCase);
      await cooldown(this.configuration.caseCooldown);
      await testCase.run();
    }

    this.output.onSuiteDone(this);
  }

  public get time(): number {
    if (this.cache.time === undefined)
      this.cache.time = this.cases.reduce(
        (acc, testCase) => acc + testCase.result.sum,
        0,
      );

    return this.cache.time;
  }

  public get fastestByMedian(): Case {
    if (this.cache.fastestByMedian === undefined)
      this.cache.fastestByMedian = this.cases.reduce<Case>(
        (acc, testCase) =>
          testCase.result.median < acc.result.median ? testCase : acc,
        this.cases[0]!,
      );

    return this.cache.fastestByMedian;
  }

  public get fastestByOpsPerSec(): Case {
    if (this.cache.fastestByOpsPerSec === undefined)
      this.cache.fastestByOpsPerSec = this.cases.reduce<Case>(
        (acc, testCase) =>
          testCase.result.opsPerSec > acc.result.opsPerSec ? testCase : acc,
        this.cases[0]!,
      );

    return this.cache.fastestByOpsPerSec;
  }
}
