export interface LogOptions {
  tab: number;
  head?: string;
  headType?: 'neutral' | 'success';
}

export abstract class Logger {
  private static findMaxStringLength(strs: string[]): number {
    return strs.reduce((acc, str) => (str.length > acc ? str.length : acc), 0);
  }

  private static getTableColumnWidths(rows: string[][]): number[] {
    const firstRow = rows[0]!;
    const result: number[] = [];

    for (let i = 0; i < firstRow.length; i += 1) {
      const maxColumnStringLength = Logger.findMaxStringLength(
        rows.map((row) => row[i]!),
      );
      result.push(maxColumnStringLength);
    }

    return result;
  }

  private static toFixedStringLength(str: string, length: number): string {
    let result = '';

    for (let i = 0; i < length; i += 1) {
      result = `${result}${str[i] || ' '}`;
    }

    return result;
  }

  constructor(protected readonly out: typeof console = console) {}

  abstract message(text: string | null, options?: Partial<LogOptions>): void;

  space(size: number = 1): void {
    Array(size)
      .fill('')
      .map((_, index) => Array(index).fill(' ').join())
      .forEach((s) => {
        this.message(s);
      });
  }

  table(rows: string[][]): void {
    const columnWidths = Logger.getTableColumnWidths(rows);

    rows.forEach((row) => {
      const rowString = row.reduce(
        (acc, cell, cellIndex) =>
          `${acc} ${Logger.toFixedStringLength(
            cell,
            columnWidths[cellIndex]!,
          )}`,
        '',
      );

      this.message(rowString);
    });
  }
}
