import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import cx from 'classnames';
import FixedPanel from '../../components/Panels/FixedPanel';
import s from '../../components/Panels/styles.css';

class RecentFiles extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        const { items, isFetching, lastUpdated } = this.props;
        let files = [];
        let i=0;
        for (let key in items) {
            let item = items[key];
            i++;
            files.push(
              <tr key={item.id}>
                <td>{i}</td>
                <td>
                  <div className={s['text-wrapper']}>{item.path}</div>
                </td>
                  <td className="text-right">
                      <span className={cx("badge",item.success?"bg-success":"bg-important")}>{item.success?"Imported":"Error"}</span>
                  </td>
                <td/>
              </tr>
            );
        }
        return (
            <div className={this.props.className}>
                <FixedPanel title="Recent files" description="List of recently added files and their import status" lastUpdated={lastUpdated} isFetching={isFetching}>
                    <table className="table">
                        <tbody>
                        {files}
                        </tbody>
                    </table>
                </FixedPanel>
            </div>
    );
    }
}

function mapStateToProps(state) {
    const { recentFiles } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = recentFiles || {
        isFetching: true,
        items: []
    };

    return {
        items,
        isFetching,
        lastUpdated
    }
}

export default connect(mapStateToProps)(RecentFiles)