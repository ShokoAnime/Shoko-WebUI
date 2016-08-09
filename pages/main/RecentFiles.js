import React, {PropTypes} from 'react';
import { connect } from 'react-redux'
import TimeUpdated from './TimeUpdated';
import s from './styles.css';

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
              <tr>
                <td>{i}</td>
                <td>
                  <div className={s['text-wrapper']}>{item}</div>
                </td>
                <td/>
              </tr>
            );
        }
        return (
            <div className={this.props.className}>
                <section className="panel">
                    <header className="panel-heading">
                        Recent files
                        <div className="pull-right"><TimeUpdated className={s['timer']} timestamp={lastUpdated}/></div>
                    </header>
                    <div className={s['fixed-panel']}>
                    <table className="table">
                        <tbody>
                        {files}
                        </tbody>
                    </table>
                    </div>
                </section>
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