import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiPencilCircleOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import ModalPanel from '@/components/Panels/ModalPanel';
import AnimeSelectPanel from '@/components/Utilities/Unrecognized/AnimeSelectPanel';
import { useGetSeriesAniDBMutation, useRefreshAniDBSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesAniDBEpisodesQuery, useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import toast from '@/core/toast';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { SeriesTypeEnum } from '@/core/types/api/series';
import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ReleaseCrossReferenceType, ReleaseInfoType } from '@/core/types/api/file';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';
import type { CrossReferenceType, ManualLinkType } from '@/core/types/utilities/link-files-with-providers';

type Props = {
  show: boolean;
  onClose: () => void;
  selectedLinks: ManualLinkType[];
  onSave: (
    releaseInfo: Partial<ReleaseInfoType>,
    crossReference?: CrossReferenceType,
  ) => void;
};

type FormState = {
  selectedSeriesId?: number;
  selectedEpisodeId?: number;
  CrossReferences: ReleaseCrossReferenceType[];
};

const Title = ({ count }: { count: number }) => (
  <div className="flex items-center justify-between gap-x-1 font-semibold">
    Edit Release Info
    <div className="flex">
      <div className="text-panel-text-important">{count}</div>
      &nbsp;
      {count === 1 ? 'File' : 'Files'}
    </div>
  </div>
);

