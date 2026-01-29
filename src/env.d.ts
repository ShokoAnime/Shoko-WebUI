/// <reference types="vite/client" />
/* eslint-disable-next-line  @typescript-eslint/consistent-type-definitions */
interface ImportMetaEnv {
  readonly VITE_GITHASH: string;
  readonly VITE_APPVERSION: string;
  readonly VITE_MIN_SERVER_VERSION: string;
  // more env variables...
}
/* eslint-disable-next-line  @typescript-eslint/consistent-type-definitions */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
