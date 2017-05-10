// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import NewsItem from './NewsItem';

class News extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    items: PropTypes.object,
  };

  render() {
    const { items, className } = this.props;
    const news = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      news.push(<NewsItem key={i} index={i} {...item} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="Shoko News"
          description="Click title to read full article"
        >
          <table className="table news">
            <tbody>
              {news}
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { jmmNews } = state;

  return {
    items: jmmNews,
  };
}

export default connect(mapStateToProps)(News);
