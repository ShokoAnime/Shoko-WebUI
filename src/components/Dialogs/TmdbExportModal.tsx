import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useTmdbExportXrefsMutation } from '@/core/react-query/tmdb/mutations';
import toast from '@/core/toast';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { TmdbCrossReferenceSectionType } from '@/core/react-query/tmdb/types';
import type { IncludeOnlyFilterType } from '@/core/react-query/types';

type Props = {
  show: boolean;
  onClose: () => void;
};

type FilterKeyType = 'AnidbAnimeID' | 'AnidbEpisodeID' | 'TmdbMovieID' | 'TmdbShowID' | 'TmdbEpisodeID';

const sections: { label: string, value: TmdbCrossReferenceSectionType }[] = [
  { label: 'Movie Links', value: 'Movie' },
  { label: 'Show Links', value: 'Show' },
  { label: 'Episode Links', value: 'Episode' },
];

// A TMDB episode ID of 0 is how unmapped AniDB episodes are stored, so it is a valid filter.
const filters: { label: string, value: FilterKeyType, min: number }[] = [
  { label: 'AniDB Anime ID', value: 'AnidbAnimeID', min: 1 },
  { label: 'AniDB Episode ID', value: 'AnidbEpisodeID', min: 1 },
  { label: 'TMDB Movie ID', value: 'TmdbMovieID', min: 1 },
  { label: 'TMDB Show ID', value: 'TmdbShowID', min: 1 },
  { label: 'TMDB Episode ID', value: 'TmdbEpisodeID', min: 0 },
];

type ExportOptionsType = {
  SectionSet: TmdbCrossReferenceSectionType[];
  Automatic: IncludeOnlyFilterType;
  WithEpisodes: IncludeOnlyFilterType;
  IncludeComments: boolean;
  filters: Record<FilterKeyType, string>;
};

const defaultOptions: ExportOptionsType = {
  SectionSet: ['Movie', 'Show', 'Episode'],
  Automatic: 'true',
  WithEpisodes: 'true',
  IncludeComments: true,
  filters: {
    AnidbAnimeID: '',
    AnidbEpisodeID: '',
    TmdbMovieID: '',
    TmdbShowID: '',
    TmdbEpisodeID: '',
  },
};

const parseFilter = (value: string, min: number) => {
  if (value === '') return undefined;
  const parsed = toNumber(value);
  return Number.isInteger(parsed) && parsed >= min ? parsed : Number.NaN;
};

const TmdbExportModal = ({ onClose, show }: Props) => {
  const { isPending, mutate: exportXrefs } = useTmdbExportXrefsMutation();

  const [options, setOptions] = useImmer(defaultOptions);

  useEffect(() => {
    if (!show) setOptions(defaultOptions);
  }, [setOptions, show]);

  const parsedFilters = Object.fromEntries(
    filters.map(({ min, value }) => [value, parseFilter(options.filters[value], min)]),
  ) as Record<FilterKeyType, number | undefined>;
  const hasInvalidFilter = Object.values(parsedFilters).some(value => Number.isNaN(value));
  const canExport = options.SectionSet.length > 0 && !hasInvalidFilter && !isPending;

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSectionToggle = (section: TmdbCrossReferenceSectionType, checked: boolean) => {
    setOptions((draft) => {
      draft.SectionSet = checked
        ? sections.map(({ value }) => value).filter(value => value === section || draft.SectionSet.includes(value))
        : draft.SectionSet.filter(value => value !== section);
    });
  };

  const handleExport = () => {
    if (!canExport) return;
    exportXrefs({
      SectionSet: options.SectionSet,
      Automatic: options.Automatic,
      WithEpisodes: options.WithEpisodes,
      IncludeComments: options.IncludeComments,
      ...parsedFilters,
    }, {
      onSuccess: ({ isEmpty }) => {
        if (isEmpty) {
          toast.info('Nothing to export', 'No cross-references matched the selected options.');
          return;
        }
        toast.success('TMDB cross-references exported!');
        onClose();
      },
      onError: () => toast.error('Failed to export TMDB cross-references!'),
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
      header="Export TMDB Cross-References"
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
        Download your AniDB to TMDB links as a CSV file. The file can be imported again later, or into another Shoko
        Server.
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Sections</div>
        <div className="flex flex-col rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {sections.map(({ label, value }) => (
            <Checkbox
              key={value}
              id={`tmdb-export-section-${value}`}
              label={label}
              labelRight
              isChecked={options.SectionSet.includes(value)}
              onChange={event => handleSectionToggle(value, event.target.checked)}
            />
          ))}
        </div>
        {options.SectionSet.length === 0 && (
          <div className="text-xs text-panel-text-danger">Select at least one section to export.</div>
        )}
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Options</div>
        <div className="flex flex-col gap-y-1">
          <SelectSmall
            id="tmdb-export-automatic"
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
            id="tmdb-export-with-episodes"
            label="TMDB Episode Mapping"
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
            Filters show and episode links by whether they are mapped to a TMDB episode. Movie links are not affected.
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            id="tmdb-export-include-comments"
            label="Include Comments"
            isChecked={options.IncludeComments}
            onChange={event =>
              setOptions((draft) => {
                draft.IncludeComments = event.target.checked;
              })}
          />
          <div className="text-xs opacity-65">
            Adds the AniDB and TMDB titles above each link to make the file easier to read. Comments are ignored when
            importing.
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {filters.map(({ label, min, value }) => (
            <div key={value} className="flex items-center justify-between">
              {label}
              <InputSmall
                id={`tmdb-export-filter-${value}`}
                type="number"
                min={min}
                placeholder="Any"
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
        {hasInvalidFilter && <div className="text-xs text-panel-text-danger">IDs must be whole numbers.</div>}
      </div>
    </ModalPanel>
  );
};

export default TmdbExportModal;
