import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { produce } from 'immer';
import { forEach } from 'lodash';
import { useImmer } from 'use-immer';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import AutoSearchReleaseModal from '@/components/Utilities/Unrecognized/LinkFilesWithProvider/AutoSearchReleaseModal';
import Menu from '@/components/Utilities/Unrecognized/LinkFilesWithProvider/Menu';
import TitleOptions from '@/components/Utilities/Unrecognized/LinkFilesWithProvider/TitleOptions';
import UnrecognizedVideo from '@/components/Utilities/Unrecognized/LinkFilesWithProvider/UnrecognizedVideo';
import {
  useAutoPreviewReleaseInfoForFileByIdMutation,
  usePreviewReleaseInfoByProviderIdMutation,
  useReleaseInfoByFileIdMutation,
  useSubmitReleaseInfoForFileByIdMutation,
} from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { ReleaseSource } from '@/core/types/api/file';
import { handleShiftSelect } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';

import type { FileType, ReleaseInfoType } from '@/core/types/api/file';
import type { ManualLinkProviderType, ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type LinksType = Record<number, ManualLinkType>;

let lastLinkId = 0;
const generateLinkId = () => {
  if (lastLinkId === Number.MAX_SAFE_INTEGER) {
    lastLinkId = 0;
  }
  lastLinkId += 1;
  return lastLinkId;
};

const currentlyInitializingLinks = new Set<number>();
const currentlySearchingLinks = new Set<number>();
const currentlySubmittingLinks = new Set<number>();
const currentlyFetchingLinks = new Set<number>();

const LinkFilesWithProviders = () => {
  const navigate = useNavigateVoid();
  const selectedFiles = (useLocation().state as { selectedRows?: FileType[] })?.selectedRows ?? [];

  const settings = useSettingsQuery().data;
  const releaseProvidersQuery = useReleaseInfoProvidersQuery(true);
  const providerMap = useMemo(() => {
    if (!releaseProvidersQuery.data) return {};
    return Object.fromEntries(releaseProvidersQuery.data.map(provider => [provider.ID, provider]));
  }, [releaseProvidersQuery.data]);

  const { mutateAsync: previewReleaseInfo } = usePreviewReleaseInfoByProviderIdMutation();
  const { mutateAsync: searchReleaseInfo } = useAutoPreviewReleaseInfoForFileByIdMutation();
  const { mutateAsync: submitReleaseInfo } = useSubmitReleaseInfoForFileByIdMutation();
  const { mutateAsync: fetchReleaseInfo } = useReleaseInfoByFileIdMutation();

  const [linksDict, setLinks] = useImmer<LinksType>({});
  const links = Object.values(linksDict);
  const [initialized, setInitialized] = useState(false);
  const [showAutoSearchModal, setShowAutoSearchModal] = useState(false);
  const [autoSearchProviders, setAutoSearchProviders] = useState<ManualLinkProviderType[]>([]);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const initializeLinks = useEffectEvent(() => {
    if (!releaseProvidersQuery.data) return;

    const sortedFiles = selectedFiles.toSorted((fileA, fileB) => {
      let locationA = (fileA.Locations.find(loc => loc.IsAccessible) ?? fileA.Locations[0])?.RelativePath ?? '';
      let locationB = (fileB.Locations.find(loc => loc.IsAccessible) ?? fileB.Locations[0])?.RelativePath ?? '';
      if (locationA.startsWith('dot')) locationA = `.${locationA.substring(3)}`;
      if (locationB.startsWith('dot')) locationB = `.${locationB.substring(3)}`;
      return locationA.localeCompare(locationB, 'en-US', {
        numeric: true,
        ignorePunctuation: true,
        sensitivity: 'base',
      });
    });

    const newLinks: LinksType = {};
    sortedFiles.forEach((file) => {
      const now = new Date().toISOString();
      const release: ReleaseInfoType = {
        OriginalFilename: file.Locations?.[0]?.RelativePath.split(/[/\\]/g).pop(),
        ProviderName: 'User',
        Version: 1,
        Source: ReleaseSource.Unknown,
        CrossReferences: [],
        FileSize: file.Size,
        Hashes: file.Hashes,
        IsCorrupted: false,
        Released: file.MediaInfo?.Encoded?.slice(0, 10) ?? file.Created?.slice(0, 10),
        Created: now,
        Updated: now,
      };

      const linkId = generateLinkId();
      if (file.Imported) {
        newLinks[linkId] = {
          id: linkId,
          file,
          providers: [],
          state: 'fetching',
          release,
        };
      } else {
        newLinks[linkId] = {
          id: linkId,
          file,
          providers: settings.WebUI_Settings.releaseInfoProviders ?? [],
          state: 'pre-init',
          release,
        };
      }
    });

    setLinks(newLinks);
    setInitialized(true);
  });

  useEffect(() => {
    if (!links.length && initialized) navigate('/webui/utilities/unrecognized/files', { replace: true });
  }, [initialized, links, navigate]);

  useEffect(() => {
    if (!releaseProvidersQuery.isSuccess) return;
    initializeLinks();
  }, [releaseProvidersQuery.isSuccess]);

  useEffect(() => () => {
    currentlyInitializingLinks.clear();
    currentlySearchingLinks.clear();
    currentlySubmittingLinks.clear();
    currentlyFetchingLinks.clear();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: links.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 209,
    overscan: 5,
    gap: 16,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(links);

  const lastRowIndex = useRef<number>(undefined);
  const handleSelect = (event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, index: number) => {
    handleShiftSelect({ event, handleRowSelect, index, lastRowIndex, rowSelection, rows: links, setRowSelection });
  };

  const canSubmit = initialized
    && links.some(link => link.state === 'ready');

  const allSubmitted = initialized
    && links.every(link => link.state === 'submitted');

  const navigateBack = () => {
    setRowSelection({});
    navigate(-1);
  };

  const handleCancel = () => {
    if (links.some(link => ['searching', 'submitting', 'fetching'].includes(link.state))) {
      setLinks((draft) => {
        forEach(draft, (draft2) => {
          if (draft2.state === 'submitting') draft2.state = 'ready';
          else if (['searching', 'fetching'].includes(draft2.state)) draft2.state = 'init';
        });
      });
      return;
    }

    if (canSubmit) {
      setConfirmCancel(true);
      return;
    }

    navigateBack();
  };

  const processPreInit = useEffectEvent((link: ManualLinkType) => {
    if (currentlyInitializingLinks.has(link.id)) return;
    currentlyInitializingLinks.add(link.id);

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
      .finally(() => currentlyInitializingLinks.delete(link.id));
  });

  const processSearch = useEffectEvent((link: ManualLinkType) => {
    if (currentlySearchingLinks.has(link.id)) return;
    currentlySearchingLinks.add(link.id);

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
      .finally(() => currentlySearchingLinks.delete(link.id));
  });

  const processSubmit = useEffectEvent((link: ManualLinkType) => {
    if (currentlySubmittingLinks.has(link.id)) return;
    currentlySubmittingLinks.add(link.id);

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
      .finally(() => currentlySubmittingLinks.delete(link.id));
  });

  const processLinked = useEffectEvent((link: ManualLinkType) => {
    if (currentlyFetchingLinks.has(link.id)) return;
    currentlyFetchingLinks.add(link.id);

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
      .finally(() => currentlyFetchingLinks.delete(link.id));
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

  const handleSubmit = () => {
    if (allSubmitted) {
      navigateBack();
      return;
    }

    if (!canSubmit) return;

    setLinks((draft) => {
      forEach(draft, (draft2) => {
        if (draft2.state === 'ready') {
          draft2.state = 'submitting';
        }
      });
    });
  };

  const toggleAllSelectedLinks = () => {
    if (selectedRows.length === links.length) {
      setRowSelection({});
    } else {
      if (
        links.some(
          link => ['pre-init', 'searching', 'submitting', 'fetching'].includes(link.state),
        )
      ) {
        return;
      }

      const allSelected = Object.fromEntries(links.map(link => [link.id, true]));
      setRowSelection(allSelected);
    }
  };

  const removeLinks = () => {
    if (
      !selectedRows.length
      || selectedRows.some(link => ['searching', 'submitting', 'fetching'].includes(link.state))
    ) return;

    setLinks((draft) => {
      selectedRows.forEach((link) => {
        delete draft[link.id];
      });
    });
    setRowSelection({});
  };

  const onUpdateProviders = (providers: ManualLinkProviderType[]) => {
    if (!providers.some(provider => provider.enabled)) return;
    setLinks((draft) => {
      selectedRows.forEach((link) => {
        if (['ready', 'init'].includes(link.state)) {
          draft[link.id].providers = providers;
          draft[link.id].state = 'searching';
        }
      });
    });
    setRowSelection({});
  };

  const submitSelectedLinks = () => {
    if (!selectedRows.length || !selectedRows.some(link => link.state === 'ready')) return;

    setLinks((draft) => {
      selectedRows.forEach((link) => {
        if (link.state === 'ready') {
          draft[link.id].state = 'submitting';
        }
      });
    });
    setRowSelection({});
  };

  const openAutoSearch = () => {
    if (!selectedRows.length || !selectedRows.some(link => ['ready', 'init'].includes(link.state))) {
      return;
    }
    setShowAutoSearchModal(true);
    setAutoSearchProviders(selectedRows[0].providers);
  };

  useHotkeys('s', openAutoSearch, { scopes: 'primary' });
  useHotkeys('a', toggleAllSelectedLinks, { scopes: 'primary' });
  useHotkeys('d', removeLinks, { scopes: 'primary' });
  useHotkeys('q', submitSelectedLinks, { scopes: 'primary' });
  useHotkeys('escape', handleCancel, { scopes: 'primary' });
  useHotkeys('enter', handleSubmit, { scopes: 'primary' });

  return (
    <>
      <TransitionDiv className="flex size-full grow flex-col">
        <ShokoPanel
          title="Link With Providers"
          options={<TitleOptions links={links} selectedCount={selectedRows.length} />}
        >
          <div className="flex items-center gap-x-3">
            <Menu
              linkCount={links.length}
              selectedLinks={selectedRows}
              openSearchDialog={openAutoSearch}
              removeLinks={removeLinks}
              toggleAllSelectedLinks={toggleAllSelectedLinks}
              addLinksToSubmitQueue={submitSelectedLinks}
            />

            <div className="flex gap-x-3 font-semibold whitespace-nowrap">
              <Button
                onClick={handleCancel}
                buttonType="secondary"
                className="px-4 py-3"
                disabled={!initialized}
                keybinding="Esc"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                buttonType="primary"
                className="px-4 py-3"
                disabled={!allSubmitted && !canSubmit}
                keybinding="Enter"
              >
                {allSubmitted ? 'Done' : 'Submit Pending'}
              </Button>
            </div>
          </div>
        </ShokoPanel>

        <div className="mt-8 flex grow justify-center rounded-lg border border-panel-border bg-panel-background p-6">
          {!links.length && (
            <div className="flex grow items-center justify-center">
              <Icon className="text-panel-text-primary" path={mdiLoading} size={4} spin={0.5} />
            </div>
          )}
          {links.length && (
            <div
              className="grow overflow-y-auto pr-4"
              ref={scrollRef}
            >
              <div className="relative grow">
                <div className="absolute top-0 w-full" style={{ height: virtualizer.getTotalSize() }}>
                  <div className="relative w-full">
                    {virtualItems.map((virtualItem) => {
                      const link = links[virtualItem.index];

                      return (
                        <div
                          key={virtualItem.key}
                          className="absolute top-0 left-0 w-full"
                          data-index={virtualItem.index}
                          style={{ transform: `translateY(${virtualItem.start ?? 0}px)` }}
                          ref={virtualizer.measureElement}
                        >
                          <UnrecognizedVideo
                            link={link}
                            toggleSelect={event => handleSelect(event, virtualItem.index)}
                            selected={rowSelection[link.id]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TransitionDiv>

      <AutoSearchReleaseModal
        show={showAutoSearchModal}
        initialProviders={autoSearchProviders}
        onUpdateProviders={onUpdateProviders}
        onClose={() => setShowAutoSearchModal(false)}
      />

      <ConfirmationPromptModal
        onConfirm={navigateBack}
        onClose={() => setConfirmCancel(false)}
        show={confirmCancel}
        title="Abort linking"
        cancelText="No"
        confirmText="Yes"
      >
        Are you sure you want to abort the linking with unsubmitted changes?
      </ConfirmationPromptModal>
    </>
  );
};

export default LinkFilesWithProviders;
