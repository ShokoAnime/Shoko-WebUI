import React from 'react';
import { mdiMagnify, mdiPencil, mdiSelectAll, mdiSelection, mdiSelectionRemove, mdiTrayPlus } from '@mdi/js';

import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { LinkState } from '@/core/types/utilities/unrecognized-utility';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

type Props = {
  linkCount: number;
  openSearchDialog: () => void;
  toggleAllSelectedLinks: () => void;
  removeLinks: () => void;
  selectedLinks: ManualLinkType[];
  addLinksToSubmitQueue: () => void;
};

const Menu = (props: Props) => {
  const {
    addLinksToSubmitQueue,
    linkCount,
    openSearchDialog,
    removeLinks,
    selectedLinks,
    toggleAllSelectedLinks,
  } = props;

  return (
    <div className="relative box-border flex grow items-center gap-x-4 overflow-auto whitespace-nowrap rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
      <MenuButton
        onClick={openSearchDialog}
        icon={mdiMagnify}
        name="Search for Release Info"
        keybinding="S"
        disabled={!selectedLinks.length
          || !selectedLinks.some(link => [LinkState.Ready, LinkState.Init].includes(link.state))}
      />

      <MenuButton
        icon={mdiPencil}
        name="Edit Release Info"
        keybinding="E"
        disabled
      />

      <MenuButton
        onClick={toggleAllSelectedLinks}
        icon={selectedLinks.length === linkCount ? mdiSelection : mdiSelectAll}
        name={selectedLinks.length === linkCount ? 'Unselect All' : 'Select All'}
        keybinding="A"
      />

      {(selectedLinks.length > 0
        && !selectedLinks.some(link => [LinkState.Searching, LinkState.Submitting].includes(link.state))) && (
        <MenuButton
          onClick={removeLinks}
          icon={mdiSelectionRemove}
          name="Remove Selected"
          keybinding="D"
        />
      )}

      {selectedLinks.some(link => link.state === LinkState.Ready) && (
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