const EditReleaseInfoModal = (props: Props) => {
  const { onClose, onSave, selectedLinks, show } = props;
  const isBulk = selectedLinks.length > 1;

  const { mutateAsync: getSeriesAniDBData } = useGetSeriesAniDBMutation();
  const { isPending: isRefreshingSeries, mutateAsync: refreshSeries } = useRefreshAniDBSeriesMutation();

  const [formState, setFormState] = useImmer<FormState>({
    CrossReferences: [],
  });
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [seriesUpdating, setSeriesUpdating] = useState(false);
  const [hasMultipleSeries, setHasMultipleSeries] = useState(false);
  const [initialSeriesName, setInitialSeriesName] = useState('');

  useEffect(() => {
    if (!show) return;
    const first = selectedLinks[0]?.release;
    if (!first) return;

    setTouchedFields(new Set());

    const allSame = (selector: (release: ReleaseInfoType) => unknown) =>
      selectedLinks.every(link => selector(link.release) === selector(first));

    const hasDifferentSeries = isBulk && !allSame(link => link.CrossReferences[0]?.AnidbAnimeID);
    const initialSeriesId = hasDifferentSeries ? undefined : first.CrossReferences[0]?.AnidbAnimeID;

    setHasMultipleSeries(hasDifferentSeries);
    setInitialSeriesName(
      initialSeriesId
        ? ''
        : findMostCommonShowName(selectedLinks.map(link => detectShow(link.file?.Locations?.[0]?.RelativePath))),
    );

    if (!initialSeriesId) {
      setFormState({
        selectedSeriesId: initialSeriesId,
        selectedEpisodeId: hasDifferentSeries ? undefined : -1,
        CrossReferences: first.CrossReferences ?? [],
      });
      return;
    }

    const hasDifferentEpisodes = isBulk && !allSame(link => link.CrossReferences[0]?.AnidbEpisodeID);
    const initialEpisodeId = hasDifferentEpisodes
      ? undefined
      : (first.CrossReferences[0]?.AnidbEpisodeID ?? -1);

    setFormState({
      selectedSeriesId: initialSeriesId,
      selectedEpisodeId: initialEpisodeId,
      CrossReferences: first.CrossReferences ?? [],
    });
  }, [isBulk, selectedLinks, setFormState, show]);

  const seriesSearchQuery = useSeriesAniDBQuery(
    formState.selectedSeriesId ?? 0,
    !!formState.selectedSeriesId && show,
  );
  const episodesQuery = useSeriesAniDBEpisodesQuery(
    formState.selectedSeriesId ?? 0,
    { pageSize: 0, includeMissing: 'true', includeUnaired: 'true' },
    !!formState.selectedSeriesId && show,
  );

  const episodeOptions = [
    {
      label: 'Auto-match (from filename)',
      value: -1,
      type: EpisodeTypeEnum.Episode,
      AirDate: '',
    },
    ...map(episodesQuery.data ?? [], episode => ({
      label: episode.Title,
      value: episode.ID,
      type: episode.Type,
      number: episode.EpisodeNumber,
      AirDate: episode.AirDate ?? '',
    })),
  ];

  const seriesName = hasMultipleSeries
    ? 'Multiple series selected'
    : seriesSearchQuery.data?.Title ?? 'Selected series';

  const markTouched = (field: string) => {
    setTouchedFields(previous => new Set(previous).add(field));
  };

  const handleSeriesSelect = async (series: SeriesAniDBSearchResult) => {
    markTouched('CrossReferences');
    setHasMultipleSeries(false);

    if (series.Type !== SeriesTypeEnum.Unknown) {
      setFormState((draft) => {
        draft.selectedSeriesId = series.ID;
      });
      return;
    }

    setSeriesUpdating(true);
    try {
      await refreshSeries({ anidbID: series.ID, force: true, immediate: true });
      const seriesData = await getSeriesAniDBData(series.ID);
      setFormState((draft) => {
        draft.selectedSeriesId = seriesData.ID;
      });
    } catch (_) {
      toast.error('Failed to get series data!');
    }
    setSeriesUpdating(false);
  };

  const handleEpisodeSelect = (optionValue: number) => {
    markTouched('CrossReferences');
    setFormState((draft) => {
      draft.selectedEpisodeId = optionValue;
    });
  };

  const handleEditSeries = () => {
    if (!hasMultipleSeries) {
      setInitialSeriesName(seriesName);
    }
    setFormState((draft) => {
      draft.selectedSeriesId = undefined;
      draft.selectedEpisodeId = -1;
    });
    setHasMultipleSeries(false);
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

  const handleSave = () => {
    const releaseInfo: Partial<ReleaseInfoType> = {};
    let crossReference: CrossReferenceType | undefined;

    if (touchedFields.has('CrossReferences') && formState.selectedSeriesId) {
      crossReference = {
        seriesId: formState.selectedSeriesId,
        episodeId: formState.selectedEpisodeId ?? -1,
        episodes: episodesQuery.data ?? [],
      };
    }

    onSave(releaseInfo, crossReference);
    onClose();
  };

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('escape', onClose, { scopes: 'modal' });

  return (
    <ModalPanel
      show={show}
      size="md"
      onRequestClose={onClose}
      header={<Title count={selectedLinks.length} />}
      footer={
        <div className="flex justify-end gap-x-3">
          <Button onClick={onClose} buttonType="secondary" buttonSize="normal">
            Cancel
          </Button>
          {(formState.selectedSeriesId ?? hasMultipleSeries) && (
            <Button
              onClick={handleSave}
              buttonType="primary"
              buttonSize="normal"
              disabled={touchedFields.size === 0}
            >
              Save
            </Button>
          )}
        </div>
      }
      noPadding
      className="h-144"
    >
      <div className="flex grow flex-col gap-y-4 p-6">
        {!formState.selectedSeriesId && !hasMultipleSeries && (
          <AnimeSelectPanel
            placeholder={initialSeriesName}
            onSelect={(series) => {
              handleSeriesSelect(series).catch(console.error);
            }}
            showLoading={seriesUpdating}
          />
        )}
        {(formState.selectedSeriesId ?? hasMultipleSeries) && (
          <>
            <div className="flex flex-col gap-y-2">
              <span className="text-base font-semibold">Series</span>
              <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-input px-4 py-3">
                <span className="truncate text-panel-text-important">{seriesName}</span>
                <Button onClick={handleEditSeries}>
                  <Icon path={mdiPencilCircleOutline} size={1} className="shrink-0 text-panel-icon-action" />
                </Button>
              </div>
            </div>
            <div
              className={cx('flex flex-col gap-y-2', hasMultipleSeries && 'opacity-65')}
              data-tooltip-id="tooltip"
              data-tooltip-content={hasMultipleSeries
                ? 'Episode selection is unavailable when multiple series are selected'
                : ''}
            >
              <div className="flex items-center gap-x-2">
                <span className="text-base font-semibold">Episode</span>
                <Button
                  onClick={handleRefreshSeries}
                  tooltip={isRefreshingSeries || hasMultipleSeries ? '' : 'Force Refresh'}
                  disabled={isRefreshingSeries || hasMultipleSeries}
                >
                  <Icon path={mdiRefresh} size={1} spin={isRefreshingSeries} className="text-panel-icon-action" />
                </Button>
              </div>
              <SelectEpisodeList
                options={episodeOptions}
                value={formState.selectedEpisodeId ?? 0}
                onChange={handleEpisodeSelect}
                rowIdx={0}
                standalone
                disabled={hasMultipleSeries}
              />
            </div>
          </>
        )}
      </div>
    </ModalPanel>
  );
};

export default EditReleaseInfoModal;
