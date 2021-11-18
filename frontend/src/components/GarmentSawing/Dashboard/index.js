import React from "react";

import {Link} from "react-router-dom";
import {Button, ButtonToolbar} from "react-bootstrap";

export default class Dashboard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <Link to="/counter">Redux Counter</Link>
                <ButtonToolbar>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="info">Info</Button>
                    <Button variant="light">Light</Button>
                    <Button variant="dark">Dark</Button>
                    <Button variant="link">Link</Button>
                </ButtonToolbar>
            </div>
        );
    }
}
