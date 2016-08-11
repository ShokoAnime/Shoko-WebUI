import React, {PropTypes} from 'react';
import {connect} from 'react-redux'
import FixedPanel from '../../components/Panels/FixedPanel';

class News extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    const {items, isFetching, lastUpdated} = this.props;
    let news = [];
    let i = 0;
    for (let key in items) {
      let item = items[key];
      i++;
      news.push(<tr key={i}>
        <td><a href={item.link} target="_blank">{item.title}</a></td>
        <td className="text-right">{item.date}</td>
      </tr>);
    }

    return (
      <div className={this.props.className}>
        <FixedPanel title="JMM News" lastUpdated={lastUpdated}>
          <table className="table">
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
  const {jmmNews} = state;
  const {
    isFetching,
    lastUpdated,
    items: items
  } = jmmNews || {
    isFetching: true,
    items: []
  };

  return {
    items,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(News)
