export class HttpClientError<TBody = unknown> extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: TBody;

  constructor(message: string, options: { status: number; url: string; body?: TBody }) {
    super(message);
    this.name = "HttpClientError";
    this.status = options.status;
    this.url = options.url;
    this.body = options.body;
  }
}
