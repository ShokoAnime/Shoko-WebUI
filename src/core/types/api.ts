export type ApiSessionState = {
  apikey: string;
  username: string;
  rememberUser: boolean;
  version: string;
};

export type PaginationType = {
  pageSize?: number;
  page?: number;
};

export type ListResultType<T> = {
  Total: number;
  List: T[];
};

export type TraktCodeType = {
  usercode: string;
  url: string;
};

export type ShokoError = {
  errors: Record<string, string[]>;
  status: number;
  title: string;
};
