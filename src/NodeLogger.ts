import chalk, { BackgroundColor } from 'chalk';

import { LogOptions, Logger } from './Logger';

export class NodeLogger extends Logger {
  private static head(
    text: Exclude<LogOptions['head'], undefined>,
    type: Exclude<LogOptions['headType'], undefined>,
  ): string {
    const bg: Record<typeof type, typeof BackgroundColor> = {
      neutral: 'bgWhite',
      success: 'bgGreen',
    };

    return `${chalk.black[bg[type]].bold(` ${text} `)} `;
  }

  public message(text: string | null, options: Partial<LogOptions> = {}) {
    const { head, headType } = options;

    this.out.log(
      `${head ? NodeLogger.head(head, headType ?? 'neutral') : ''}${
        text ?? ''
      }`,
    );
  }
}
