import { Output } from './Output';
import { Suite } from './Suite';

export interface BenchmarkConfiguration {
  caseRunsCount: number;
}

export class Benchmark {
  static defaultConfiguration: BenchmarkConfiguration = {
    caseRunsCount: 1000,
  };

  private readonly configuration: BenchmarkConfiguration;

  constructor(
    public readonly suites: Suite[],
    configuration: Partial<BenchmarkConfiguration> = {},
    private readonly output: Output = new Output(),
  ) {
    this.configuration = {
      ...Benchmark.defaultConfiguration,
      ...configuration,
    };

    this.suites.forEach((suite) => suite.init(this.configuration));
  }

  private extract(): Promise<void[][][]> {
    return Promise.all(this.suites.map((suite) => suite.extract()));
  }

  public async run() {
    await this.extract();
    this.output.print(this);
  }
}
