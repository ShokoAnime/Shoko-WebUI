import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Panel, Checkbox, Button, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import store from '../../core/store';
import { setFilters, setKeyword } from '../../core/actions/logs/Filters';

class LogSettings extends React.Component {
  static propTypes = {
    keyword: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.applySettings = this.applySettings.bind(this);
    this.updateKeyword = this.updateKeyword.bind(this);
    this.state = {
      keyword: this.props.keyword,
    };
  }

  applySettings() {
    const state = store.getState();
    const { tags } = state.logs.filters;
    const filterValues = {
      error: this.cbError.checked,
      info: this.cbInfo.checked,
      trace: this.cbTrace.checked,
    };

    const updatedFilters = Object.assign({}, tags, filterValues);
    store.dispatch(setFilters(updatedFilters));
    store.dispatch(setKeyword(this.state.keyword));
  }

  updateKeyword(event) {
    const keyword = event.target.value;
    this.setState({ keyword });
  }

  render() {
    return (
      <Panel>
        <Form inline>
          <FormGroup controlId="keyword">
            <ControlLabel>Filter by</ControlLabel>
            {' '}
            <FormControl
              onChange={this.updateKeyword}
              type="text"
              placeholder="keyword"
            />
          </FormGroup>
          <FormGroup controlId="tags">
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbError = ref; }}>
              Errors
            </Checkbox>
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbInfo = ref; }}>
              Info
            </Checkbox>
            <Checkbox inline defaultChecked inputRef={(ref) => { this.cbTrace = ref; }}>
              Trace
            </Checkbox>
          </FormGroup>
          <Button onClick={this.applySettings} style={{ marginLeft: '10px' }}>Apply</Button>
        </Form>
      </Panel>
    );
  }
}

function mapStateToProps(state) {
  const { keyword } = state.logs;

  return {
    keyword,
  };
}

export default connect(mapStateToProps)(LogSettings);
