export interface LogOptions {
  tab: number;
  bold?: boolean;
  head?: string;
  headType?: 'neutral' | 'running' | 'done';
}

export abstract class Logger {
  public static defaultLogOptions: LogOptions = {
    tab: 0,
  };

  protected static tab(size: number): string {
    return Array(size)
      .fill('  ')
      .reduce((acc, space) => `${acc}${space}`, '');
  }

  constructor(protected readonly out: typeof console = console) {}

  abstract message(text: string, options?: Partial<LogOptions>): void;

  public space(size: number = 1): void {
    Array(size)
      .fill(null)
      .forEach(() => this.out.log(''));
  }
}
