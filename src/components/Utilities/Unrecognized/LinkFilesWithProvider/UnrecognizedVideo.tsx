import React, { useEffect, useEffectEvent, useMemo } from 'react';
import cx from 'classnames';
import { produce } from 'immer';

import {
  useAutoPreviewReleaseInfoForFileByIdMutation,
  usePreviewReleaseInfoByProviderIdMutation,
  useSubmitReleaseInfoForFileByIdMutation,
} from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { ReleaseSource } from '@/core/types/api/file';
import { LinkState } from '@/core/types/utilities/unrecognized-utility';

import CrossReference from './CrossReference';
import ProviderName from './ProviderName';
import VideoMetadata from './VideoMetadata';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';
import type { LinksType } from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesWithProvidersTab';
import type { DraftFunction } from 'use-immer';

type Props = {
  link: ManualLinkType;
  setLinks: (newLinks: LinksType | DraftFunction<LinksType>) => void;
  toggleSelect: (linkId: number) => void;
  selected: boolean;
};

const linkStateClassMap = {
  [LinkState.PreInit]: 'opacity-65 cursor-wait',
  [LinkState.Init]: '',
  [LinkState.Searching]: 'animate-pulse cursor-wait',
  [LinkState.Ready]: 'cursor-pointer',
  [LinkState.Submitting]: 'cursor-progress',
  [LinkState.Submitted]: '',
} as const;

const selectionDisabledStates = [
  LinkState.PreInit,
  LinkState.Searching,
  LinkState.Submitting,
];

const UnrecognizedVideo = (props: Props) => {
  const { link, selected, setLinks, toggleSelect } = props;

  const providersQuery = useReleaseInfoProvidersQuery();
  const providerMap = useMemo(() => {
    if (!providersQuery.data) return {};
    return Object.fromEntries(providersQuery.data.map(provider => [provider.ID, provider]));
  }, [providersQuery.data]);

  const { isPending: previewPending, mutate: previewReleaseInfo } = usePreviewReleaseInfoByProviderIdMutation();
  const { isPending: searchPending, mutate: searchReleaseInfo } = useAutoPreviewReleaseInfoForFileByIdMutation();
  const { isPending: submitPending, mutate: submitReleaseInfo } = useSubmitReleaseInfoForFileByIdMutation();

  let border = 'border-panel-border';
  if (link.state === LinkState.Submitted) {
    border = 'border-panel-text-important';
  } else if ([LinkState.Searching, LinkState.Submitting].includes(link.state)) {
    border = 'border-panel-text-primary';
  } else if (link.state === LinkState.Ready) {
    border = 'border-panel-text-warning';
  } else if (selected) {
    border = 'border-panel-text-primary';
  }

  const processPreInit = useEffectEvent(() => {
    if (previewPending) return;

    const hasProvidersEnabled = link.providers.some(provider => provider.enabled);
    const offlineImporterProviderId = link.providers.find(
      provider => providerMap[provider.id]?.Name === 'Offline Importer',
    )?.id;

    if (!offlineImporterProviderId) {
      setLinks((draft) => {
        draft[link.id].state = hasProvidersEnabled ? LinkState.Searching : LinkState.Init;
      });
      return;
    }

    const path = link.file.Locations.find(location => location.AbsolutePath)?.AbsolutePath
      ?? link.file.Locations?.[0]?.RelativePath ?? '';
    previewReleaseInfo({ id: `match://${path}`, providerId: offlineImporterProviderId }, {
      onSettled: (data, error) => {
        setLinks((draft) => {
          if (!error && data) draft[link.id].release = data;
          draft[link.id].state = hasProvidersEnabled ? LinkState.Searching : LinkState.Init;
        });
      },
    });
  });

  const processSearch = useEffectEvent(() => {
    if (searchPending) return;

    const enabledReleaseProviders = link.providers
      .filter(provider => provider.enabled)
      .map(provider => provider.id);
    if (!enabledReleaseProviders.length) return;

    searchReleaseInfo({ fileId: link.file.ID, providerIDs: enabledReleaseProviders }, {
      onSettled: (data, error) => {
        if (error || !data) {
          setLinks((draft) => {
            draft[link.id].state = LinkState.Init;
          });
          return;
        }

        const finalData = produce(data, (draft) => {
          const original = link.release;

          if (draft.Source === ReleaseSource.Unknown && link.release.Source !== ReleaseSource.Unknown) {
            draft.Source = link.release.Source;
          }

          if (draft.Version < 1) draft.Version = 1;

          draft.FileSize ??= original.FileSize;
          draft.OriginalFilename ??= original.OriginalFilename;
          draft.IsChaptered ??= original.IsChaptered;
          draft.IsCensored ??= original.IsCensored;
          draft.IsCreditless ??= original.IsCreditless;
          draft.Group ??= original.Group;

          // TODO: Check if Edit Release adds "+User" to the name. `edited` flag is removed for now.
          if (draft.ProviderName !== 'User' && !/\+User\b/.test(draft.ProviderName)) {
            draft.ProviderName += '+User';
          }
        });

        setLinks((draft) => {
          draft[link.id].release = finalData;
          draft[link.id].state = LinkState.Ready;
        });
      },
    });
  });

  const processSubmit = useEffectEvent(() => {
    if (submitPending) return;

    submitReleaseInfo({ fileId: link.file.ID, release: link.release }, {
      onSettled: (_, error) => {
        setLinks((draft) => {
          draft[link.id].state = error ? LinkState.Ready : LinkState.Submitted;
        });
      },
    });
  });

  useEffect(() => {
    if (link.state === LinkState.PreInit) processPreInit();
    else if (link.state === LinkState.Searching) processSearch();
    else if (link.state === LinkState.Submitting) processSubmit();
  }, [link.state]);

  const handleSelect = () => {
    if (selectionDisabledStates.includes(link.state)) return;
    toggleSelect(link.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      className={cx(
        'flex w-full cursor-pointer flex-col gap-y-2 rounded-lg border bg-panel-background p-4 leading-5 transition-colors focus:border-panel-text! focus:outline-none',
        border,
        selected && 'bg-panel-background-selected-row!',
        !selected && linkStateClassMap[link.state],
        [LinkState.Ready, LinkState.Submitting, LinkState.Submitted].includes(link.state) && 'bg-panel-background-alt',
      )}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <div className="flex flex-col gap-2">
        <ProviderName link={link} />

        <VideoMetadata link={link} />

        <div className="flex flex-col gap-y-1">
          {link.release.CrossReferences.length
            ? (
              <>
                {link.release.CrossReferences.map(xref => (
                  <CrossReference
                    key={`${xref.AnidbEpisodeID}-${xref.AnidbAnimeID}-${xref.PercentageStart}-${xref.PercentageEnd}`}
                    xref={xref}
                  />
                ))}
              </>
            )
            : (
              <div className="text-sm font-semibold">
                Not Yet Linked
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UnrecognizedVideo;
