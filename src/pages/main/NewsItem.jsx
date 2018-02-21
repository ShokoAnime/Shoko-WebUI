import PropTypes from 'prop-types';
import React from 'react';

class NewsItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    link: PropTypes.string,
    title: PropTypes.string,
    date: PropTypes.string,
  };

  render() {
    const {
      index, link, title, date,
    } = this.props;

    return (
      <tr key={index}>
        <td>
          <a href={link} target="_blank" rel="noopener noreferrer">{title}</a>
        </td>
        <td className="text-right">{date}</td>
      </tr>
    );
  }
}

export default NewsItem;
