import { createContext, useContext } from 'react';

export const BodyVisibleContext = createContext(false);

const useBodyVisibleContext = () => useContext(BodyVisibleContext);

export default useBodyVisibleContext;
