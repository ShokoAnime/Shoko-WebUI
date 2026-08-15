import { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';

import { ReleaseSource } from '@/core/types/api/file';
import { AUTO_MATCH_EPISODE_ID, detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';

import type { ReleaseInfoType } from '@/core/types/api/file';
import type { ManualLinkType, TouchableField } from '@/core/types/utilities/link-files-with-providers';

type FormState = {
  selectedSeriesId?: number;
  selectedEpisodeId?: number;
  version: ReleaseInfoType['Version'] | '';
  isChaptered?: ReleaseInfoType['IsChaptered'];
  isCreditless?: ReleaseInfoType['IsCreditless'];
  source: ReleaseInfoType['Source'] | '';
  comment: ReleaseInfoType['Comment'];
  CrossReferences: ReleaseInfoType['CrossReferences'];
};

const useReleaseInfoForm = (selectedLinks: ManualLinkType[], show: boolean) => {
  const isBulk = selectedLinks.length > 1;

  const [formState, setFormState] = useImmer<FormState>({
    version: 1,
    source: ReleaseSource.Unknown,
    comment: '',
    CrossReferences: [],
  });
  const [touchedFields, setTouchedFields] = useImmer<Set<TouchableField>>(new Set());
  const [hasDifferent, setHasDifferent] = useImmer({
    chaptered: false,
    creditless: false,
    series: false,
  });
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

    setInitialSeriesName(
      initialSeriesId
        ? ''
        : findMostCommonShowName(selectedLinks.map(link => detectShow(link.file?.Locations?.[0]?.RelativePath))),
    );

    const hasDifferentEpisodes = isBulk && !allSame(link => link.CrossReferences[0]?.AnidbEpisodeID);
    const initialEpisodeId = initialSeriesId && !hasDifferentEpisodes
      ? (first.CrossReferences[0]?.AnidbEpisodeID ?? AUTO_MATCH_EPISODE_ID)
      : undefined;

    const hasDifferentSource = isBulk && !allSame(link => link.Source);
    const hasDifferentVersion = isBulk && !allSame(link => link.Version);
    const hasDifferentComment = isBulk && !allSame(link => link.Comment);

    setHasDifferent({
      chaptered: isBulk && !allSame(link => link.IsChaptered),
      creditless: isBulk && !allSame(link => link.IsCreditless),
      series: hasMultipleSeries,
    });

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
  }, [isBulk, selectedLinks, setFormState, setHasDifferent, setTouchedFields, show]);

  const markTouched = (field: TouchableField) => {
    setTouchedFields((draft) => {
      draft.add(field);
    });
  };

  return {
    formState,
    setFormState,
    touchedFields,
    markTouched,
    hasDifferent,
    setHasDifferent,
    initialSeriesName,
    setInitialSeriesName,
  };
};

export default useReleaseInfoForm;
