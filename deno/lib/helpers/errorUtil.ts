export namespace errorUtil {
  export type ErrOptions<T extends Object | void = void> = T extends void ?
      { message?: string, fatal?: boolean } :
      { [K in keyof ({ message?: string, fatal?: boolean } & T)]: ({ message?: string, fatal?: boolean } & T)[K]};
  export type ErrMessageOrOptions<T extends Object | void = void> =
    | string
    | ErrOptions<T>;
  export const normalize = (options?: ErrMessageOrOptions): ErrOptions =>
    typeof options === "string" ? { message: options } : options ?? {};
}
