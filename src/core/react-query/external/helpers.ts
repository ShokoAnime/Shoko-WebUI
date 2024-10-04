import type { DashboardNewsType } from '@/core/types/api/dashboard';

export const transformShokoNews = (response: { results: DashboardNewsType[] }) => response.results ?? [];
