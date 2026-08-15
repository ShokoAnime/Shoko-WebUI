import { mdiMagnify, mdiPencil, mdiSelectAll, mdiSelection, mdiSelectionRemove, mdiTrayPlus } from '@mdi/js';

import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';

import type { ManualLinkType } from '@/core/types/utilities/link-files-with-providers';

type Props = {
  linkCount: number;
  openSearchDialog: () => void;
  toggleAllSelectedLinks: () => void;
  removeLinks: () => void;
  selectedLinks: ManualLinkType[];
  addLinksToSubmitQueue: () => void;
  onEditReleaseInfo: () => void;
};

const Menu = (props: Props) => {
  const {
    addLinksToSubmitQueue,
    linkCount,
    onEditReleaseInfo,
    openSearchDialog,
    removeLinks,
    selectedLinks,
    toggleAllSelectedLinks,
  } = props;

  const releaseActionsDisabled = !selectedLinks.length
    || !selectedLinks.some(link => ['ready', 'init', 'fetching'].includes(link.state));

  return (
    <div className="relative box-border flex grow items-center gap-x-4 overflow-auto rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 whitespace-nowrap">
      <MenuButton
        onClick={openSearchDialog}
        icon={mdiMagnify}
        name="Search for Release Info"
        keybinding="S"
        disabled={releaseActionsDisabled}
      />

      <MenuButton
        onClick={onEditReleaseInfo}
        icon={mdiPencil}
        name="Edit Release Info"
        keybinding="E"
        disabled={releaseActionsDisabled}
      />

      <MenuButton
        onClick={toggleAllSelectedLinks}
        icon={selectedLinks.length === linkCount ? mdiSelection : mdiSelectAll}
        name={selectedLinks.length === linkCount ? 'Unselect All' : 'Select All'}
        keybinding="A"
      />

      {(selectedLinks.length > 0
        && !selectedLinks.some(link => ['searching', 'submitting'].includes(link.state))) && (
        <MenuButton
          onClick={removeLinks}
          icon={mdiSelectionRemove}
          name="Remove Selected"
          keybinding="D"
        />
      )}

      {selectedLinks.some(link => link.state === 'ready') && (
        <MenuButton
          onClick={addLinksToSubmitQueue}
          icon={mdiTrayPlus}
          name="Submit Selected"
          keybinding="Q"
        />
      )}
    </div>
  );
};

export default Menu;
