import type { BenchmarkConfiguration } from './Benchmark';
import type { Output } from './Output';
import { Result } from './Result';
import { cooldown } from './cooldown';

const perf: Performance = process.env.IS_BROWSER_ENV
  ? window.performance
  : // eslint-disable-next-line global-require
    require('perf_hooks').performance;

interface ParsedFunction {
  body: string;
  // Needs for arrow functions with implicit return.
  isContainsReturn: boolean;
}

export class Case {
  private static runId = 0;

  private static nothing(arg: unknown): unknown {
    return arg;
  }

  private static parseFunctionBody(fn: () => unknown): ParsedFunction {
    const r = /^(function)?\s*\w*\s*\([\w\s,]*\)\s*(=>)?\s*(.*)$/mg
    let body = fn
      .toString()
      .replace(
        r,
        '$3',
      );

    if (body.charAt(0) === '{' && body.charAt(body.length - 1) === '}')
        body = body.substring(1, body.length - 2);

    const isContainsReturn = body.includes('return');

    return { body, isContainsReturn };
  }

  private static run(parsedFn: ParsedFunction): [number, unknown] {
      // eslint-disable-next-line no-eval
       const fn = eval(
        `( function _fn_name_${Case.runId}() { ${
          parsedFn.isContainsReturn ? parsedFn.body : `return ${parsedFn.body};`
        } } )`,
      ) as () => unknown;

      const start = perf.now();
      const r = fn();
      const end = perf.now() - start;

      Case.runId += 1;

      return [end, r];
  }

  public readonly result = new Result();

  public configuration!: BenchmarkConfiguration;

  private parsedFn: ParsedFunction;

  private output!: Output;

  constructor(public readonly name: string, public readonly fn: () => unknown) {
    this.parsedFn = Case.parseFunctionBody(this.fn);
  }

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
      if (this.configuration.runCooldown !== 'disabled')
        await cooldown(this.configuration.runCooldown);

      const [time, r] = Case.run(this.parsedFn);
      Case.nothing(r);
      this.result.push(time);
    }

    this.output.onCaseDone(this);
  }
}
