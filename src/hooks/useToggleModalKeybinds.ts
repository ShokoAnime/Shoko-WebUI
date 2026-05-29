import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

const useToggleModalKeybinds = (show: boolean, nestedModal?: boolean) => {
  const { disableScope, enableScope } = useHotkeysContext();

  useEffect(() => {
    if (nestedModal) {
      disableScope('primary');
      disableScope('modal');
      enableScope('nested-modal');
      return;
    }

    if (show) {
      disableScope('primary');
      disableScope('nested-modal');
      enableScope('modal');
      return;
    }

    disableScope('nested-modal');
    disableScope('modal');
    enableScope('primary');
  }, [disableScope, enableScope, nestedModal, show]);
};

export default useToggleModalKeybinds;
