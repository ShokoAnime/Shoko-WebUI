import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Panel, Row, Col } from 'react-bootstrap';

class LogContents extends React.Component {
  static propTypes = {
    lines: PropTypes.array,
    delta: PropTypes.object,
  };

  render() {
    const { lines } = this.props;
    return (
      <Row>
        <Col sm={12}>
          <Panel className="log-panel">{lines.join('\n')}</Panel>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  const { contents } = state.logs;
  const lines = contents.lines || [];

  return {
    lines,
  };
}

export default connect(mapStateToProps)(LogContents);
