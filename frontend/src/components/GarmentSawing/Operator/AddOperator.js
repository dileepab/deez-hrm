import React from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {operatorService} from "../../../services";
import {toast} from "react-toastify";
import {trackPromise} from "react-promise-tracker";


export default class AddOperator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            form: {
                name: '',
                fullName: '',
                team: '1',
                type: '1',
                isQC: false,
                nationalId: '',
                bankAccount: '',
                bank: '',
                distance: '',
                startDate: new Date(),
                resignDate: '',
            },
            validated: false,
            isLoading: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }


    notifyError = (error) => toast.error(error);
    notifySuccess = (msg) => toast.success(msg);

    handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true});
        } else {
            this.setState({isLoading: true});
            trackPromise(
                operatorService.addOperator(this.state.form).then(
                    data => {
                        this.setState({
                            isLoading: false,
                            form: {
                                ...this.state.form,
                                name: '',
                                fullName: '',
                                team: '1',
                                type: '1',
                                isQC: false,
                                nationalId: '',
                                bankAccount: '',
                                bank: '',
                                distance: '',
                            }
                        });
                        this.notifySuccess(`Operator "${data.name}" added successfully`);

                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
        }
        event.preventDefault();
        event.stopPropagation();
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        console.log(name);

        this.setState({
            form: {
                ...this.state.form,
                [name]: value
            }
        });
    }


    render() {
        return (

            <Container>
                <br/>
                <h2>Add Operator</h2>
                <br/>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Form.Group as={Row} className="mb-3" id="name">
                        <Form.Label column sm="4">
                            Name
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'name'} value={this.state.form.name}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="fullName">
                        <Form.Label column sm="4">
                            Full Name (with initials)
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'fullName'} value={this.state.form.fullName}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="team">
                        <Form.Label column sm="4">
                            Team
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control name={'team'} as="select" defaultValue={this.state.form.team}
                                          onChange={this.handleInputChange}>
                                <option value={'1'}>1</option>
                                <option value={'2'}>2</option>
                                <option value={'3'}>3</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="type">
                        <Form.Label column sm="4">Select Operator Type</Form.Label>
                        <Col sm="8">
                            <Form.Control as="select" name={'type'} defaultValue={this.state.form.type}
                                          onChange={this.handleInputChange}>
                                <option value="1">Machine Operator</option>
                                <option value="2">Helper</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    {this.state.form.type === '2' &&
                    <Form.Group as={Row} id="type">
                        <Form.Label column sm="4">Is QC?</Form.Label>
                        <Col sm="8">
                            <Form.Check name={'isQC'} type="checkbox" label=""
                                        checked={this.state.form.isQC} onChange={this.handleInputChange}/>
                        </Col>
                    </Form.Group>
                    }

                    <Form.Group as={Row} className="mb-3" id="nationalId">
                        <Form.Label column sm="4">National Id</Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'nationalId'} value={this.state.form.nationalId}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="bank">
                        <Form.Label column sm="4">Bank Name</Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'bank'} value={this.state.form.bank}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="bankAccount">
                        <Form.Label column sm="4">Bank Account Number</Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'bankAccount'} value={this.state.form.bankAccount}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" id="distance">
                        <Form.Label column sm="4">Distance (KM)</Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={'distance'} value={this.state.form.distance}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Button type="submit" className="mt-3" disabled={this.state.isLoading}
                            variant={'dark'}>{this.state.isLoading ? 'Loading' : 'Add Operator'}</Button>
                </Form>

            </Container>
        );
    }
}
