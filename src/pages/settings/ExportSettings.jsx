import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { ButtonToolbar, Button, FormControl, Panel, FormGroup, Form, Col } from 'react-bootstrap';
import Events from '../../core/events';
import { settingsJson } from '../../core/actions/settings/Json';

class ExportSettings extends React.Component {
  static propTypes = {
    json: PropTypes.string,
    exportSettings: PropTypes.func,
    importSettings: PropTypes.func,
    updateSettings: PropTypes.func,
  };

  constructor() {
    super();
    this.updateSettings = this.updateSettings.bind(this);
    this.importSettings = this.importSettings.bind(this);
  }

  updateSettings(event) {
    this.props.updateSettings(event.target.value);
  }

  importSettings() {
    const { importSettings, json } = this.props;
    importSettings(json);
  }

  render() {
    const { json, exportSettings } = this.props;
    const header = [
      <span>Settings import / export</span>,
      <h6>WARNING! Importing invalid configuration WILL break your server.</h6>,
    ];
    return (
      <Col md={12}>
        <Panel header={header}>
          <Form>
            <FormGroup>
              <FormControl onChange={this.updateSettings} componentClass="textarea" value={json} />
            </FormGroup>
            <FormGroup>
              <ButtonToolbar>
                <Button onClick={exportSettings} bsStyle="primary">Export</Button>
                <Button onClick={this.importSettings} bsStyle="primary">Import</Button>
              </ButtonToolbar>
            </FormGroup>
          </Form>
        </Panel>
      </Col>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    exportSettings: () => { dispatch({ type: Events.SETTINGS_EXPORT }); },
    importSettings: (value) => { dispatch({ type: Events.SETTINGS_IMPORT, payload: value }); },
    updateSettings: (value) => { dispatch(settingsJson(value)); },
  };
}

function mapStateToProps(state) {
  const { settings } = state;
  const { json } = settings;

  return {
    json,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportSettings);
