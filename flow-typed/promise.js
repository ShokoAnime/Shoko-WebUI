declare class Promise<+R> {
  constructor(callback: (
    resolve: (result: Promise<R> | R) => void,
    reject:  (error: any) => void
  ) => mixed): void;

  then<U>(
    onFulfill?: (value: R) => Promise<U> | U,
    onReject?: (error: any) => Promise<U> | U
  ): Promise<U>;

  catch<U>(
    onReject?: (error: any) => Promise<U> | U
  ): Promise<R | U>;

  finally<U>(U): void;

  static resolve<T>(object: Promise<T> | T): Promise<T>;
  static reject<T>(error?: any): Promise<T>;
  static all<T: Iterable<mixed>>(promises: T): Promise<$TupleMap<T, typeof $await>>;
  static race<T, Elem: Promise<T> | T>(promises: Array<Elem>): Promise<T>;
}