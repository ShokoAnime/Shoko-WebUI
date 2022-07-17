import React from 'react';
import { useDispatch } from 'react-redux';
import { goBack, push, replace } from 'connected-react-router';
import cx from 'classnames';

import Button from '../../components/Input/Button';

import type { TestStatusType } from '../../core/slices/firstrun';

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
  const dispatch = useDispatch();

  const handleNext = () => {
    const { nextPage, saveFunction } = props;
    if (saveFunction) saveFunction();
    if (nextPage) dispatch(push(nextPage));
  };

  const {
    finish, status, prevDisabled, nextDisabled, isFetching,
  } = props;

  return (
    <div className="flex flex-col text-lg">
      <div className={cx(['flex items-center mb-5', status?.type === 'error' ? 'text-highlight-3' : 'text-highlight-2'])}>
        {status?.text}
      </div>
      <div className="flex justify-between">
        <Button onClick={() => dispatch(goBack())} className="bg-primary py-2 w-1/2 mr-6" disabled={prevDisabled}>Back</Button>
        {finish ? (
          <Button onClick={() => dispatch(replace({ pathname: '/' }))} className="bg-primary py-2 w-1/2 ml-6" disabled={nextDisabled}>Finish</Button>
        ) : (
          <Button onClick={() => handleNext()} className="bg-primary py-2 w-1/2 ml-6" disabled={nextDisabled || isFetching} loading={isFetching}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default Footer;
