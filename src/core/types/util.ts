export type SliceActions<T> = {
  [Key in keyof T]: T[Key] extends (...args: never[]) => infer Action ? Action : never;
}[keyof T];
