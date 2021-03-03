import type { BenchmarkConfiguration } from './Benchmark';
import { Result } from './Result';
import { perf } from './perf';

export class Case {
  public readonly result = new Result();

  public configuration!: BenchmarkConfiguration;

  constructor(
    public readonly name: string,
    public readonly fn: () => unknown,
  ) {}

  public init(configuration: BenchmarkConfiguration) {
    this.configuration = configuration;
  }

  public extract(): Promise<void[]> {
    return Promise.all(
      Array(this.configuration.caseRunsCount)
        .fill(this.fn)
        .map(
          (fn) =>
            new Promise<void>((resolve) => {
              const start = perf.now();
              fn();
              const end = perf.now() - start;

              this.result.push(end);
              resolve();
            }),
        ),
    );
  }
}
