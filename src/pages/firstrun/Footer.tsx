import React from 'react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { useRunActionMutation } from '@/core/react-query/action/mutations';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { TestStatusType } from '@/core/slices/firstrun';

type Props = {
  nextPage?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  isFetching?: boolean;
  finish?: boolean;
  status?: TestStatusType;
  saveFunction?: () => void;
};

const Footer = (props: Props) => {
  const navigate = useNavigateVoid();

  const { mutate: runAction } = useRunActionMutation();

  const handleNext = useEventCallback(() => {
    const { nextPage, saveFunction } = props;
    if (saveFunction) saveFunction();
    if (nextPage) navigate(`../${nextPage}`);
  });

  const handleFinish = useEventCallback(() => {
    runAction('RunImport');
    navigate('/webui/dashboard', { replace: true, state: { firstRun: true } });
  });

  const {
    finish,
    isFetching,
    nextDisabled,
    prevDisabled,
    status,
  } = props;

  return (
    <div className="flex flex-col text-lg">
      <div
        className={cx([
          'flex items-center mb-5',
          status?.type === 'error' ? 'text-panel-text-danger' : 'text-panel-text-important',
        ])}
      >
        {status?.text}
      </div>
      <div className="flex justify-between font-semibold">
        <Button onClick={() => navigate(-1)} buttonType="primary" className="mr-6 w-1/2 py-2" disabled={prevDisabled}>
          Back
        </Button>
        {finish
          ? (
            <Button
              onClick={handleFinish}
              buttonType="primary"
              className="w-1/2 px-4 py-2"
              disabled={nextDisabled}
            >
              Finish
            </Button>
          )
          : (
            <Button
              onClick={() => handleNext()}
              buttonType="primary"
              className="w-1/2 px-4 py-2"
              disabled={nextDisabled || isFetching}
              loading={isFetching}
            >
              Next
            </Button>
          )}
      </div>
    </div>
  );
};

export default Footer;
