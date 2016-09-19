import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import NewsItem from './NewsItem';

class News extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    items: PropTypes.array,
  };

  render() {
    const { items, isFetching, lastUpdated, className } = this.props;
    const news = [];
    let i = 0;
    forEach(items, (item) => {
      i++;
      news.push(<NewsItem key={i} index={i} {...item} />);
    });

    return (
      <div className={className}>
        <FixedPanel
          title="JMM News"
          description="Click title to read full article"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
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
  const {
    isFetching,
    lastUpdated,
    items,
  } = jmmNews || {
    isFetching: true,
    items: [],
  };

  return {
    items,
    isFetching,
    lastUpdated,
  };
}

export default connect(mapStateToProps)(News);
