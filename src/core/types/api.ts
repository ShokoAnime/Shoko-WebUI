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

export type SeriesInfoType = {
  name: string;
  id: number;
  filesize: number,
  size: number,
  paths: Array<string>,
};

type QueueItemType = {
  count?: number;
  state: string;
  isrunning?: boolean;
  ispause?: boolean;
};

export type QueueStatusType = {
  hasher: QueueItemType;
  general: QueueItemType;
  images: QueueItemType;
};
