import { produce } from 'immer';

import { ReleaseSource } from '@/core/types/api/file';

import type { FileType, ReleaseInfoType } from '@/core/types/api/file';
import type { ManualLinkProviderType, ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

let lastLinkId = 0;
const generateLinkId = () => {
  if (lastLinkId === Number.MAX_SAFE_INTEGER) {
    lastLinkId = 0;
  }
  lastLinkId += 1;
  return lastLinkId;
};

export const mergeReleaseInfo = (incoming: ReleaseInfoType, original: ReleaseInfoType): ReleaseInfoType =>
  produce(incoming, (draft) => {
    if (draft.Source === ReleaseSource.Unknown && original.Source !== ReleaseSource.Unknown) {
      draft.Source = original.Source;
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

const createLinksFromFiles = (files: FileType[], providers: ManualLinkProviderType[]) => {
  const sortedFiles = files.toSorted((fileA, fileB) => {
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

  const newLinks: Record<number, ManualLinkType> = {};
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
        providers,
        state: 'pre-init',
        release,
      };
    }
  });

  return newLinks;
};

export default createLinksFromFiles;
