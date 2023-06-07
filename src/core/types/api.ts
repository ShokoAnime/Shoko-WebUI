export type ApiLoginType = {
  user: string;
  pass: string;
  device: string;
  rememberUser: boolean;
};

export type ApiSessionState = {
  apikey: string;
  username: string;
  rememberUser: boolean;
};

export type GlobalAlertType = {
  type: 'error' | 'success';
  text: string;
};

export type PaginationType = {
  pageSize?: number;
  page?: number;
};

export type ListResultType<T> = {
  Total: number;
  List: T;
};

export type TraktCodeType = {
  usercode: string;
  url: string;
};

export type WebUIVersionType = {
  name: string;
  version: string;
};

export type InfiniteResultType<T> = {
  pages: Record<number, T>;
  total: number;
};
