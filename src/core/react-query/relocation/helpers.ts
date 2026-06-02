import { addResults, updateFiles } from '@/core/slices/utilities/renamer';
import store from '@/core/store';

import type { RelocationBaseRequestType } from '@/core/react-query/relocation/types';
import type { RelocationResultType } from '@/core/types/api/relocation';

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
  store.dispatch(addResults(mappedResults));

  // Check if called from preview or relocate endpoint
  // If one of them is a preview, then all are previews
  // It is not possible to have mixed previews and final results
  if (!response[0].IsPreview) store.dispatch(updateFiles(response));
};

export const updateApiErrors = (_: Error, args: RelocationBaseRequestType) => {
  const mappedResults = args.FileIDs.reduce(
    (result, fileId) => (
      {
        ...result,
        [fileId]: {
          FileID: fileId,
          ErrorMessage: 'Error! Check server logs for more details.',
        } as RelocationResultType,
      }
    ),
    {} as Record<number, RelocationResultType>,
  );

  store.dispatch(addResults(mappedResults));
};
