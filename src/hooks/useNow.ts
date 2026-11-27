import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { dayjs } from '@/core/util';

/** The current time, which moves on with the minute: the countdowns are in minutes, so a tick within one changes nothing. */
const useNow = () => {
  const [now, setNow] = useState(() => dayjs());
  useInterval(() =>
    setNow((previous) => {
      const next = dayjs();
      return next.isSame(previous, 'minute') ? previous : next;
    }), 30_000);
  return now;
};

export default useNow;
