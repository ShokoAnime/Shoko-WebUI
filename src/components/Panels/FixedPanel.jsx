import React, { PropTypes } from 'react';
import cx from 'classnames';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

class FixedPanel extends React.Component {
  static propTypes = {
    lastUpdated: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    isFetching: PropTypes.bool,
    children: PropTypes.any,
    actionName: PropTypes.string,
    onAction: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleAction = this.handleAction.bind(this);
  }

  handleAction() {
    if (typeof this.props.onAction === 'function') {
      this.props.onAction();
    }
  }

  render() {
    const { children, title, isFetching, lastUpdated, description, actionName } = this.props;
    return (
      <section className="panel">
        <header className={cx('panel-heading', s.header)}>
          <div className="pull-left">
            {title}<h6>{description}</h6>
          </div>
          {actionName ? <div className="pull-right">
            <a className="btn btn-primary pull-right" onClick={this.handleAction}>{actionName}</a>
          </div> : null}
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
