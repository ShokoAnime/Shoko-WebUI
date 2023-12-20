import type { ListResultType } from '@/core/types/api';

export const transformListResultSimplified = <T>(response: ListResultType<T>) => response.List;
