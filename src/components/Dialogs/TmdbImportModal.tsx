import { useState } from 'react';
import type { DragEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiFileDelimitedOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useTmdbImportXrefsMutation } from '@/core/react-query/tmdb/mutations';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

type Props = {
  show: boolean;
  onClose: () => void;
};

type ImportOptionKeyType = 'removeExisting' | 'addMissingMovies' | 'addMissingShows';

// Defaults match the server's defaults for the import endpoint.
const defaultOptions: Record<ImportOptionKeyType, boolean> = {
  removeExisting: true,
  addMissingMovies: true,
  addMissingShows: true,
};

const optionDetails: { key: ImportOptionKeyType, label: string, description: string }[] = [
  {
    key: 'removeExisting',
    label: 'Remove Existing',
    description:
      'Remove existing movie and episode links for any AniDB episode in the file that are not part of the file.',
  },
  {
    key: 'addMissingMovies',
    label: 'Add Missing Movies',
    description: 'Queue TMDB movies that are not downloaded yet for series in your collection.',
  },
  {
    key: 'addMissingShows',
    label: 'Add Missing Shows',
    description: 'Queue TMDB shows that are not downloaded yet for series in your collection.',
  },
];

const TmdbImportModal = ({ onClose, show }: Props) => {
  const { isPending, mutate: importXrefs } = useTmdbImportXrefsMutation();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useImmer(defaultOptions);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are supported.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isPending) return;
    selectFile(event.dataTransfer.files[0]);
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleImport = () => {
    if (!file || isPending) return;
    importXrefs({ file, ...options }, { onSuccess: onClose });
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', handleClose, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      onAfterOpen={() => {
        setFile(null);
        setIsDragging(false);
        setOptions(defaultOptions);
      }}
      size="sm"
      header="Import TMDB Cross-References"
      footer={
        <div className="flex justify-end gap-x-3">
          <Button buttonType="secondary" buttonSize="normal" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            onClick={handleImport}
            disabled={!file || isPending}
            loading={isPending}
          >
            Import
          </Button>
        </div>
      }
    >
      <div>
        Add AniDB to TMDB links from a CSV file exported by Shoko. Links you have verified are never downgraded to
        automatic links.
      </div>

      <div
        className={cx(
          'flex flex-col items-center justify-center gap-y-3 rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging ? 'border-panel-text-primary bg-panel-background-overlay' : 'border-panel-border',
          file && 'border-solid',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Icon path={mdiFileDelimitedOutline} size={2} className="text-panel-text-primary" />
        {file
          ? (
            <div className="text-center font-semibold break-all">
              {file.name} — {prettyBytes(file.size)}
            </div>
          )
          : <div className="font-semibold">Drag &amp; drop a CSV file here</div>}

        <label
          className={cx(
            'rounded-lg font-semibold transition-colors',
            buttonTypeClasses.primary,
            buttonSizeClasses.small,
            isPending ? 'cursor-default opacity-65' : 'cursor-pointer hover:bg-button-primary-hover',
          )}
        >
          {file ? 'Change File' : 'Browse'}
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={isPending}
            onChange={event => selectFile(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Options</div>
        {optionDetails.map(({ description, key, label }) => (
          <div key={key} className="flex flex-col gap-y-1">
            <Checkbox
              justify
              id={`tmdb-import-${key}`}
              label={label}
              isChecked={options[key]}
              disabled={isPending}
              onChange={event =>
                setOptions((draft) => {
                  draft[key] = event.target.checked;
                })}
            />
            <div
              className={cx('text-xs', key === 'removeExisting' ? 'text-panel-text-danger' : 'opacity-65')}
            >
              {description}
            </div>
          </div>
        ))}
      </div>
    </ModalPanel>
  );
};

export default TmdbImportModal;
