
export type ApiLoginType = {
  user: string;
  pass: string;
  device: string;
};

export type GlobalAlertType = {
  type: 'error' | 'success';
  text: string;
};
