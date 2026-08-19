import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiInformationOutline, mdiPencilCircleOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { filter, findIndex, map } from 'lodash';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import AnimeSelectPanel from '@/components/Utilities/Unrecognized/AnimeSelectPanel';
import RangeFillModal from '@/components/Utilities/Unrecognized/RangeFillModal';
import { useReleaseInfoReleaseGroupsQuery } from '@/core/react-query/release-info/queries';
import { useGetSeriesAniDBMutation, useRefreshAniDBSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesAniDBEpisodesQuery, useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import toast from '@/core/toast';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import { AUTO_MATCH_EPISODE_ID, RANGE_FILL_EPISODE_ID } from '@/core/utilities/releaseInfoHelpers';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';
import useReleaseInfoForm from '@/hooks/utilities/useReleaseInfoForm';

import SelectedFilesModal from './SelectedFilesModal';
import SelectReleaseGroup from './SelectReleaseGroup';

import type { EpisodeTypeValues } from '@/core/types/api/episode';
import type { ReleaseGroupType, ReleaseInfoType, ReleaseSourceValues } from '@/core/types/api/file';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';
import type {
  CrossReferenceType,
  ManualLinkType,
  TouchableField,
} from '@/core/types/utilities/link-files-with-providers';

type Props = {
  show: boolean;
  onClose: () => void;
  selectedLinks: ManualLinkType[];
  onSave: (
    releaseInfo: Partial<ReleaseInfoType>,
    crossReference?: CrossReferenceType,
  ) => void;
};

const sourceOptions = [
  <option key="mixed" value="" disabled>-</option>,
  ...[
    'Unknown',
    'Other',
    'TV',
    'DVD',
    'BluRay',
    'Web',
    'VHS',
    'VCD',
    'LaserDisc',
    'Camera',
    'Film',
  ].map(source => (
    <option key={source} value={source}>
      {source}
    </option>
  )),
];

const Title = ({ selectedLinks }: { selectedLinks: ManualLinkType[] }) => {
  const [showFilesModal, toggleShowFilesModal, setShowFilesModal] = useToggle(false);
  const count = selectedLinks.length;

  useToggleModalKeybinds(!showFilesModal, 'modal');

  const singleFileName = count === 1
    ? selectedLinks[0].file.Locations[0]?.RelativePath.split(/[/\\]/g).pop() ?? ''
    : '';

  const handleShowFiles = () => {
    if (count > 1) toggleShowFilesModal();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-x-1 font-semibold">
        Edit Release Info
        <div className="flex items-center gap-x-1">
          <div>
            <span className="text-panel-text-important">{count}</span>
            &nbsp;
            {count === 1 ? 'File' : 'Files'}
          </div>
          <Button
            onClick={handleShowFiles}
            tooltip={count === 1 ? singleFileName : 'Show files'}
            className="text-panel-icon-action"
          >
            <Icon path={mdiInformationOutline} size={1} />
          </Button>
        </div>
      </div>
      <SelectedFilesModal
        show={showFilesModal}
        onClose={() => setShowFilesModal(false)}
        files={selectedLinks.map(link => link.file)}
      />
    </>
  );
};

const EditReleaseInfoModal = (props: Props) => {
  const { onClose, onSave, selectedLinks, show } = props;

  const { mutateAsync: getSeriesAniDBData } = useGetSeriesAniDBMutation();
  const { isPending: isRefreshingSeries, mutateAsync: refreshSeries } = useRefreshAniDBSeriesMutation();

  const {
    formState,
    hasDifferent,
    initialSeriesName,
    markTouched,
    setFormState,
    setHasDifferent,
    setInitialSeriesName,
    touchedFields,
  } = useReleaseInfoForm(selectedLinks, show);
  const [seriesUpdating, setSeriesUpdating] = useState(false);
  const [showRangeFill, toggleRangeFill, setShowRangeFill] = useToggle(false);

  const seriesSearchQuery = useSeriesAniDBQuery(
    formState.selectedSeriesId ?? 0,
    !!formState.selectedSeriesId && show,
  );
  const episodesQuery = useSeriesAniDBEpisodesQuery(
    formState.selectedSeriesId ?? 0,
    { pageSize: 0, includeMissing: 'true', includeUnaired: 'true' },
    !!formState.selectedSeriesId && show,
  );

  const releaseGroupOptions = useReleaseInfoReleaseGroupsQuery(show).data ?? [];

  const episodeOptions = [
    ...(hasDifferent.episodes
      ? [
        {
          label: 'Multiple episodes selected',
          value: 0,
          type: 'Episode',
          AirDate: '',
          disabled: true,
        } as const,
      ]
      : []),
    {
      label: 'Auto-match (from filename)',
      value: AUTO_MATCH_EPISODE_ID,
      type: 'Episode',
      AirDate: '',
    } as const,
    {
      label: formState.rangeFill
        ? `Range Fill (from ${getEpisodePrefix(formState.rangeFill.episodeType)}${formState.rangeFill.rangeStart})`
        : 'Range Fill (not set)',
      value: RANGE_FILL_EPISODE_ID,
      type: 'Episode',
      AirDate: '',
    } as const,
    ...map(episodesQuery.data ?? [], episode => ({
      label: episode.Title,
      value: episode.ID,
      type: episode.Type,
      number: episode.EpisodeNumber,
      AirDate: episode.AirDate ?? '',
    })),
  ];

  const seriesName = hasDifferent.series
    ? 'Multiple series selected'
    : seriesSearchQuery.data?.Title ?? 'Selected series';

  const hasSeriesSelection = !!formState.selectedSeriesId || hasDifferent.series;

  const handleSeriesSelect = async (series: SeriesAniDBSearchResult) => {
    markTouched('CrossReferences');
    setHasDifferent((draft) => {
      draft.series = false;
    });

    if (series.Type !== 'Unknown') {
      setFormState((draft) => {
        draft.selectedSeriesId = series.ID;
        draft.selectedEpisodeId = AUTO_MATCH_EPISODE_ID;
        draft.rangeFill = undefined;
      });
      return;
    }

    setSeriesUpdating(true);
    try {
      await refreshSeries({ anidbID: series.ID, force: true, immediate: true });
      const seriesData = await getSeriesAniDBData(series.ID);
      setFormState((draft) => {
        draft.selectedSeriesId = seriesData.ID;
        draft.selectedEpisodeId = AUTO_MATCH_EPISODE_ID;
        draft.rangeFill = undefined;
      });
    } catch (_) {
      toast.error('Failed to get series data!');
    }
    setSeriesUpdating(false);
  };

  const handleEpisodeSelect = (optionValue: number) => {
    if (!show || !formState.selectedSeriesId) return;
    markTouched('CrossReferences');
    setHasDifferent((draft) => {
      draft.episodes = false;
    });
    setFormState((draft) => {
      draft.selectedEpisodeId = optionValue;
      if (optionValue !== RANGE_FILL_EPISODE_ID) {
        draft.rangeFill = undefined;
      }
    });
    if (optionValue === RANGE_FILL_EPISODE_ID) {
      setShowRangeFill(true);
    }
  };

  const handleRangeFill = (episodeType: EpisodeTypeValues, rangeStart: number) => {
    const items = filter(episodesQuery.data ?? [], ['Type', episodeType]);
    if (findIndex(items, ['EpisodeNumber', rangeStart]) === -1) {
      toast.error('Unable to find starting episode.');
      return;
    }

    markTouched('CrossReferences');
    setHasDifferent((draft) => {
      draft.episodes = false;
    });
    setFormState((draft) => {
      draft.selectedEpisodeId = RANGE_FILL_EPISODE_ID;
      draft.rangeFill = { episodeType, rangeStart };
    });
  };

  const handleReleaseGroupChange = (group?: ReleaseGroupType) => {
    markTouched('Group');
    setHasDifferent((draft) => {
      draft.group = false;
    });
    setFormState((draft) => {
      draft.group = group;
    });
  };

  const handleVersionChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('Version');
    setFormState((draft) => {
      draft.version = Number.isNaN(event.target.valueAsNumber) ? '' : event.target.valueAsNumber;
    });
  };

  const handleChapteredChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('IsChaptered');
    setHasDifferent((draft) => {
      draft.chaptered = false;
    });
    setFormState((draft) => {
      draft.isChaptered = event.target.checked;
    });
  };

  const handleCreditlessChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('IsCreditless');
    setHasDifferent((draft) => {
      draft.creditless = false;
    });
    setFormState((draft) => {
      draft.isCreditless = event.target.checked;
    });
  };

  const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    markTouched('Source');
    setFormState((draft) => {
      draft.source = event.target.value as ReleaseSourceValues | '';
    });
  };

  const handleCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('Comment');
    setFormState((draft) => {
      draft.comment = event.target.value;
    });
  };

  const handleEditSeries = () => {
    if (!hasDifferent.series) {
      setInitialSeriesName(seriesName);
    }
    setFormState((draft) => {
      draft.selectedSeriesId = undefined;
      draft.selectedEpisodeId = AUTO_MATCH_EPISODE_ID;
      draft.rangeFill = undefined;
    });
    setHasDifferent((draft) => {
      draft.series = false;
    });
  };

  const handleRefreshSeries = () => {
    if (!formState.selectedSeriesId) return;
    refreshSeries({
      anidbID: formState.selectedSeriesId,
      force: true,
      immediate: true,
    }).catch((error) => {
      console.error(error);
      toast.error('Failed to refresh series data!');
    });
  };

  const saveDisabled = !show
    || touchedFields.size === 0
    || (formState.selectedEpisodeId === RANGE_FILL_EPISODE_ID && !formState.rangeFill);

  const handleSave = () => {
    if (saveDisabled) return;

    const releaseInfo: Partial<ReleaseInfoType> = {};
    let crossReference: CrossReferenceType | undefined;

    const setIfTouched = <FieldName extends TouchableField>(
      field: FieldName,
      value?: ReleaseInfoType[FieldName],
      writeUndefined = false,
    ) => {
      if (!touchedFields.has(field)) return;
      if (value === undefined && !writeUndefined) return;
      releaseInfo[field] = value;
    };

    setIfTouched('Version', formState.version === '' ? undefined : formState.version);
    setIfTouched('IsChaptered', formState.isChaptered);
    setIfTouched('IsCreditless', formState.isCreditless);
    setIfTouched('Source', formState.source === '' ? undefined : formState.source);
    // Comment and Group can be cleared: write undefined through so it is
    // omitted from the payload and the server clears the stored value.
    setIfTouched('Comment', formState.comment === '' ? undefined : formState.comment, true);
    setIfTouched('Group', formState.group, true);

    if (touchedFields.has('CrossReferences') && formState.selectedSeriesId) {
      crossReference = {
        seriesId: formState.selectedSeriesId,
        episodeId: formState.selectedEpisodeId ?? AUTO_MATCH_EPISODE_ID,
        episodes: episodesQuery.data ?? [],
        ...(formState.selectedEpisodeId === RANGE_FILL_EPISODE_ID && formState.rangeFill
          ? { rangeFill: formState.rangeFill }
          : {}),
      };
    }

    onSave(releaseInfo, crossReference);
    onClose();
  };

  useToggleModalKeybinds(show && !showRangeFill, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys(
    'escape',
    () => {
      if (show) onClose();
    },
    { scopes: 'modal' },
  );
  useHotkeys('r', () => handleEpisodeSelect(RANGE_FILL_EPISODE_ID), { scopes: 'modal' });
  useHotkeys('enter', handleSave, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      size="md"
      onRequestClose={onClose}
      header={<Title selectedLinks={selectedLinks} />}
      footer={
        <div className="flex justify-end gap-x-3">
          <Button onClick={onClose} buttonType="secondary" buttonSize="normal">
            Cancel
          </Button>
          {hasSeriesSelection && (
            <Button
              onClick={handleSave}
              buttonType="primary"
              buttonSize="normal"
              disabled={saveDisabled}
            >
              Save
            </Button>
          )}
        </div>
      }
      noPadding
      className="h-172"
    >
      <div className="flex grow flex-col gap-y-4 p-6">
        {!formState.selectedSeriesId && !hasDifferent.series && (
          <AnimeSelectPanel
            placeholder={initialSeriesName}
            onSelect={(series) => {
              handleSeriesSelect(series).catch(console.error);
            }}
            showLoading={seriesUpdating}
          />
        )}
        {hasSeriesSelection && (
          <>
            <div className="flex flex-col gap-y-2">
              <span className="font-semibold">Series</span>
              <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-input px-4 py-3">
                <span className="truncate">{seriesName}</span>
                <Button onClick={handleEditSeries}>
                  <Icon path={mdiPencilCircleOutline} size={1} className="shrink-0 text-panel-icon-action" />
                </Button>
              </div>
            </div>
            <div
              className={cx('flex flex-col gap-y-2', hasDifferent.series && 'opacity-65')}
              data-tooltip-id="tooltip"
              data-tooltip-content={hasDifferent.series
                ? 'Episode selection is unavailable when multiple series are selected'
                : ''}
            >
              <div className="flex items-center gap-x-2">
                <span className="font-semibold">Episode</span>
                <Button
                  onClick={handleRefreshSeries}
                  tooltip={isRefreshingSeries || hasDifferent.series ? '' : 'Force Refresh'}
                  disabled={isRefreshingSeries || hasDifferent.series}
                >
                  <Icon path={mdiRefresh} size={1} spin={isRefreshingSeries} className="text-panel-icon-action" />
                </Button>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="grow">
                  <SelectEpisodeList
                    options={episodeOptions}
                    value={formState.selectedEpisodeId ?? 0}
                    onChange={handleEpisodeSelect}
                    rowIdx={0}
                    standalone
                    disabled={hasDifferent.series}
                  />
                </div>
                {formState.selectedEpisodeId === RANGE_FILL_EPISODE_ID && (
                  <Button onClick={toggleRangeFill}>
                    <Icon path={mdiPencilCircleOutline} size={1} className="shrink-0 text-panel-icon-action" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="font-semibold">Release Group</span>
              <SelectReleaseGroup
                options={releaseGroupOptions}
                value={formState.group}
                onChange={handleReleaseGroupChange}
                hasDifferent={hasDifferent.group}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center justify-between">
                Source
                <SelectSmall id="release-source" value={formState.source} onChange={handleSourceChange}>
                  {sourceOptions}
                </SelectSmall>
              </div>

              <div className="flex items-center justify-between">
                Version
                <InputSmall
                  id="release-version"
                  type="number"
                  value={formState.version}
                  onChange={handleVersionChange}
                  min={1}
                  className="w-16 px-3 py-1 text-center"
                />
              </div>

              <Checkbox
                id="release-chaptered"
                label="Chaptered"
                isChecked={!hasDifferent.chaptered && !!formState.isChaptered}
                indeterminate={hasDifferent.chaptered}
                onChange={handleChapteredChange}
                justify
              />

              <Checkbox
                id="release-creditless"
                label="Creditless"
                isChecked={!hasDifferent.creditless && !!formState.isCreditless}
                indeterminate={hasDifferent.creditless}
                onChange={handleCreditlessChange}
                justify
              />

              <Input
                id="release-comment"
                label="Comment"
                type="text"
                value={formState.comment ?? ''}
                onChange={handleCommentChange}
                className="col-span-2"
              />
            </div>
          </>
        )}
      </div>
      <RangeFillModal show={showRangeFill} onClose={toggleRangeFill} handleRangeFill={handleRangeFill} />
    </ModalPanel>
  );
};

export default EditReleaseInfoModal;
