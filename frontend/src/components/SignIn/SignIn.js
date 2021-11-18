import React from 'react';
import {Form, Button} from 'react-bootstrap';
import {authenticationService} from "../../services";
import {trackPromise} from "react-promise-tracker";

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            msg: ''
        }
    }

    componentDidMount() {
    }

    onFormSubmit = (e) => {
        trackPromise(
        authenticationService.login(this.state.email, this.state.password)
            .then(
                user => {
                    if(user.roles.indexOf('admin') !== -1){
                        this.props.history.replace('/');
                    } else if(user.roles.indexOf('manager') !== -1){
                        this.props.history.replace('/');
                    } else if(user.roles.indexOf('manager') !== -1){
                        this.props.history.replace('/');
                    } else if(user.roles.indexOf('cleo') !== -1){
                        this.props.history.replace('/add-cod');
                    }
                },
                error => {
                    this.setState({msg: error});
                    console.error('Error:', error);
                }
            )
        );

        e.preventDefault();
        e.stopPropagation();
    };

    render() {
        return (
            <div
                style={{height: "calc(100vh - 56px)"}}
                className="d-flex justify-content-center align-items-center"
            >
                <div style={{width: 300}}>
                    <h1 className="text-center">Sign in</h1>
                    <Form onSubmit={this.onFormSubmit}>
                        <span className='text-danger'>{this.state.msg}</span>
                        <Form.Group>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                defaultValue={this.state.email}
                                onChange={e => {
                                    this.setState({email: e.target.value});
                                }}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                defaultValue={this.state.password}
                                onChange={e => {
                                    this.setState({password: e.target.value});
                                }}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 mt-3"
                        >
                            Sign in
                        </Button>
                    </Form>
                </div>
            </div>
        )
    };
};

export default SignIn;