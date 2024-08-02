import { addRenameResults, updateFiles } from '@/core/slices/utilities/renamer';
import store from '@/core/store';

import type {
  RenamerConfigResponseType,
  RenamerConfigSettingsType,
  RenamerConfigType,
  RenamerResponseType,
  RenamerResultType,
  RenamerSettingsType,
  RenamerType,
} from '@/core/react-query/renamer/types';

export const updateResults = (response: RenamerResultType[]) => {
  const mappedResults = response.reduce(
    (result, preview) => (
      {
        ...result,
        [preview.FileID]: preview,
      }
    ),
    {} as Record<number, RenamerResultType>,
  );
  store.dispatch(addRenameResults(mappedResults));

  // Check if called from preview or relocate endpoint
  // If one of them is a preview, then all are previews
  // It is not possible to have mixed previews and final results
  if (!response[0].IsPreview) store.dispatch(updateFiles(response));
};

export const transformRenamerConfigs = (response: RenamerConfigResponseType[]): RenamerConfigType[] =>
  response.map((config) => {
    if (!config.Settings) return config as RenamerConfigType;

    const settings = config.Settings.reduce(
      (result, setting) => (
        {
          ...result,
          [setting.Name]: setting,
        }
      ),
      {} as Record<string, RenamerConfigSettingsType>,
    );

    return {
      ...config,
      Settings: settings,
    } as RenamerConfigType;
  });

export const transformRenamer = (response: RenamerResponseType): RenamerType => {
  if (!response.Settings) return response as RenamerType;

  const settings = response.Settings.reduce(
    (result, setting) => (
      {
        ...result,
        [setting.Name]: setting,
      }
    ),
    {} as Record<string, RenamerSettingsType>,
  );

  return {
    ...response,
    Settings: settings,
  };
};
