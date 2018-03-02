// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

type Props = {
  lastUpdated?: number,
  title: string,
  description: string,
  isFetching: bool,
  children: any,
  actionName?: string,
  onAction?: () => void
}

class FixedPanel extends React.Component<Props> {
  static propTypes = {
    lastUpdated: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    isFetching: PropTypes.bool,
    children: PropTypes.any,
    actionName: PropTypes.string,
    onAction: PropTypes.func,
  };

  handleAction = () => {
    if (typeof this.props.onAction === 'function') {
      this.props.onAction();
    }
  };

  renderButton() {
    const { actionName } = this.props;
    if (!actionName) { return null; }
    return (
      <div className="pull-right">
        <a className="btn btn-primary pull-right" onClick={this.handleAction}>{actionName}</a>
      </div>
    );
  }

  render() {
    const {
      children, title, isFetching, lastUpdated, description,
    } = this.props;
    return (
      <section className="panel">
        <header className={cx('panel-heading', s.header)}>
          <div className="pull-left">
            {title}<h6>{description}</h6>
          </div>
          {this.renderButton()}
          <div className="clearfix" />
        </header>
        <div className={s['fixed-panel']}>
          {children}
        </div>
        {lastUpdated || isFetching ? <TimeUpdated
          className={s.timer}
          timestamp={lastUpdated}
          isFetching={isFetching}
        /> : null}
      </section>
    );
  }
}

export default FixedPanel;
