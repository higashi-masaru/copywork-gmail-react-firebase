import { useEffect } from 'react';

/* eslint-disable import/prefer-default-export */

/* eslint-disable react-hooks/exhaustive-deps */
export const useMount = (f: React.EffectCallback, cleanup?: () => void): void =>
  useEffect(() => {
    f();
    return cleanup;
  }, []); // []: 重要：deps が空であることで１回だけ実行される
/* eslint-enable react-hooks/exhaustive-deps */
