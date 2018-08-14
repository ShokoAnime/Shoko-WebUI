// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

type Props = {
  lastUpdated?: number,
  title: any,
  description: string,
  isFetching: boolean,
  children: any,
  form: boolean,
  actionName?: string,
  onAction?: () => void
}

class FixedPanel extends React.Component<Props> {
  static propTypes = {
    lastUpdated: PropTypes.number,
    title: PropTypes.any,
    description: PropTypes.string,
    isFetching: PropTypes.bool,
    children: PropTypes.any,
    form: PropTypes.bool,
    actionName: PropTypes.string,
    onAction: PropTypes.func,
  };

  static defaultProps = {
    isFetching: false,
    form: false,
  };

  handleAction = () => {
    const { onAction } = this.props;
    if (typeof onAction === 'function') {
      onAction();
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
      children, title, isFetching, lastUpdated, description, form,
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
        <div className={cx(s['fixed-panel'], form && s.form)}>
          {children}
        </div>
        {lastUpdated || isFetching ? (
          <TimeUpdated
            className={s.timer}
            timestamp={lastUpdated}
            isFetching={isFetching}
          />) : null}
      </section>
    );
  }
}

export default FixedPanel;
