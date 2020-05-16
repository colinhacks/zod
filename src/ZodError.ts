type ZodErrorArray = {
  path: (string | number)[];
  message: string;
}[];

export class ZodError extends Error {
  errors: ZodErrorArray = [];

  constructor() {
    super();
    // restore prototype chain
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);
  }

  static create = (errors: ZodErrorArray) => {
    const error = new ZodError();
    error.errors = errors;
    return error;
  };

  get message() {
    return this.errors
      .map(({ path, message }) => {
        return path.length ? `${path.join('.')}: ${message}` : `${message}`;
      })
      .join('\n');
  }

  get empty(): boolean {
    return this.errors.length === 0;
  }

  static fromString = (message: string) => {
    return ZodError.create([
      {
        path: [],
        message,
      },
    ]);
  };

  mergeChild = (pathElement: string | number, child: Error) => {
    if (child instanceof ZodError) {
      this.merge(child.bubbleUp(pathElement));
    } else {
      this.merge(ZodError.fromString(child.message).bubbleUp(pathElement));
    }
  };

  bubbleUp = (pathElement: string | number) => {
    return ZodError.create(
      this.errors.map(err => {
        return { path: [pathElement, ...err.path], message: err.message };
      }),
    );
  };

  addError = (path: string | number, message: string) => {
    this.errors = [...this.errors, { path: path === '' ? [] : [path], message }];
  };

  merge = (error: ZodError) => {
    this.errors = [...this.errors, ...error.errors];
  };
}
