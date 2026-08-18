import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { find, forEach } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import AutoSearchReleaseModal from '@/components/Utilities/LinkFilesWithProvider/AutoSearchReleaseModal';
import EditReleaseInfoModal from '@/components/Utilities/LinkFilesWithProvider/EditReleaseInfoModal';
import LinkCard from '@/components/Utilities/LinkFilesWithProvider/LinkCard';
import Menu from '@/components/Utilities/LinkFilesWithProvider/Menu';
import TitleOptions from '@/components/Utilities/LinkFilesWithProvider/TitleOptions';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import toast from '@/core/toast';
import { handleShiftSelect } from '@/core/util';
import { detectShow } from '@/core/utilities/auto-match-logic';
import createLinksFromFiles, {
  AUTO_MATCH_EPISODE_ID,
  EDITABLE_STATES,
  isUserEdited,
} from '@/core/utilities/releaseInfoHelpers';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';
import useLinkWorkflow from '@/hooks/utilities/useLinkWorkflow';

import type { FileType, ReleaseInfoType } from '@/core/types/api/file';
import type {
  CrossReferenceType,
  ManualLinkProviderType,
  ManualLinkType,
} from '@/core/types/utilities/link-files-with-providers';

const BUSY_STATES = new Set(['searching', 'submitting', 'fetching']);

const LinkFilesWithProviders = () => {
  const navigate = useNavigateVoid();
  const selectedFiles = (useLocation().state as { selectedRows?: FileType[] })?.selectedRows ?? [];

  const settings = useSettingsQuery().data;
  // settingsRevision is 0 on initialData; it only becomes > 0 after the real fetch resolves
  const isSettingsLoaded = settings.WebUI_Settings.settingsRevision > 0;
  const [linksDict, setLinks] = useImmer<Record<number, ManualLinkType>>({});
  const links = Object.values(linksDict);
  const [initialized, setInitialized] = useState(false);
  const [showAutoSearchModal, setShowAutoSearchModal] = useState(false);
  const [autoSearchProviders, setAutoSearchProviders] = useState<ManualLinkProviderType[]>([]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showEditModal, toggleEditModal] = useToggle(false);

  const initializeLinks = useEffectEvent(() => {
    if (!isSettingsLoaded) return;
    setLinks(createLinksFromFiles(selectedFiles, settings.WebUI_Settings.releaseInfoProviders ?? []));
    setInitialized(true);
  });

  useEffect(() => {
    if (!links.length && initialized) navigate('/webui/utilities/unrecognized/files', { replace: true });
  }, [initialized, links, navigate]);

  useEffect(() => {
    if (!isSettingsLoaded) return;
    initializeLinks();
  }, [isSettingsLoaded]);

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

  const { cancelActiveWork } = useLinkWorkflow(links, setLinks, initialized);

  const handleCancel = () => {
    if (links.some(link => BUSY_STATES.has(link.state))) {
      cancelActiveWork();
      return;
    }

    if (canSubmit) {
      setConfirmCancel(true);
      return;
    }

    navigateBack();
  };

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
      if (links.some(link => BUSY_STATES.has(link.state))) {
        return;
      }

      const allSelected = Object.fromEntries(links.map(link => [link.id, true]));
      setRowSelection(allSelected);
    }
  };

  const removeLinks = () => {
    if (
      !selectedRows.length
      || selectedRows.some(link => BUSY_STATES.has(link.state))
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
        if (EDITABLE_STATES.has(link.state)) {
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
    if (!selectedRows.length || !selectedRows.every(link => EDITABLE_STATES.has(link.state))) {
      return;
    }
    setShowAutoSearchModal(true);
    setAutoSearchProviders(selectedRows[0].providers);
  };

  const openEditReleaseInfo = () => {
    if (!selectedRows.length || !selectedRows.every(link => EDITABLE_STATES.has(link.state))) return;
    toggleEditModal();
  };

  const handleSaveReleaseInfo = (
    releaseInfo: Partial<ReleaseInfoType>,
    crossReference?: CrossReferenceType,
  ) => {
    let failedAutoMatchCount = 0;

    setLinks((draft) => {
      let specials = 0;
      for (const link of selectedRows) {
        Object.assign(draft[link.id].release, releaseInfo);

        let matchFailed = true;
        if (crossReference) {
          const { episodeId: selectedEpisodeId, episodes, seriesId } = crossReference;
          let episodeId = selectedEpisodeId;
          if (episodeId === AUTO_MATCH_EPISODE_ID) {
            const details = detectShow(link.file?.Locations?.[0]?.RelativePath);
            if (details) {
              const episodeNumber = details.episodeType === 'Special' && details.episodeStart === 0
                ? specials += 1
                : details.episodeStart;
              episodeId = find(
                episodes,
                item => item.Type === details.episodeType && item.EpisodeNumber === episodeNumber,
              )?.ID ?? 0;
            }
          }
          if (episodeId > 0) {
            draft[link.id].release.CrossReferences = [{
              AnidbEpisodeID: episodeId,
              AnidbAnimeID: seriesId,
              PercentageStart: 0,
              PercentageEnd: 100,
            }];
            matchFailed = false;
          } else {
            failedAutoMatchCount += 1;
          }
        }

        if (!isUserEdited(draft[link.id].release.ProviderName)) {
          draft[link.id].release.ProviderName += '+User';
        }
        if (!matchFailed) {
          draft[link.id].state = 'ready';
        }
      }
    });

    if (failedAutoMatchCount > 0) {
      toast.error(
        failedAutoMatchCount === 1
          ? 'Failed to auto-match an episode for 1 file'
          : `Failed to auto-match an episode for ${failedAutoMatchCount} files`,
      );
    }
  };

  useHotkeys('s', openAutoSearch, { scopes: 'primary' });
  useHotkeys('a', toggleAllSelectedLinks, { scopes: 'primary' });
  useHotkeys('d', removeLinks, { scopes: 'primary' });
  useHotkeys('e', openEditReleaseInfo, { scopes: 'primary' });
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
              onEditReleaseInfo={openEditReleaseInfo}
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
                          <LinkCard
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

      <EditReleaseInfoModal
        show={showEditModal}
        onClose={toggleEditModal}
        selectedLinks={selectedRows}
        onSave={handleSaveReleaseInfo}
      />
    </>
  );
};

export default LinkFilesWithProviders;
