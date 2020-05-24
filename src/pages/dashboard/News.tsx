
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import FixedPanel from '../../components/Panels/FixedPanel';
import NewsItem, { NewsItemType } from './NewsItem';


type Props = {
  items: Array<NewsItemType>;
};

class News extends React.Component<Props> {
  static propTypes = {
    items: PropTypes.array.isRequired,
  };

  render() {
    const {
      items,
    } = this.props;
    const news: any[] = [];
    let i = 0;
    forEach(items, (item) => {
      i += 1;
      news.push(<NewsItem key={i} index={i} {...item} />);
    });

    return (
      <FixedPanel title="Shoko News">
        <table className="table-fixed">
          <tbody>{news}</tbody>
        </table>
      </FixedPanel>
    );
  }
}

function mapStateToProps(state) {
  const {
    jmmNews,
  } = state;

  return {
    items: jmmNews,
  };
}

export default connect(mapStateToProps, () => ({}))(News);
