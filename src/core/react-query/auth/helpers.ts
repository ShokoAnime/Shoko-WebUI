import store from '@/core/store';

import type { AuthToken } from '@/core/types/api/authToken';

export const transformApiKeys = (response: AuthToken[]) =>
  response.filter(key => key.Username === store.getState().apiSession.username);
