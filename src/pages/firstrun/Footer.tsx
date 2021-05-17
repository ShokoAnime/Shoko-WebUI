import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { goBack, push, replace } from 'connected-react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import cx from 'classnames';

import Button from '../../components/Input/Button';

import type { TestStatusType } from '../../core/slices/firstrun';

class Footer extends React.Component<Props> {
  handleNext = () => {
    const { nextPage, saveFunction: saveFunc, changePage } = this.props;
    if (saveFunc) saveFunc();
    if (nextPage) changePage(nextPage);
  };

  render() {
    const {
      prevDisabled, nextDisabled, finish, finishSetup,
      isFetching, status, goToPrevPage,
    } = this.props;

    return (
      <div className="flex justify-between text-lg">
        <div className={cx(['flex items-center', status?.type === 'error' ? 'color-danger' : 'color-highlight-1'])}>
          {status?.text}
        </div>
        <div className="flex">
          <Button onClick={() => goToPrevPage()} className="flex bg-color-highlight-1 py-2 px-3 mr-4 items-center font-semibold" disabled={prevDisabled}>Back</Button>
          {finish ? (
            <Button onClick={() => finishSetup()} className="bg-color-highlight-1 py-2 px-3" disabled={nextDisabled}>Finish</Button>
          ) : (
            <Button onClick={() => this.handleNext()} className="flex bg-color-highlight-1 py-2 px-3 items-center font-semibold" disabled={nextDisabled || isFetching}>
              {isFetching ? (<FontAwesomeIcon icon={faCircleNotch} spin className="text-xl mx-2" />) : 'Next'}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

const mapState = () => ({});

const mapDispatch = {
  goToPrevPage: () => (goBack()),
  changePage: (page: string) => (push(page)),
  finishSetup: () => (replace({ pathname: '/' })),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & {
  nextPage?: string,
  prevDisabled?: boolean,
  nextDisabled?: boolean,
  isFetching?: boolean,
  finish?: boolean,
  status?: TestStatusType,
  saveFunction?: () => void,
};

export default connector(Footer);
