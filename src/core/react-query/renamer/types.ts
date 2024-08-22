import type {
  RenamerConfigBaseType,
  RenamerConfigSettingsType,
  RenamerSettingsType,
  RenamerType,
} from '@/core/types/api/renamer';
import type { Operation } from 'fast-json-patch';

export type RenamerResponseType = RenamerType & {
  Settings?: RenamerSettingsType[];
};

export type RenamerConfigResponseType = RenamerConfigBaseType & {
  Settings?: RenamerConfigSettingsType[];
};

export type RenamerRelocateBaseRequestType = {
  move?: boolean;
  rename?: boolean;
  FileIDs: number[];
};

export type RenamerPreviewRequestType = RenamerRelocateBaseRequestType & {
  Config: RenamerConfigResponseType;
};

export type RenamerRelocateRequestType = RenamerRelocateBaseRequestType & {
  configName: string;
  deleteEmptyDirectories?: boolean;
};

export type RenamerPatchRequestType = {
  configName: string;
  operations: Operation[];
};
