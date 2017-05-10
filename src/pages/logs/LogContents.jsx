// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach, escapeRegExp } from 'lodash';
import { Panel, Row, Col, Label } from 'react-bootstrap';

class LogContents extends React.Component {
  static propTypes = {
    lines: PropTypes.array,
  };

  render() {
    const { lines } = this.props;
    return (
      <Row>
        <Col sm={12}>
          <Panel className="log-panel">{lines.reverse().map(item => (
            <p><Label>{item.stamp}</Label>{' '}<Label bsStyle="primary">{item.tag}</Label>{' '}{item.text}</p>
          ))}
          </Panel>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  const { contents, filters, keyword } = state.logs;
  const rawLines = contents.lines || [];

  const lines = [];
  let keywordRegex = null;
  if (keyword !== '') {
    keywordRegex = new RegExp(escapeRegExp(keyword));
  }
  forEach(rawLines, (item) => {
    if (item.tag && filters.tags[item.tag.toLowerCase()] !== false) {
      if (keywordRegex === null) {
        lines.push(item);
      } else {
        keywordRegex.lastIndex = 0;
        if (keywordRegex.test(item.text)) {
          lines.push(item);
        }
      }
    }
  });

  return {
    lines,
  };
}

export default connect(mapStateToProps)(LogContents);
