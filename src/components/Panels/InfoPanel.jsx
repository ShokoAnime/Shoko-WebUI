// @flow
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import s from './styles.css';

type Props = {
  className: string,
  title: string,
  children: any
}

class InfoPanel extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.any,
  };

  render() {
    const { children, title, className } = this.props;
    return (
      <div className={className}>
        <section className="panel">
          <header className={cx('panel-heading', s.header)}>
            <div className="pull-left">
              {title}
            </div>
            <div className="pull-right">
              <b className="caret" />
            </div>
            <div className="clearfix" />
          </header>
          <div>
            {children}
          </div>
        </section>
      </div>
    );
  }
}

export default InfoPanel;
