import { useEffect, useEffectEvent, useRef } from 'react';
import { forEach } from 'lodash';

import {
  useAutoPreviewReleaseInfoForFileByIdMutation,
  useReleaseInfoByFileIdMutation,
  useSubmitReleaseInfoForFileByIdMutation,
} from '@/core/react-query/release-info/mutations';
import { mergeReleaseInfo } from '@/core/utilities/releaseInfoHelpers';

import type { ManualLinkType } from '@/core/types/utilities/link-files-with-providers';
import type { Updater } from 'use-immer';

const useLinkWorkflow = (
  links: ManualLinkType[],
  setLinks: Updater<Record<number, ManualLinkType>>,
  initialized: boolean,
) => {
  const { mutateAsync: searchReleaseInfo } = useAutoPreviewReleaseInfoForFileByIdMutation();
  const { mutateAsync: submitReleaseInfo } = useSubmitReleaseInfoForFileByIdMutation();
  const { mutateAsync: fetchReleaseInfo } = useReleaseInfoByFileIdMutation();

  // useRef avoids re-renders — these Sets track in-flight API calls (bookkeeping only, not UI state)
  const inFlight = useRef({
    searching: new Set<number>(),
    submitting: new Set<number>(),
    fetching: new Set<number>(),
  });

  const processSearch = useEffectEvent((link: ManualLinkType) => {
    if (inFlight.current.searching.has(link.id)) return;
    inFlight.current.searching.add(link.id);

    const enabledReleaseProviders = link.providers
      .filter(provider => provider.enabled)
      .map(provider => provider.id);
    if (!enabledReleaseProviders.length) {
      inFlight.current.searching.delete(link.id);
      setLinks((draft) => {
        draft[link.id].state = 'init';
      });
      return;
    }

    searchReleaseInfo({ fileId: link.file.ID, providerIDs: enabledReleaseProviders })
      .then((data) => {
        if (!data) {
          setLinks((draft) => {
            draft[link.id].state = 'init';
          });
          return;
        }

        setLinks((draft) => {
          draft[link.id].release = mergeReleaseInfo(data, link.release);
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
      if (link.state === 'searching') {
        processSearch(link);
      } else if (link.state === 'submitting') {
        processSubmit(link);
      } else if (link.state === 'fetching') {
        processLinked(link);
      }
    });
  }, [initialized, links]);

  useEffect(() => () => {
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
