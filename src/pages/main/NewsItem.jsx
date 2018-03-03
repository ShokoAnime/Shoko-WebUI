// @flow
import PropTypes from 'prop-types';
import React from 'react';

export type NewsItemType = {
  link: string,
  title: string,
  date: string,
}

type Props = NewsItemType & {
  index: number,
}

class NewsItem extends React.Component<Props> {
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
