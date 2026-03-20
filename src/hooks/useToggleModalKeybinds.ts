import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

type HotkeyScopesType = 'primary' | 'modal' | 'nested-modal';

const allScopes: HotkeyScopesType[] = ['primary', 'modal', 'nested-modal'];

const useToggleModalKeybinds = (enable: boolean, scope: HotkeyScopesType) => {
  const { disableScope, enableScope } = useHotkeysContext();

  useEffect(() => {
    if (!enable) return;

    allScopes.forEach(disableScope);
    enableScope(scope);
  }, [disableScope, enable, enableScope, scope]);
};

export default useToggleModalKeybinds;
