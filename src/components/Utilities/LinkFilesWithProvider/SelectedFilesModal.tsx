import { useHotkeys } from 'react-hotkeys-hook';

import ModalPanel from '@/components/Panels/ModalPanel';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { extractFileNameFromPath } from '@/core/util';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { FileType } from '@/core/types/api/file';

type Props = {
  files: FileType[];
  show: boolean;
  onClose: () => void;
};

const SelectedFilesModal = ({ files, onClose, show }: Props) => {
  useToggleModalKeybinds(show, 'nested-modal');
  useHotkeys('escape', onClose, { scopes: 'nested-modal' });

  const managedFoldersQuery = useManagedFoldersQuery();

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="Selected Files"
      size="md"
      overlayClassName="!z-[90]"
      className="h-120"
    >
      <div className="flex flex-col gap-y-2 overflow-y-auto">
        {files.map((file) => {
          const location = file.Locations[0];
          const path = location?.RelativePath ?? '';
          const { fileName, relativePath } = extractFileNameFromPath(path);
          const folderName = managedFoldersQuery.data?.find(
            folder => folder.ID === location?.ManagedFolderID,
          )?.Name ?? '';

          return (
            <div
              key={`selected-file-${file.ID}`}
              className="mr-2 flex flex-col gap-1 rounded-lg border border-panel-border bg-panel-background-alt p-3"
              data-tooltip-id="tooltip"
              data-tooltip-content={path}
              data-tooltip-delay-show={200}
            >
              <span className="line-clamp-1 truncate text-xs font-semibold opacity-65">
                {folderName}
                &nbsp;-&nbsp;
                {relativePath}
              </span>
              <span className="line-clamp-1 truncate text-sm">{fileName ?? `<missing file path for ${file.ID}>`}</span>
            </div>
          );
        })}
      </div>
    </ModalPanel>
  );
};

export default SelectedFilesModal;
