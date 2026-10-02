import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useExportMetadataCrossReferencesMutation } from '@/core/react-query/metadata/mutations';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { MetadataCrossReferenceSectionType } from '@/core/react-query/metadata/types';
import type { IncludeOnlyFilterType } from '@/core/react-query/types';

type Props = {
  show: boolean;
  onClose: () => void;
  /** The source, as routes take it. */
  source: string;
  sourceName: string;
};

type AnidbFilterKeyType = 'AnidbAnimeID' | 'AnidbEpisodeID';
type SourceFilterKeyType = 'SeriesID' | 'EpisodeID' | 'MovieID';
type FilterKeyType = AnidbFilterKeyType | SourceFilterKeyType;

const sections: { label: string, value: MetadataCrossReferenceSectionType }[] = [
  { label: 'Movie Links', value: 'Movie' },
  { label: 'Series Links', value: 'Series' },
  { label: 'Episode Links', value: 'Episode' },
];

const anidbFilters: { label: string, value: AnidbFilterKeyType }[] = [
  { label: 'AniDB Anime ID', value: 'AnidbAnimeID' },
  { label: 'AniDB Episode ID', value: 'AnidbEpisodeID' },
];

// The source's own IDs are text, as a source may use any form of ID.
const sourceFilters: { label: string, value: SourceFilterKeyType }[] = [
  { label: 'Series ID', value: 'SeriesID' },
  { label: 'Episode ID', value: 'EpisodeID' },
  { label: 'Movie ID', value: 'MovieID' },
];

type ExportOptionsType = {
  Sections: MetadataCrossReferenceSectionType[];
  Automatic: IncludeOnlyFilterType;
  WithEpisodes: IncludeOnlyFilterType;
  IncludeComments: boolean;
  filters: Record<FilterKeyType, string>;
};

const defaultOptions: ExportOptionsType = {
  Sections: ['Movie', 'Series', 'Episode'],
  Automatic: 'true',
  WithEpisodes: 'true',
  IncludeComments: true,
  filters: {
    AnidbAnimeID: '',
    AnidbEpisodeID: '',
    SeriesID: '',
    EpisodeID: '',
    MovieID: '',
  },
};

const MetadataExportModal = ({ onClose, show, source, sourceName }: Props) => {
  const { isPending, mutate: exportXrefs } = useExportMetadataCrossReferencesMutation(source, sourceName);

  const [options, setOptions] = useImmer(defaultOptions);

  useEffect(() => {
    if (!show) setOptions(defaultOptions);
  }, [setOptions, show]);

  const canExport = options.Sections.length > 0 && !isPending;

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSectionToggle = (section: MetadataCrossReferenceSectionType, checked: boolean) => {
    setOptions((draft) => {
      const next = checked
        ? [...draft.Sections, section]
        : draft.Sections.filter(value => value !== section);
      draft.Sections = sections.map(({ value }) => value).filter(value => next.includes(value));
    });
  };

  const handleExport = () => {
    if (!canExport) return;
    exportXrefs({
      Sections: options.Sections,
      Automatic: options.Automatic,
      WithEpisodes: options.WithEpisodes,
      IncludeComments: options.IncludeComments,
      ...Object.fromEntries(
        anidbFilters
          .filter(({ value }) => options.filters[value] !== '')
          .map(({ value }) => [value, Number(options.filters[value])]),
      ),
      ...Object.fromEntries(
        sourceFilters
          .filter(({ value }) => options.filters[value].trim() !== '')
          .map(({ value }) => [value, options.filters[value].trim()]),
      ),
    }, {
      onSuccess: ({ isEmpty }) => {
        if (!isEmpty) onClose();
      },
    });
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', handleClose, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      size="sm"
      header={`Export ${sourceName} Cross-References`}
      footer={
        <div className="flex justify-end gap-x-3">
          <Button buttonType="secondary" buttonSize="normal" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            onClick={handleExport}
            disabled={!canExport}
            loading={isPending}
          >
            Export
          </Button>
        </div>
      }
    >
      <div>
        Download your AniDB to {sourceName}{' '}
        links as a CSV file. The file can be imported again later, or into another Shoko Server.
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Sections</div>
        <div className="flex flex-col rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {sections.map(({ label, value }) => (
            <Checkbox
              key={value}
              id={`metadata-export-section-${value}`}
              label={label}
              labelRight
              isChecked={options.Sections.includes(value)}
              onChange={event => handleSectionToggle(value, event.target.checked)}
            />
          ))}
        </div>
        {options.Sections.length === 0 && (
          <div className="text-xs text-panel-text-danger">Select at least one section to export.</div>
        )}
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Options</div>
        <div className="flex flex-col gap-y-1">
          <SelectSmall
            id="metadata-export-automatic"
            label="Automatic Links"
            value={options.Automatic}
            onChange={event =>
              setOptions((draft) => {
                draft.Automatic = event.target.value as IncludeOnlyFilterType;
              })}
          >
            <option value="true">Include All</option>
            <option value="false">User Verified Only</option>
            <option value="only">Automatic Only</option>
          </SelectSmall>
          <div className="text-xs opacity-65">
            Automatic links are links made by Shoko that have not been verified by a user.
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <SelectSmall
            id="metadata-export-with-episodes"
            label="Episode Mapping"
            value={options.WithEpisodes}
            onChange={event =>
              setOptions((draft) => {
                draft.WithEpisodes = event.target.value as IncludeOnlyFilterType;
              })}
          >
            <option value="true">Include All</option>
            <option value="false">Unmapped Only</option>
            <option value="only">Mapped Only</option>
          </SelectSmall>
          <div className="text-xs opacity-65">
            Filters series and episode links by whether they are mapped to an episode. Movie links are not affected.
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            id="metadata-export-include-comments"
            label="Include Comments"
            isChecked={options.IncludeComments}
            onChange={event =>
              setOptions((draft) => {
                draft.IncludeComments = event.target.checked;
              })}
          />
          <div className="text-xs opacity-65">
            Adds the titles above each link to make the file easier to read. Comments are ignored when importing.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <span className="font-semibold">Filters</span>
          <span className="text-xs opacity-65">(Optional)</span>
        </div>
        <div className="text-xs opacity-65">
          Only export links matching all of the given IDs. Each ID only filters the sections that contain it.
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {anidbFilters.map(({ label, value }) => (
            <div key={value} className="flex items-center justify-between">
              {label}
              <InputSmall
                id={`metadata-export-filter-${value}`}
                type="number"
                min={1}
                value={options.filters[value]}
                onChange={event =>
                  setOptions((draft) => {
                    draft.filters[value] = event.target.value;
                  })}
                className="w-24 px-3 py-1"
              />
            </div>
          ))}
          {sourceFilters.map(({ label, value }) => (
            <div key={value} className="flex items-center justify-between">
              {`${sourceName} ${label}`}
              <InputSmall
                id={`metadata-export-filter-${value}`}
                type="text"
                value={options.filters[value]}
                onChange={event =>
                  setOptions((draft) => {
                    draft.filters[value] = event.target.value;
                  })}
                className="w-24 px-3 py-1"
              />
            </div>
          ))}
        </div>
      </div>
    </ModalPanel>
  );
};

export default MetadataExportModal;
