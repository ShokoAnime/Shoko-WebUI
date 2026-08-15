import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiPencilCircleOutline, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import InputSmall from '@/components/Input/InputSmall';
import SelectEpisodeList from '@/components/Input/SelectEpisodeList';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import AnimeSelectPanel from '@/components/Utilities/Unrecognized/AnimeSelectPanel';
import { useGetSeriesAniDBMutation, useRefreshAniDBSeriesMutation } from '@/core/react-query/series/mutations';
import { useSeriesAniDBEpisodesQuery, useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import toast from '@/core/toast';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { ReleaseSource } from '@/core/types/api/file';
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
  version: number | '';
  isChaptered?: boolean;
  isCreditless?: boolean;
  source: ReleaseSource | '';
  comment: string;
  CrossReferences: ReleaseCrossReferenceType[];
};

const sourceOptions = [
  <option key="mixed" value="" disabled>-</option>,
  ...[
    ReleaseSource.Unknown,
    ReleaseSource.Other,
    ReleaseSource.TV,
    ReleaseSource.DVD,
    ReleaseSource.BluRay,
    ReleaseSource.Web,
    ReleaseSource.VHS,
    ReleaseSource.VCD,
    ReleaseSource.LaserDisc,
    ReleaseSource.Camera,
    ReleaseSource.Film,
  ].map(source => (
    <option key={source} value={source}>
      {source}
    </option>
  )),
];

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
    version: 1,
    source: ReleaseSource.Unknown,
    comment: '',
    CrossReferences: [],
  });
  const [touchedFields, setTouchedFields] = useImmer<Set<string>>(new Set());
  const [seriesUpdating, setSeriesUpdating] = useState(false);
  const [hasDifferentSeries, setHasDifferentSeries] = useState(false);
  const [hasDifferentChaptered, setHasDifferentChaptered] = useState(false);
  const [hasDifferentCreditless, setHasDifferentCreditless] = useState(false);
  const [initialSeriesName, setInitialSeriesName] = useState('');

  useEffect(() => {
    if (!show) return;
    const first = selectedLinks[0]?.release;
    if (!first) return;

    setTouchedFields(new Set());

    const allSame = (selector: (release: ReleaseInfoType) => unknown) =>
      selectedLinks.every(link => selector(link.release) === selector(first));

    const hasMultipleSeries = isBulk && !allSame(link => link.CrossReferences[0]?.AnidbAnimeID);
    const initialSeriesId = hasMultipleSeries ? undefined : first.CrossReferences[0]?.AnidbAnimeID;

    setHasDifferentSeries(hasMultipleSeries);
    setInitialSeriesName(
      initialSeriesId
        ? ''
        : findMostCommonShowName(selectedLinks.map(link => detectShow(link.file?.Locations?.[0]?.RelativePath))),
    );

    const hasDifferentEpisodes = isBulk && !allSame(link => link.CrossReferences[0]?.AnidbEpisodeID);
    const initialEpisodeId = initialSeriesId && !hasDifferentEpisodes
      ? (first.CrossReferences[0]?.AnidbEpisodeID ?? -1)
      : undefined;

    const hasDifferentSource = isBulk && !allSame(link => link.Source);
    const hasDifferentVersion = isBulk && !allSame(link => link.Version);
    const hasDifferentComment = isBulk && !allSame(link => link.Comment);

    setHasDifferentChaptered(isBulk && !allSame(link => link.IsChaptered));
    setHasDifferentCreditless(isBulk && !allSame(link => link.IsCreditless));

    setFormState({
      selectedSeriesId: initialSeriesId,
      selectedEpisodeId: initialEpisodeId,
      version: hasDifferentVersion ? '' : first.Version,
      isChaptered: first.IsChaptered,
      isCreditless: first.IsCreditless,
      source: hasDifferentSource ? '' : first.Source,
      comment: hasDifferentComment ? '' : (first.Comment ?? ''),
      CrossReferences: first.CrossReferences ?? [],
    });
  }, [isBulk, selectedLinks, setFormState, setTouchedFields, show]);

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

  const seriesName = hasDifferentSeries
    ? 'Multiple series selected'
    : seriesSearchQuery.data?.Title ?? 'Selected series';

  const markTouched = (field: string) => {
    setTouchedFields((draft) => {
      draft.add(field);
    });
  };

  const handleSeriesSelect = async (series: SeriesAniDBSearchResult) => {
    markTouched('CrossReferences');
    setHasDifferentSeries(false);

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

  const handleVersionChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('Version');
    setFormState((draft) => {
      draft.version = event.target.valueAsNumber;
    });
  };

  const handleChapteredChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('IsChaptered');
    setHasDifferentChaptered(false);
    setFormState((draft) => {
      draft.isChaptered = event.target.checked;
    });
  };

  const handleCreditlessChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('IsCreditless');
    setHasDifferentCreditless(false);
    setFormState((draft) => {
      draft.isCreditless = event.target.checked;
    });
  };

  const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    markTouched('Source');
    setFormState((draft) => {
      draft.source = event.target.value as ReleaseSource | '';
    });
  };

  const handleCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    markTouched('Comment');
    setFormState((draft) => {
      draft.comment = event.target.value;
    });
  };

  const handleEditSeries = () => {
    if (!hasDifferentSeries) {
      setInitialSeriesName(seriesName);
    }
    setFormState((draft) => {
      draft.selectedSeriesId = undefined;
      draft.selectedEpisodeId = -1;
    });
    setHasDifferentSeries(false);
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

    if (touchedFields.has('Version') && formState.version !== '') {
      releaseInfo.Version = formState.version;
    }
    if (touchedFields.has('IsChaptered')) {
      releaseInfo.IsChaptered = formState.isChaptered;
    }
    if (touchedFields.has('IsCreditless')) {
      releaseInfo.IsCreditless = formState.isCreditless;
    }
    if (touchedFields.has('Source') && formState.source !== '') {
      releaseInfo.Source = formState.source;
    }
    if (touchedFields.has('Comment')) {
      releaseInfo.Comment = formState.comment;
    }

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
          {(formState.selectedSeriesId ?? hasDifferentSeries) && (
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
      className="h-156"
    >
      <div className="flex grow flex-col gap-y-4 p-6">
        {!formState.selectedSeriesId && !hasDifferentSeries && (
          <AnimeSelectPanel
            placeholder={initialSeriesName}
            onSelect={(series) => {
              handleSeriesSelect(series).catch(console.error);
            }}
            showLoading={seriesUpdating}
          />
        )}
        {(formState.selectedSeriesId ?? hasDifferentSeries) && (
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
              className={cx('flex flex-col gap-y-2', hasDifferentSeries && 'opacity-65')}
              data-tooltip-id="tooltip"
              data-tooltip-content={hasDifferentSeries
                ? 'Episode selection is unavailable when multiple series are selected'
                : ''}
            >
              <div className="flex items-center gap-x-2">
                <span className="text-base font-semibold">Episode</span>
                <Button
                  onClick={handleRefreshSeries}
                  tooltip={isRefreshingSeries || hasDifferentSeries ? '' : 'Force Refresh'}
                  disabled={isRefreshingSeries || hasDifferentSeries}
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
                disabled={hasDifferentSeries}
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
                isChecked={!hasDifferentChaptered && !!formState.isChaptered}
                indeterminate={hasDifferentChaptered}
                onChange={handleChapteredChange}
                justify
              />

              <Checkbox
                id="release-creditless"
                label="Creditless"
                isChecked={!hasDifferentCreditless && !!formState.isCreditless}
                indeterminate={hasDifferentCreditless}
                onChange={handleCreditlessChange}
                justify
              />

              <Input
                id="release-comment"
                label="Comment"
                type="text"
                value={formState.comment}
                onChange={handleCommentChange}
                className="col-span-2"
              />
            </div>
          </>
        )}
      </div>
    </ModalPanel>
  );
};

export default EditReleaseInfoModal;
