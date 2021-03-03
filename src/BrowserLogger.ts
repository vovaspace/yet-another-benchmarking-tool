import { LogOptions, Logger } from './Logger';

export class BrowserLogger extends Logger {
  private static head(
    text: Exclude<LogOptions['head'], undefined>,
    type: Exclude<LogOptions['headType'], undefined>,
  ): [string, string] {
    const bg: Record<typeof type, string> = {
      neutral: 'color: black; background-color: white; font-weight: bold;',
      success: 'color: black; background-color: chartreuse; font-weight: bold;',
    };

    return [`%c ${text} %c `, `${bg[type]}`];
  }

  public message(text: string | null, options: Partial<LogOptions> = {}) {
    const { head, headType } = options;

    const [headString, headStyles] = head
      ? BrowserLogger.head(head, headType ?? 'neutral')
      : ['%c%c', ''];

    this.out.log(`${headString}${text ?? ''}`, headStyles, '');
  }
}
