/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  mdiLoading,
  mdiMagnify,
  mdiPencil,
  mdiSelectAll,
  mdiSelection,
  mdiSelectionRemove,
  mdiTrayMinus,
  mdiTrayPlus,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import { cloneDeep, orderBy } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import AutoSearchReleaseModal from '@/components/Utilities/Unrecognized/AutoSearchReleaseModal';
import ConfirmModal from '@/components/Utilities/Unrecognized/ConfirmModal';
import EditReleaseInfoModal from '@/components/Utilities/Unrecognized/EditReleaseInfoModal';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import { useEpisodeAniDbBulkQuery } from '@/core/react-query/episode/queries';
import {
  useAutoPreviewReleaseInfoForFileByIdMutation,
  useSubmitReleaseInfoForFileByIdMutation,
} from '@/core/react-query/release-info/mutations';
import { useReleaseInfoProvidersQuery } from '@/core/react-query/release-info/queries';
import { useSeriesAniDbBulkQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { ReleaseSource } from '@/core/types/api/file';
import { detectShow } from '@/core/utilities/auto-match-logic';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';
import LinkFilesTabVideo from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesTabVideo';

import type { FileType, ReleaseInfoType } from '@/core/types/api/file';
import type { ReleaseProviderInfoType } from '@/core/types/api/release-info';

export type ManualLink = {
  id: number;
  file: FileType;
  providers: ReleaseProviderInfoType[];
  state: 'init' | 'pending' | 'auto-link-queue' | 'auto-linking' | 'submit-queue' | 'submitting' | 'submitted';
  release: ReleaseInfoType;
};

let lastLinkId = 0;
const generateLinkID = () => {
  if (lastLinkId === Number.MAX_SAFE_INTEGER) {
    lastLinkId = 0;
  }
  lastLinkId += 1;
  return lastLinkId;
};

const linkIdSelector = (link: ManualLink) => link.id;

function LinkFilesTab() {
  const { selectedRows } = (useLocation().state ?? { selectedRows: [] }) as { selectedRows: FileType[] };
  const [state, setLoading] = useState({
    isLoading: true,
    links: new Array<ManualLink>(),
  });
  const {
    handleRowSelect: handleLinkSelect,
    rowSelection: selectedLinkDict,
    selectedRows: selectedLinks,
    setRowSelection: setLinkSelection,
  } = useRowSelection(state.links, linkIdSelector);
  const episodeIds = useMemo(
    () =>
      Array.from(new Set(state.links.flatMap(link => link.release.CrossReferences.map(xref => xref.AnidbEpisodeID)))),
    [state.links],
  );
  const animeIds = useMemo(
    () => Array.from(new Set(state.links.flatMap(link => link.release.CrossReferences.map(xref => xref.AnidbAnimeID)))),
    [state.links],
  );
  const [focusedLinks, setFocusedLinks] = useState<number[]>(() => []);
  const lastSelectedLinkIndexRef = useRef<number | null>(null);
  const releaseProvidersQuery = useReleaseInfoProvidersQuery();
  const settingsQuery = useSettingsQuery();
  const episodeQuery = useEpisodeAniDbBulkQuery(episodeIds);
  const animeQuery = useSeriesAniDbBulkQuery(animeIds);
  const { mutate: submitLinkRemote } = useSubmitReleaseInfoForFileByIdMutation();
  const { mutate: autoLinkPreview } = useAutoPreviewReleaseInfoForFileByIdMutation();
  const navigate = useNavigateVoid();

  const [auto, setAuto] = useState<{ show: boolean, providers: ReleaseProviderInfoType[] }>(
    () => ({ show: false, providers: [] }),
  );
  const [edit, setEdit] = useState<{ show: boolean, releases: Record<number, ReleaseInfoType> }>(
    () => ({ show: false, releases: [] }),
  );
  const [shouldConfirm, setShouldConfirm] = useState(false);

  const anyLinks = selectedLinks.length > 0 ? selectedLinks : state.links;
  const canSubmit = !state.isLoading && state.links.length > 0
    && state.links.some(link => link.state === 'pending' && link.release.CrossReferences.length > 0);
  const isDone = !state.isLoading && state.links.length > 0 && state.links.every(link => link.state === 'submitted');

  const focusLinks = useEventCallback(
    (initialIndexes: number[] | ((prev: number[]) => number[]), focusIndex?: number) => {
      const indexes = typeof initialIndexes === 'function' ? initialIndexes(focusedLinks) : initialIndexes;
      if (focusIndex != null || indexes.length > 0) {
        const index = focusIndex ?? indexes[indexes.length - 1];
        const { id } = state.links[index] ?? { id: -1 };
        const element = window.document.querySelector(`div[data-video-link-id="${id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      setFocusedLinks(indexes);
    },
  );

  const completeLinking = useEventCallback(() => {
    toast.info('Linking complete');
    navigate('/webui/utilities/unrecognized/files', { replace: true });
    setLoading(prev => ({ ...prev, isLoading: true }));
  });

  const onConfirmed = useEventCallback(() => {
    setShouldConfirm(false);
    navigate(-1);
  });

  const onConfirmClose = useEventCallback(() => {
    setShouldConfirm(false);
  });

  const handleCancel = useEventCallback(() => {
    if (focusedLinks.length > 0) {
      focusLinks([]);
    } else if (selectedLinks.length > 0) {
      setLinkSelection({});
      lastSelectedLinkIndexRef.current = null;
    } else if (canSubmit) {
      setShouldConfirm(true);
    } else if (isDone) {
      completeLinking();
    } else {
      onConfirmed();
    }
  });

  const submitPending = useEventCallback(() => {
    const links = cloneDeep(state.links);
    for (const link of links) {
      if ((link.state !== 'pending' && link.state !== 'init') || link.release.CrossReferences.length === 0) {
        continue;
      }
      link.state = 'submit-queue';
    }
    setLoading(prev => ({ ...prev, links }));
  });

  const openSearchDialog = useEventCallback(() => {
    if (selectedLinks.length === 0) return;
    const providers = cloneDeep(selectedLinks[0].providers);
    setAuto({ show: true, providers });
  });

  const onAutoSearchUpdateProviders = useEventCallback((providers: ReleaseProviderInfoType[]) => {
    const links = cloneDeep(state.links);
    const selectedIds = selectedLinks.map(link => link.id);
    for (
      const link of links.filter(lin =>
        selectedIds.includes(lin.id) && (lin.state === 'pending' || lin.state === 'init')
      )
    ) {
      link.providers = cloneDeep(providers);
      link.state = 'auto-link-queue';
    }
    setLoading(prev => ({ ...prev, links }));
    setLinkSelection({});
    lastSelectedLinkIndexRef.current = null;
  });

  const onAutoSearchClose = useEventCallback(() => {
    setAuto(prev => ({ ...prev, show: false }));
  });

  const openEditDialog = useEventCallback(() => {
    if (selectedLinks.length === 0) return;
    const links = selectedLinks.filter(lin => lin.state === 'pending' || lin.state === 'init');
    const releases = Object.fromEntries(
      cloneDeep(links.map(link => link.release)).map((release, index) => [links[index].id, release]),
    );
    setEdit({ show: links.length > 0, releases });
  });

  const onEditUpdateReleases = useEventCallback((releases: Record<number, ReleaseInfoType>) => {
    const links = cloneDeep(state.links);
    // eslint-disable-next-line no-nested-ternary
    const entries = Object.entries(releases).map(([id, release]) => [Number(id), release] as const).filter(([id]) =>
      !Number.isNaN(id)
    );
    for (const [linkId, release] of entries) {
      const link = links.find(lin => lin.id === linkId);
      if (!link) continue;

      link.release = release;
      link.state = 'pending';
    }
    setLoading(prev => ({ ...prev, links }));
    setLinkSelection({});
    lastSelectedLinkIndexRef.current = null;
  });

  const onEditClose = useEventCallback(() => {
    setEdit(prev => ({ ...prev, show: false }));
  });

  const initializeLinks = useEventCallback(
    (
      files: FileType[],
      enabledReleaseProviders: string[],
      releaseProviderOrder: string[],
      releaseProviders: ReleaseProviderInfoType[],
    ) => {
      const links: ManualLink[] = [];
      for (const file of orderBy(files, fil => fil.Locations[0]?.RelativePath ?? fil.ID)) {
        const release: ReleaseInfoType = {
          ID: null,
          ReleaseURI: null,
          MediaInfo: null,
          OriginalFilename: file.Locations?.[0].RelativePath.split(/[/\\]/g).pop() ?? null,
          ProviderName: 'User',
          Revision: 1,
          Source: ReleaseSource.Unknown,
          Comment: null,
          CrossReferences: [],
          FileSize: file.Size,
          Hashes: file.Hashes,
          IsChaptered: null,
          IsCensored: null,
          IsCreditless: null,
          IsCorrupted: false,
          Group: null,
          Metadata: null,
          Released: file.MediaInfo?.Encoded?.slice(0, 10) ?? file.Created?.slice(0, 10),
          Created: new Date().toISOString(),
          Updated: new Date().toISOString(),
        };
        const anidbProviderIndex = releaseProviders.findIndex(provider =>
          provider.Name === 'AniDB' && provider.Plugin.Name === 'Shoko Core'
        );
        if (anidbProviderIndex !== -1) {
          const anidbProviderId = releaseProviders[anidbProviderIndex].ID;
          releaseProviders.splice(anidbProviderIndex, 1);
          if (releaseProviderOrder.includes(anidbProviderId)) {
            releaseProviderOrder.splice(releaseProviderOrder.indexOf(anidbProviderId), 0, anidbProviderId);
          }
          if (enabledReleaseProviders.includes(anidbProviderId)) {
            enabledReleaseProviders.splice(enabledReleaseProviders.indexOf(anidbProviderId), 0, anidbProviderId);
          }
        }
        const providers = releaseProviders
          .sort((providerA, providerB) => {
            const idA = providerA.ID;
            const idB = providerB.ID;
            const indexA = releaseProviderOrder.indexOf(idA);
            const indexB = releaseProviderOrder.indexOf(idB);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          })
          .map<ReleaseProviderInfoType>((provider, index) => ({
            ...provider,
            IsEnabled: enabledReleaseProviders.includes(provider.ID),
            Priority: index,
          }));
        const link: ManualLink = {
          id: generateLinkID(),
          file,
          providers,
          state: providers.length > 0 && providers.some(provider => provider.IsEnabled) ? 'auto-link-queue' : 'init',
          release,
        };
        const path = file?.Locations?.[0]?.RelativePath || '';
        const showData = detectShow(path);
        if (showData) {
          if (showData.releaseGroup) {
            release.Group = {
              ID: showData.releaseGroup,
              Name: showData.releaseGroup,
              ShortName: showData.releaseGroup,
              Source: 'User',
            };
          }
          if (showData.version != null && showData.version > 0) {
            release.Revision = showData.version;
          }
        }

        links.push(link);
      }

      setLoading({ links, isLoading: false });
    },
  );

  const selectLinks = useEventCallback((selectedId: number, shiftKey = false, setFocus = true, preSelect?: boolean) => {
    try {
      if (Number.isNaN(selectedId)) return;
      const manualLinkIndex = state.links.findIndex(link => link.id === selectedId);
      let isSelected = false;
      if (shiftKey) {
        window?.getSelection()?.removeAllRanges();
        const lrIndex = lastSelectedLinkIndexRef.current ?? manualLinkIndex;
        const fromIndex = Math.min(lrIndex, manualLinkIndex);
        const toIndex = Math.max(lrIndex, manualLinkIndex);
        isSelected = preSelect ?? (
          lastSelectedLinkIndexRef.current != null
            ? selectedLinkDict[state.links[lastSelectedLinkIndexRef.current].id]
            : true
        );
        const tempRowSelection: Record<number, boolean> = {};
        for (let index = fromIndex; index <= toIndex; index += 1) {
          tempRowSelection[state.links[index].id] = isSelected;
        }
        setLinkSelection(tempRowSelection);
      } else if (!setFocus || window?.getSelection()?.type !== 'Range') {
        isSelected = preSelect ?? !selectedLinkDict[selectedId];
        handleLinkSelect(selectedId, isSelected);
      }
      if (
        setFocus
        && (focusedLinks.length === 0
          || (focusedLinks.length === 1 && focusedLinks[0] === lastSelectedLinkIndexRef.current))
      ) {
        focusLinks(isSelected ? [manualLinkIndex] : [], -1);
      }
      lastSelectedLinkIndexRef.current = manualLinkIndex;
    } catch (error) {
      console.error(error);
    }
  });

  const toggleAllSelectedLinks = useEventCallback(() => {
    if (selectedLinks.length !== state.links.length) {
      const tempRowSelection: Record<number, boolean> = {};
      for (const link of state.links) {
        tempRowSelection[link.id] = true;
      }
      setLinkSelection(tempRowSelection);
    } else {
      setLinkSelection({});
    }
  });

  const handleSelectLinks = useEventCallback((event: React.MouseEvent<HTMLElement>) => {
    const selectedId = parseInt(event.currentTarget.dataset.id ?? '', 10);
    selectLinks(selectedId, event.shiftKey);
  });

  const addLinksToSubmitQueue = useEventCallback(() => {
    if (selectedLinks.length === 0) return;
    const links = cloneDeep(state.links);
    const selectedIds = selectedLinks.map(link => link.id);
    for (
      const link of links.filter(lin =>
        selectedIds.includes(lin.id) && lin.state === 'pending' && lin.release.CrossReferences.length > 0
      )
    ) {
      link.state = 'submit-queue';
    }
    setLoading(prev => ({ ...prev, links }));
  });

  const removeLinksFromSearchQueue = useEventCallback(() => {
    const links = cloneDeep(state.links);
    const selectedIds = selectedLinks.map(link => link.id);
    for (const link of links.filter(lin => selectedIds.includes(lin.id) && lin.state === 'auto-link-queue')) {
      link.state = 'pending';
    }
    setLoading(prev => ({ ...prev, links }));
  });

  const removeLinksFromSubmitQueue = useEventCallback(() => {
    const links = cloneDeep(state.links);
    const selectedIds = selectedLinks.map(link => link.id);
    for (const link of links.filter(lin => selectedIds.includes(lin.id) && lin.state === 'submit-queue')) {
      link.state = 'pending';
    }
    setLoading(prev => ({ ...prev, links }));
  });

  const removeLinksFromPage = useEventCallback(() => {
    // eslint-disable-next-line no-nested-ternary
    const selectedIds = selectLinks.length > 0
      ? selectedLinks.map(link => link.id)
      : focusedLinks.length > 0
      ? focusedLinks.map(index => state.links[index].id)
      : [];
    const links = cloneDeep(state.links).filter(lin =>
      lin.state === 'auto-linking' || lin.state === 'submitting' || !selectedIds.includes(lin.id)
    );
    lastSelectedLinkIndexRef.current = null;
    setLoading(prev => ({ ...prev, links }));
    setLinkSelection({});
    focusLinks([]);
  });

  const searchLink = useEventCallback((link: ManualLink) => {
    const enabledReleaseProviders = link.providers.filter(provider => provider.IsEnabled).map(provider => provider.ID);
    link.state = 'pending';
    if (enabledReleaseProviders.length > 0) {
      autoLinkPreview({ fileId: link.file.ID, providerIDs: enabledReleaseProviders }, {
        onSettled(data, error) {
          if (!error && data) {
            link.release = data;
          }

          setLoading((prev) => {
            const links = cloneDeep(prev.links);
            const index = links.findIndex(lin => lin.id === link.id);
            if (index !== -1) {
              links[index] = link;
            }
            return { ...prev, links };
          });
        },
      });
    } else {
      setLoading((prev) => {
        const links = cloneDeep(prev.links);
        const index = links.findIndex(lin => lin.id === link.id);
        if (index !== -1) {
          links[index] = link;
        }
        return { ...prev, links };
      });
    }
  });

  const submitLink = useEventCallback((link: ManualLink) => {
    if (link.release.CrossReferences.length > 0) {
      submitLinkRemote({ fileId: link.file.ID, release: link.release }, {
        onSettled(_, error) {
          link.state = error ? 'pending' : 'submitted';

          setLoading((prev) => {
            const links = cloneDeep(prev.links);
            const index = links.findIndex(lin => lin.id === link.id);
            if (index !== -1) {
              links[index] = link;
            }
            return { ...prev, links };
          });
        },
      });
    } else {
      link.state = 'pending';
      setLoading((prev) => {
        const links = cloneDeep(prev.links);
        const index = links.findIndex(lin => lin.id === link.id);
        if (index !== -1) {
          links[index] = link;
        }
        return { ...prev, links };
      });
    }
  });

  const onKeyboard = useEventCallback((event: KeyboardEvent) => {
    if (auto.show || edit.show || shouldConfirm) return;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.stopPropagation();
      event.preventDefault();
      const isUp = event.key === 'ArrowUp';
      if (focusedLinks.length === 0) {
        if (selectedLinks.length > 0) {
          const index = state.links.findIndex(link => link.id === selectedLinks[selectedLinks.length - 1].id);
          if (index === -1) return;
          focusLinks([index]);
        } else {
          focusLinks(isUp ? [state.links.length - 1] : [0]);
        }
      } else {
        const currentIndex = isUp
          ? focusedLinks.reduceRight(
            (cur, nex) => (nex === cur - 1 ? nex : cur),
            focusedLinks[focusedLinks.length - 1] + 1,
          )
          : focusedLinks.reduce((cur, nex) => (nex === cur + 1 ? nex : cur), focusedLinks[0] - 1);
        let nextIndex = currentIndex;
        if (event.shiftKey || focusedLinks.length === 1) nextIndex += isUp ? -1 : +1;
        if (nextIndex < 0) nextIndex = state.links.length - 1;
        else if (nextIndex >= state.links.length) nextIndex = 0;
        if (event.shiftKey) {
          if (!focusedLinks.includes(nextIndex)) {
            focusLinks(prev => [nextIndex, ...prev].sort((indexA, indexB) => indexA - indexB), nextIndex);
          }
        } else {
          focusLinks([nextIndex], nextIndex);
        }
      }
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.stopPropagation();
      event.preventDefault();
      const isUp = event.key === 'PageUp';
      const nextIndex = isUp ? 0 : state.links.length - 1;
      if (focusedLinks.length > 0 && event.shiftKey) {
        const currentIndex = isUp
          ? focusedLinks[0]
          : focusedLinks[focusedLinks.length - 1];
        const fromIndex = Math.min(currentIndex, nextIndex);
        const toIndex = Math.max(currentIndex, nextIndex);
        const range = Array.from({ length: toIndex - fromIndex + 1 }, (_, index) => fromIndex + index);
        focusLinks(range, nextIndex);
      } else {
        focusLinks([nextIndex], nextIndex);
      }
    } else if (event.key === ' ') {
      event.stopPropagation();
      event.preventDefault();
      if (focusedLinks.length === 0) {
        if (selectedLinks.length === 0) {
          focusLinks([0], 0);
        } else {
          const index = state.links.findIndex(link => link.id === selectedLinks[selectedLinks.length - 1].id);
          if (index === -1) return;
          focusLinks([index], index);
        }
      } else {
        const isFocused = selectedLinkDict[state.links[focusedLinks[focusedLinks.length - 1]].id] ?? false;
        for (const index of focusedLinks) {
          selectLinks(state.links[index].id, false, false, !isFocused);
        }
      }
    } else if (
      (event.key === 'd' || event.key === 'Delete' || event.key === 'Backspace') && !event.altKey && !event.metaKey
      && !event.shiftKey
    ) {
      event.stopPropagation();
      event.preventDefault();
      if (selectLinks.length > 0 || focusedLinks.length > 0) {
        removeLinksFromPage();
      }
    } else if (event.key === 'q' && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      addLinksToSubmitQueue();
    } else if (event.key === 'r' && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      removeLinksFromSubmitQueue();
      removeLinksFromSearchQueue();
    } else if (event.key === 'a' && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      toggleAllSelectedLinks();
    } else if (event.key === 's' && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      openSearchDialog();
    } else if (event.key === 'e' && !event.altKey && !event.metaKey && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      openEditDialog();
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      handleCancel();
    } else if (event.key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      if (isDone) {
        completeLinking();
      } else if (canSubmit) {
        submitPending();
      }
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyboard);
    return () => {
      window.removeEventListener('keydown', onKeyboard);
    };
  }, [onKeyboard]);

  useEffect(() => {
    if (!state.isLoading) {
      const links = cloneDeep(state.links);
      if (state.links.some(link => link.state === 'auto-linking')) {
        searchLink(cloneDeep(state.links.find(link => link.state === 'auto-linking')!));
      } else if (state.links.some(link => link.state === 'auto-link-queue')) {
        const firstWaiting = links.find(link => link.state === 'auto-link-queue')!;
        firstWaiting.state = 'auto-linking';
      }
      if (state.links.some(link => link.state === 'submitting')) {
        submitLink(cloneDeep(state.links.find(link => link.state === 'submitting')!));
      } else if (state.links.some(link => link.state === 'submit-queue')) {
        const firstWaiting = links.find(link => link.state === 'submit-queue')!;
        firstWaiting.state = 'submitting';
      }
      if (JSON.stringify(state.links) !== JSON.stringify(links)) {
        setLoading(prev => ({ ...prev, links }));
      }
    }
  }, [state.links, state.isLoading, searchLink, submitLink]);

  useEffect(() => {
    if (state.links.length === 0 && !state.isLoading) {
      navigate('/webui/utilities/unrecognized/files', { replace: true });
    }
  }, [state.links, navigate, state.isLoading]);

  useEffect(() => {
    if (settingsQuery.isSuccess && releaseProvidersQuery.isSuccess && state.isLoading) {
      const enabledReleaseProviders = settingsQuery.data.WebUI_Settings.linking.enabledReleaseProviders.slice() ?? [];
      const releaseProviderOrder = settingsQuery.data.WebUI_Settings.linking.releaseProviderOrder.slice() ?? [];
      const releaseProviders = releaseProvidersQuery.data?.slice() ?? [];
      initializeLinks(selectedRows, enabledReleaseProviders, releaseProviderOrder, releaseProviders);
    }
  }, [
    state.isLoading,
    initializeLinks,
    selectedRows,
    settingsQuery.isSuccess,
    settingsQuery.data,
    releaseProvidersQuery.isSuccess,
    releaseProvidersQuery.data,
  ]);

  return (
    <>
      <TransitionDiv className="flex size-full grow flex-col">
        <div className="sticky -top-6 z-10">
          <ShokoPanel
            title={<Title />}
            options={<ItemCount count={selectedRows.length} selected={selectedLinks.length} />}
          >
            <div className="flex items-center gap-x-3">
              <div className="relative box-border flex grow items-center gap-x-4 overflow-auto whitespace-nowrap rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
                <MenuButton
                  onClick={openSearchDialog}
                  icon={mdiMagnify}
                  name="Search for Release Info (S)"
                  disabled={state.isLoading
                    || !selectedLinks.some(link => link.state === 'pending' || link.state === 'init')}
                />
                <MenuButton
                  onClick={openEditDialog}
                  icon={mdiPencil}
                  name="Edit Release Info (E)"
                  disabled={state.isLoading
                    || !selectedLinks.some(link => link.state === 'pending' || link.state === 'init')}
                />
                <MenuButton
                  onClick={toggleAllSelectedLinks}
                  icon={selectedLinks.length === state.links.length ? mdiSelection : mdiSelectAll}
                  name={selectedLinks.length === state.links.length ? 'Unselect All (A)' : 'Select All (A)'}
                  disabled={state.isLoading}
                />
                {(selectedLinks.some(link => link.state !== 'auto-linking' && link.state !== 'submitting')
                  || focusedLinks.some(index =>
                    state.links[index].state !== 'auto-linking' && state.links[index].state !== 'submitting'
                  )) && (
                  <MenuButton
                    onClick={removeLinksFromPage}
                    icon={mdiSelectionRemove}
                    name={selectedLinks.length > 0 ? 'Remove Selected (D)' : 'Remove Focused (D)'}
                    disabled={state.isLoading}
                  />
                )}
                {anyLinks.some(link => link.state === 'auto-link-queue') && (
                  <MenuButton
                    onClick={removeLinksFromSearchQueue}
                    icon={mdiTrayMinus}
                    name={selectedLinks.length > 0 ? 'Remove from Search Queue (R)' : 'Clear Search Queue (R)'}
                    disabled={state.isLoading}
                  />
                )}
                {anyLinks.some(link => link.state === 'submit-queue') && (
                  <MenuButton
                    onClick={removeLinksFromSubmitQueue}
                    icon={mdiTrayMinus}
                    name={selectedLinks.length > 0 ? 'Remove from Submit Queue (R)' : 'Clear Submit Queue (R)'}
                    disabled={state.isLoading}
                  />
                )}
                {selectedLinks.some(link => link.state === 'pending' && link.release.CrossReferences.length > 0) && (
                  <MenuButton
                    onClick={addLinksToSubmitQueue}
                    icon={mdiTrayPlus}
                    name="Add to Submit Queue (Q)"
                    disabled={state.isLoading}
                  />
                )}
              </div>
              <div className="flex gap-x-3 whitespace-nowrap font-semibold">
                <Button onClick={handleCancel} buttonType="secondary" className="px-4 py-3" disabled={state.isLoading}>
                  Cancel (Esc)
                </Button>
                {isDone
                  ? (
                    <Button
                      onClick={completeLinking}
                      buttonType="primary"
                      className="px-4 py-3"
                    >
                      Finish Linking
                    </Button>
                  )
                  : (
                    <Button
                      onClick={submitPending}
                      buttonType="primary"
                      className="px-4 py-3"
                      disabled={!canSubmit}
                    >
                      Submit Pending (Enter)
                    </Button>
                  )}
              </div>
            </div>
          </ShokoPanel>
        </div>

        <div className="mt-8 flex size-full w-full grow auto-rows-min flex-col gap-y-2 overflow-y-auto rounded-lg border border-panel-border bg-panel-background p-6">
          {state.isLoading && (
            <div className="flex grow items-center gap-x-2 place-self-center">
              <Icon className="text-panel-text-primary" path={mdiLoading} size={4} spin={0.5} />
            </div>
          )}
          {!state.isLoading && (
            state.links.map((link, index) => (
              <LinkFilesTabVideo
                key={link.id}
                animeRecord={animeQuery.data!}
                episodeRecord={episodeQuery.data!}
                link={link}
                selectLink={handleSelectLinks}
                selectedLinkDict={selectedLinkDict}
                focusedLink={focusedLinks.includes(index)}
              />
            ))
          )}
        </div>
      </TransitionDiv>
      <AutoSearchReleaseModal
        show={auto.show}
        providers={auto.providers}
        onClose={onAutoSearchClose}
        onUpdateProviders={onAutoSearchUpdateProviders}
      />
      <EditReleaseInfoModal
        show={edit.show}
        releases={edit.releases}
        onClose={onEditClose}
        onUpdateReleases={onEditUpdateReleases}
      />
      <ConfirmModal
        title="Abort linking"
        confirm="Yes"
        cancel="No"
        onClose={onConfirmClose}
        onConfirm={onConfirmed}
        show={shouldConfirm}
      >
        Are you sure you want to abort the linking with unsubmitted changes?
      </ConfirmModal>
    </>
  );
}

export default LinkFilesTab;
