import React from 'react';

class Notifications extends React.Component {
    render() {
        const { count } = this.props;
        return (
            <li className="notification">
                <a className="dropdown-toggle" href="#">
                    <i className="fa fa-bell-o"/>
                    {count == null?null:<span className="badge bg-warning">{count}</span>}
                </a>
            </li>
        );
    }
}

export default Notifications;