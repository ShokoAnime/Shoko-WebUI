import { useEffect, useEffectEvent, useRef } from 'react';
import { produce } from 'immer';
import { forEach } from 'lodash';

import {
  useAutoPreviewReleaseInfoForFileByIdMutation,
  usePreviewReleaseInfoByProviderIdMutation,
  useReleaseInfoByFileIdMutation,
  useSubmitReleaseInfoForFileByIdMutation,
} from '@/core/react-query/release-info/mutations';
import { ReleaseSource } from '@/core/types/api/file';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';
import type { Updater } from 'use-immer';

const useLinkWorkflow = (
  links: ManualLinkType[],
  setLinks: Updater<Record<number, ManualLinkType>>,
  providerMap: Record<string, { ID: string, Name: string }>,
  initialized: boolean,
) => {
  const { mutateAsync: previewReleaseInfo } = usePreviewReleaseInfoByProviderIdMutation();
  const { mutateAsync: searchReleaseInfo } = useAutoPreviewReleaseInfoForFileByIdMutation();
  const { mutateAsync: submitReleaseInfo } = useSubmitReleaseInfoForFileByIdMutation();
  const { mutateAsync: fetchReleaseInfo } = useReleaseInfoByFileIdMutation();

  // useRef avoids re-renders — these Sets track in-flight API calls (bookkeeping only, not UI state)
  const inFlight = useRef({
    initializing: new Set<number>(),
    searching: new Set<number>(),
    submitting: new Set<number>(),
    fetching: new Set<number>(),
  });

  const processPreInit = useEffectEvent((link: ManualLinkType) => {
    if (inFlight.current.initializing.has(link.id)) return;
    inFlight.current.initializing.add(link.id);

    const hasProvidersEnabled = link.providers.some(provider => provider.enabled);
    const offlineImporterProviderId = link.providers.find(
      provider => providerMap[provider.id]?.Name === 'Offline Importer',
    )?.id;

    if (!offlineImporterProviderId) {
      setLinks((draft) => {
        draft[link.id].state = hasProvidersEnabled ? 'searching' : 'init';
      });
      return;
    }

    const path = link.file.Locations.find(location => location.AbsolutePath)?.AbsolutePath
      ?? link.file.Locations?.[0]?.RelativePath ?? '';

    previewReleaseInfo({ id: `match://${path}`, providerId: offlineImporterProviderId })
      .then((data) => {
        if (!data) return;
        setLinks((draft) => {
          draft[link.id].release = data;
          draft[link.id].state = hasProvidersEnabled ? 'searching' : 'init';
        });
      })
      .catch(() => {
        setLinks((draft) => {
          draft[link.id].state = hasProvidersEnabled ? 'searching' : 'init';
        });
      })
      .finally(() => inFlight.current.initializing.delete(link.id));
  });

  const processSearch = useEffectEvent((link: ManualLinkType) => {
    if (inFlight.current.searching.has(link.id)) return;
    inFlight.current.searching.add(link.id);

    const enabledReleaseProviders = link.providers
      .filter(provider => provider.enabled)
      .map(provider => provider.id);
    if (!enabledReleaseProviders.length) return;

    searchReleaseInfo({ fileId: link.file.ID, providerIDs: enabledReleaseProviders })
      .then((data) => {
        if (!data) {
          setLinks((draft) => {
            draft[link.id].state = 'init';
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

          if (draft.ProviderName !== 'User' && !/\+User\b/.test(draft.ProviderName)) {
            draft.ProviderName += '+User';
          }
        });

        setLinks((draft) => {
          draft[link.id].release = finalData;
          draft[link.id].state = 'ready';
        });
      })
      .catch(() => {
        setLinks((draft) => {
          draft[link.id].state = 'init';
        });
      })
      .finally(() => inFlight.current.searching.delete(link.id));
  });

  const processSubmit = useEffectEvent((link: ManualLinkType) => {
    if (inFlight.current.submitting.has(link.id)) return;
    inFlight.current.submitting.add(link.id);

    submitReleaseInfo({ fileId: link.file.ID, release: link.release })
      .then(() => {
        setLinks((draft) => {
          draft[link.id].state = 'submitted';
        });
      })
      .catch(() => {
        setLinks((draft) => {
          draft[link.id].state = 'ready';
        });
      })
      .finally(() => inFlight.current.submitting.delete(link.id));
  });

  const processLinked = useEffectEvent((link: ManualLinkType) => {
    if (inFlight.current.fetching.has(link.id)) return;
    inFlight.current.fetching.add(link.id);

    fetchReleaseInfo(link.file.ID)
      .then((data) => {
        if (!data) {
          setLinks((draft) => {
            draft[link.id].state = 'init';
          });
          return;
        }

        setLinks((draft) => {
          draft[link.id].release = data;
          draft[link.id].state = 'ready';
        });
      })
      .catch(() => {
        setLinks((draft) => {
          draft[link.id].state = 'init';
        });
      })
      .finally(() => inFlight.current.fetching.delete(link.id));
  });

  useEffect(() => {
    if (!initialized || !links.length) return;

    links.forEach((link) => {
      if (link.state === 'pre-init') {
        processPreInit(link);
      } else if (link.state === 'searching') {
        processSearch(link);
      } else if (link.state === 'submitting') {
        processSubmit(link);
      } else if (link.state === 'fetching') {
        processLinked(link);
      }
    });
  }, [initialized, links]);

  useEffect(() => () => {
    inFlight.current.initializing.clear();
    inFlight.current.searching.clear();
    inFlight.current.submitting.clear();
    inFlight.current.fetching.clear();
  }, []);

  const cancelActiveWork = useEffectEvent(() => {
    setLinks((draft) => {
      forEach(Object.values(draft), (draftLink) => {
        if (draftLink.state === 'submitting') draftLink.state = 'ready';
        else if (['searching', 'fetching'].includes(draftLink.state)) draftLink.state = 'init';
      });
    });
  });

  return { cancelActiveWork };
};

export default useLinkWorkflow;
