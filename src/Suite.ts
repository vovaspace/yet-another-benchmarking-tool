import type { BenchmarkConfiguration } from './Benchmark';
import { Case } from './Case';

export class Suite {
  public readonly cases: Case[];

  private cache: Partial<{
    time: number;
    fastest: Case;
  }> = {};

  constructor(
    public readonly name: string,
    cases: [name: string, fn: () => unknown][],
    private configuration: null | BenchmarkConfiguration = null,
  ) {
    this.cases = cases.map(([caseName, fn]) => new Case(caseName, fn));
  }

  public init(configuration: BenchmarkConfiguration) {
    this.configuration = this.configuration ?? configuration;
    this.cases.forEach((testCase) => testCase.init(this.configuration!));
  }

  public extract(): Promise<void[][]> {
    return Promise.all(this.cases.map((testCase) => testCase.extract()));
  }

  public get fastest(): Case {
    if (this.cache.fastest === undefined)
      this.cache.fastest = this.cases.reduce<Case>(
        (acc, testCase) =>
          testCase.result.median < acc.result.median ? testCase : acc,
        this.cases[0]!,
      );

    return this.cache.fastest;
  }
}
