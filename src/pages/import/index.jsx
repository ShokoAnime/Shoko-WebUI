// @flow
import React from 'react';
import { connect } from 'react-redux';
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
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <ImportFolders
                description="Location, Type, Provider and Status"
                className="col-sm-4"
              />
              <ImportFolderSeries className="col-sm-8" />
            </div>
          </section>
        </section>
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
