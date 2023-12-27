export type SliceActions<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => infer A ? A : never;
}[keyof T];
