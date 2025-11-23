import { addRenameResults, updateFiles } from '@/core/slices/utilities/renamer';
import store from '@/core/store';

import type { BaseRelocateFilesRequestType } from '@/core/react-query/renamer/types';
import type { RelocationResultType } from '@/core/types/api/renamer';

export const updateResults = (response: RelocationResultType[]) => {
  const mappedResults = response.reduce(
    (result, preview) => (
      {
        ...result,
        [preview.FileID]: preview,
      }
    ),
    {} as Record<number, RelocationResultType>,
  );
  store.dispatch(addRenameResults(mappedResults));

  // Check if called from preview or relocate endpoint
  // If one of them is a preview, then all are previews
  // It is not possible to have mixed previews and final results
  if (!response[0].IsPreview) store.dispatch(updateFiles(response));
};

export const updateApiErrors = (err: Error, args: BaseRelocateFilesRequestType) => {
  const mappedResults = args.fileIDs.reduce(
    (result, fileId) => (
      {
        ...result,
        [fileId]: {
          IsSuccess: false,
          IsPreview: undefined,
          FileID: fileId,
          ErrorMessage: 'Web UI Error; ' + err.message,
        } as RelocationResultType,
      }
    ),
    {} as Record<number, RelocationResultType>,
  );

  store.dispatch(addRenameResults(mappedResults));
};
