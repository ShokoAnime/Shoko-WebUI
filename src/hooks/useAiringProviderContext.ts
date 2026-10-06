import { createContext, useContext } from 'react';

import type { AiringScheduleProviderType } from '@/core/types/api/airing-schedule';

/**
 * The airing schedule providers by ID, read once by the page and shared with its entries and cards, so a long list
 * does not subscribe to the providers once per item. Until they are in, or without a page providing them, no provider
 * is known.
 */
export const AiringProvidersContext = createContext<ReadonlyMap<string, AiringScheduleProviderType> | undefined>(
  undefined,
);

/** The airing schedule provider with the ID, from the page's {@link AiringProvidersContext}. */
const useAiringProviderContext = (providerId: string | undefined) => {
  const providers = useContext(AiringProvidersContext);
  return providerId ? providers?.get(providerId) : undefined;
};

export default useAiringProviderContext;
