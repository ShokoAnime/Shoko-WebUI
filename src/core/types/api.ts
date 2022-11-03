export type ApiLoginType = {
  user: string;
  pass: string;
  device: string;
};

export type ApiSessionState = {
  apikey: string;
  username: string;
  userid: number;
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
