import React, {PropTypes} from 'react';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';
import cx from 'classnames';

class FixedPanel extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    lastUpdated: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    isFetching: PropTypes.bool
  };

  render() {
    const {children, title, isFetching, lastUpdated, description} = this.props;
    return (
      <section className="panel">
        <header className={cx("panel-heading",s['header'])}>
          <div className="pull-left">
          {title}<h6>{description}</h6>
          </div>
          <div className="pull-right">
            <a className="btn btn-primary pull-right">Action</a>
          </div>
          <div className="clearfix"/>
        </header>
        <div className={s['fixed-panel']}>
          {children}
        </div>
        <TimeUpdated className={s['timer']} timestamp={lastUpdated}/>
      </section>
    );
  }
}

export default FixedPanel
