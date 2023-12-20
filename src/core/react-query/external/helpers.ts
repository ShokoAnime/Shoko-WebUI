import type { DashboardNewsType } from '@/core/types/api/dashboard';

export const transformShokoNews = (response: { items: DashboardNewsType[] }) => response.items ?? [];
