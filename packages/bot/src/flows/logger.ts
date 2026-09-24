export enum FlowLoggerMessageStatus {
  Info = 0,
  Ok = 1,
  Error = 2,
}

const statusEmoji: Record<FlowLoggerMessageStatus, string> = {
  // dev
  // [FlowLoggerMessageStatus.Ok]: "834927244500533258",
  // [FlowLoggerMessageStatus.Error]: "834927293633527839",
  // [FlowLoggerMessageStatus.Info]: "1253688417275871302",
  // prod
  [FlowLoggerMessageStatus.Ok]: "1263857933209571329",
  [FlowLoggerMessageStatus.Error]: "1263857948086505482",
  [FlowLoggerMessageStatus.Info]: "1263857962892660786",
};

export class FlowLogger {
  public messages: FlowLoggerMessage[] = [];

  constructor(
    public recursion = 0,
    public parent?: FlowLogger,
  ) {
    this.messages = [];
  }

  add(message: string, status?: FlowLoggerMessageStatus): void;
  add(message: FlowLoggerMessage): void;
  add(
    message: string | FlowLoggerMessage,
    status = FlowLoggerMessageStatus.Info,
  ): void {
    const msg =
      typeof message === "string"
        ? new FlowLoggerMessage(status, message, this.recursion)
        : message;

    if (this.parent) this.parent.add(msg);
    else this.messages.push(msg);
  }

  level(recursion: number) {
    return new FlowLogger(recursion, this);
  }
}

export class FlowLoggerMessage {
  constructor(
    public status: FlowLoggerMessageStatus,
    public message: string,
    public recursionLevel: number,
  ) {}

  toString() {
    const emojiId = statusEmoji[this.status];
    const emoji = `<:_:${emojiId}>`;
    if (this.recursionLevel === 0) {
      return `${emoji} ${this.message}`;
    }
    return `${emoji} [${this.recursionLevel}] ${this.message}`;
  }
}
