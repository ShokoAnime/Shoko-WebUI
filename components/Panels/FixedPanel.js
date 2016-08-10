import React, {PropTypes} from 'react';
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

class FixedPanel extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    lastUpdated: PropTypes.number,
    title: PropTypes.string,
    isFetching: PropTypes.bool
  };

  render() {
    const {children, title, isFetching, lastUpdated} = this.props;
    return (
      <section className="panel">
        <header className="panel-heading">
          {title}
          <div className="pull-right"><TimeUpdated className={s['timer']} timestamp={lastUpdated}/></div>
        </header>
        <div className={s['fixed-panel']}>
          {children}
        </div>
      </section>
    );
  }
}

export default FixedPanel
