import chalk, { BackgroundColor } from 'chalk';

import { LogOptions, Logger } from './Logger';

export class NodeLogger extends Logger {
  private static head(
    text: Exclude<LogOptions['head'], undefined>,
    type: Exclude<LogOptions['headType'], undefined>,
  ): string {
    const bg: Record<typeof type, typeof BackgroundColor> = {
      neutral: 'bgWhite',
      running: 'bgCyan',
      done: 'bgGreen',
    };

    return `${chalk.black[bg[type]].bold(` ${text} `)} `;
  }

  public message(text: string, options: Partial<LogOptions> = {}) {
    const { tab, bold, head, headType } = {
      ...NodeLogger.defaultLogOptions,
      ...options,
    };

    this.out.log(
      `${NodeLogger.tab(tab)}${
        head ? NodeLogger.head(head, headType ?? 'neutral') : ''
      }${bold ? chalk.bold(text) : text}`,
    );
  }
}
