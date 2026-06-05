import { dayjs } from '@/core/util';

export const formatPluginDate = (date: string) => dayjs(date).format('MMMM Do, YYYY');
