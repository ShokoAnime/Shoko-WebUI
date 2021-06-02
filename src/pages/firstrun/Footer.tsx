import React from 'react';
import { useDispatch } from 'react-redux';
import { goBack, push, replace } from 'connected-react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
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
    <div className="flex justify-between text-lg">
      <div className={cx(['flex items-center', status?.type === 'error' ? 'color-danger' : 'color-highlight-1'])}>
        {status?.text}
      </div>
      <div className="flex">
        <Button onClick={() => dispatch(goBack())} className="flex bg-color-highlight-1 py-2 px-3 mr-4 items-center font-semibold" disabled={prevDisabled}>Back</Button>
        {finish ? (
          <Button onClick={() => dispatch(replace({ pathname: '/' }))} className="bg-color-highlight-1 py-2 px-3" disabled={nextDisabled}>Finish</Button>
        ) : (
          <Button onClick={() => handleNext()} className="flex bg-color-highlight-1 py-2 px-3 items-center font-semibold" disabled={nextDisabled || isFetching}>
            {isFetching ? (<FontAwesomeIcon icon={faCircleNotch} spin className="text-xl mx-2" />) : 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default Footer;
