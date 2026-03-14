import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
import Title from '@/components/Utilities/Unrecognized/Title';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { ReleaseSource } from '@/core/types/api/file';
import { LinkState } from '@/core/types/utilities/unrecognized-utility';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';

import type { FileType, ReleaseInfoType } from '@/core/types/api/file';
import type { ManualLinkProviderType, ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

export type LinksType = Record<number, ManualLinkType>;

let lastLinkId = 0;
const generateLinkId = () => {
  if (lastLinkId === Number.MAX_SAFE_INTEGER) {
    lastLinkId = 0;
  }
  lastLinkId += 1;
  return lastLinkId;
};

const LinkFilesWithProvidersTab = () => {
  const navigate = useNavigateVoid();
  const selectedFiles = (useLocation().state as { selectedRows?: FileType[] })?.selectedRows ?? [];

  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const settings = useSettingsQuery().data;

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
        OriginalFilename: file.Locations?.[0].RelativePath.split(/[/\\]/g).pop(),
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
      newLinks[linkId] = {
        id: linkId,
        file,
        providers: settings.WebUI_Settings.releaseInfoProviders ?? [],
        state: LinkState.PreInit,
        release,
      };
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

  const canSubmit = initialized
    && links.some(link => link.state === LinkState.Ready);

  const navigateBack = () => {
    setRowSelection({});
    navigate(-1);
  };

  const handleCancel = () => {
    if (links.some(link => [LinkState.Searching, LinkState.Submitting].includes(link.state))) {
      setLinks((draft) => {
        forEach(draft, (draft2) => {
          if (draft2.state === LinkState.Submitting) draft2.state = LinkState.Ready;
          else if (draft2.state === LinkState.Searching) draft2.state = LinkState.Init;
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

  const handleSubmit = () => {
    if (!canSubmit) return;

    setLinks((draft) => {
      forEach(draft, (draft2) => {
        if (draft2.state === LinkState.Ready) {
          draft2.state = LinkState.Submitting;
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
          link => [LinkState.PreInit, LinkState.Searching, LinkState.Submitting].includes(link.state),
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
      || selectedRows.some(link => [LinkState.Searching, LinkState.Submitting].includes(link.state))
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
        if ([LinkState.Ready, LinkState.Init].includes(link.state)) {
          draft[link.id].providers = providers;
          draft[link.id].state = LinkState.Searching;
        }
      });
    });
    setRowSelection({});
  };

  const submitSelectedLinks = () => {
    if (!selectedRows.length || !selectedRows.some(link => link.state === LinkState.Ready)) return;

    setLinks((draft) => {
      selectedRows.forEach((link) => {
        if (link.state === LinkState.Ready) {
          draft[link.id].state = LinkState.Submitting;
        }
      });
    });
    setRowSelection({});
  };

  const openAutoSearch = () => {
    if (!selectedRows.length || !selectedRows.some(link => [LinkState.Ready, LinkState.Init].includes(link.state))) {
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
          title={<Title />}
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

            <div className="flex gap-x-3 whitespace-nowrap font-semibold">
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
                disabled={!canSubmit}
                keybinding="Enter"
              >
                Submit Pending
              </Button>
            </div>
          </div>
        </ShokoPanel>

        <div className="flex mt-8 grow rounded-lg border border-panel-border bg-panel-background p-6 justify-center">
          {!links.length && (
            <div className="flex grow justify-center items-center">
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
                          className="absolute left-0 top-0 w-full"
                          data-index={virtualItem.index}
                          style={{ transform: `translateY(${virtualItem.start ?? 0}px)` }}
                          ref={virtualizer.measureElement}
                        >
                          <UnrecognizedVideo
                            link={link}
                            setLinks={setLinks}
                            toggleSelect={handleRowSelect}
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

export default LinkFilesWithProvidersTab;
