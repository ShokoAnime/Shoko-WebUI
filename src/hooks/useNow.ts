import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { dayjs } from '@/core/util';

const useNow = () => {
  const [now, setNow] = useState(() => dayjs());
  useInterval(() => setNow(dayjs()), 30_000);
  return now;
};

export default useNow;
