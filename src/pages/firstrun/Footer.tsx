import React from 'react';
import { useNavigate } from 'react-router-dom';
import cx from 'classnames';

import Button from '@/components/Input/Button';

import type { TestStatusType } from '@/core/slices/firstrun';

type Props = {
  nextPage?: string,
  prevDisabled?: boolean,
  nextDisabled?: boolean,
  isFetching?: boolean,
  finish?: boolean,
  status?: TestStatusType,
  saveFunction?: () => void,
};

function Footer(props: Props) {
  const navigate = useNavigate();

  const handleNext = () => {
    const { nextPage, saveFunction } = props;
    if (saveFunction) saveFunction();
    if (nextPage) navigate(`../${nextPage}`);
  };

  const {
    finish, status, prevDisabled, nextDisabled, isFetching,
  } = props;

  return (
    <div className="flex flex-col text-lg">
      <div className={cx(['flex items-center mb-5', status?.type === 'error' ? 'text-panel-warning' : 'text-panel-important'])}>
        {status?.text}
      </div>
      <div className="flex justify-between font-semibold">
        <Button onClick={() => navigate(-1)} buttonType="primary" className="py-2 w-1/2 mr-6" disabled={prevDisabled}>Back</Button>
        {finish ? (
          <Button onClick={() => navigate('/', { replace: true })} buttonType="primary" className="py-2 w-1/2 ml-6" disabled={nextDisabled}>Finish</Button>
        ) : (
          <Button onClick={() => handleNext()} buttonType="primary" className="py-2 w-1/2 ml-6" disabled={nextDisabled || isFetching} loading={isFetching}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default Footer;
