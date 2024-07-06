import { useEffect, useRef } from 'react';
import type { DependencyList, EffectCallback } from 'react';

const useUpdateEffect = (effect: EffectCallback, dependencies: DependencyList) => {
  const isInitialMount = useRef(true);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export default useUpdateEffect;
