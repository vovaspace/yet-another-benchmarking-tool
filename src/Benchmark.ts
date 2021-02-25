import { Output } from './Output';
import { Suite } from './Suite';
import { cooldown } from './cooldown';

export interface BenchmarkConfiguration {
  caseRunsCount: number;
  suiteCooldown: number | 'disabled';
  caseCooldown: number | 'disabled';
  runCooldown: number | 'disabled';
}

export class Benchmark {
  static defaultConfiguration: BenchmarkConfiguration = {
    caseRunsCount: 10_000,
    suiteCooldown: 2_000,
    caseCooldown: 8_000,
    runCooldown: 0,
  };

  public readonly configuration: BenchmarkConfiguration;

  constructor(
    private readonly suites: Suite[],
    configuration: Partial<BenchmarkConfiguration> = {},
    private readonly output: Output = new Output(),
  ) {
    this.configuration = {
      ...Benchmark.defaultConfiguration,
      ...configuration,
    };

    this.suites.forEach((suite) => suite.init(this.configuration, this.output));
  }

  public async run() {
    for await (const [index, suite] of this.suites.entries()) {
      await suite.run();

      if (this.configuration.suiteCooldown !== 'disabled') {
        if (index < this.suites.length - 1) {
          this.output.onSuiteCooldown(suite);
          await cooldown(this.configuration.suiteCooldown);
        }
      }
    }

    this.output.onResultsRunning();
    this.output.onBenckmarkDone(this.suites);
  }
}
