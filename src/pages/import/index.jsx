// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Columns, Section } from 'react-bulma-components';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import Overview from '../dashboard/Overview';
import ImportFolders from '../dashboard/ImportFolders';
import ImportFolderSeries from './ImportFolderSeries';

type Props = {
  load: () => void,
}

class ImportFoldersPage extends React.Component<Props> {
  componentDidMount() {
    const { load } = this.props;
    load();
  }

  render() {
    return (
      <Layout>
        <Section className="import-folders page-wrap">
          <Overview />
          <Columns>
            <Columns.Column>
              <ImportFolders
                description="Location, Type, Provider and Status"
              />
            </Columns.Column>
            <Columns.Column>
              <ImportFolderSeries />
            </Columns.Column>
          </Columns>
        </Section>
      </Layout>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    load: () => dispatch({ type: Events.PAGE_IMPORT_FOLDERS_LOAD, payload: null }),
  };
}

export default connect(null, mapDispatchToProps)(ImportFoldersPage);
