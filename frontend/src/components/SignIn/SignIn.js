import {React, useState} from 'react';
import {Form, Button} from 'react-bootstrap';
import {authenticationService} from "../../services";
import {trackPromise} from "react-promise-tracker";
import {useNavigate} from 'react-router-dom';

const SignIn = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg] = useState('')

    const navigate = useNavigate()


    const onFormSubmit = (e) => {
        trackPromise(
        authenticationService.login(email, password)
            .then(
                user => {
                    if(user.roles.indexOf('admin') !== -1){
                        navigate('/');
                    } else if(user.roles.indexOf('manager') !== -1){
                        navigate('/');
                    } else if(user.roles.indexOf('manager') !== -1){
                        navigate('/');
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

    return (
        <div
            style={{height: "calc(100vh - 56px)"}}
            className="d-flex justify-content-center align-items-center"
        >
            <div style={{width: 300}}>
                <h1 className="text-center">Sign in</h1>
                <Form onSubmit={onFormSubmit}>
                    <span className='text-danger'>{msg}</span>
                    <Form.Group>
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            defaultValue={email}
                            onChange={e => {
                                setEmail(e.target.value);
                            }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            defaultValue={password}
                            onChange={e => {
                                setPassword(e.target.value);
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

export default SignIn;
