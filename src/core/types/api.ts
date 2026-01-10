export type ApiSessionState = {
  apikey: string;
  username: string;
  rememberUser: boolean;
  version: string;
};

export type GlobalAlertType = {
  type: 'error' | 'success';
  text: string;
};

export type PaginationType = {
  pageSize?: number;
  page?: number;
};

export type DashboardPaginationType = PaginationType & {
  includeRestricted: boolean;
  onlyUnwatched?: boolean;
};

export type ListResultType<T> = {
  Total: number;
  List: T[];
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
  pages: Record<number, T[]>;
  total: number;
};

export type ShokoError = {
  errors: Record<string, string[]>;
  status: number;
  title: string;
};
