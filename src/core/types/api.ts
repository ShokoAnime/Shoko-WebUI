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
  type: string,
};

export type QueueItemType = {
  state: number;
  description: string;
};

export type QueueStatusType = {
  HasherQueueState: QueueItemType;
  GeneralQueueState: QueueItemType;
  ImageQueueState: QueueItemType;
  HasherQueueCount: number;
  GeneralQueueCount: number;
  ImageQueueCount: number;
};
