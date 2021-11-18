import React from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {designService} from "../../../services";
import {toast} from "react-toastify";
import {trackPromise} from "react-promise-tracker";


export default class AddDesign extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            form: {
                name: '',
                description: '',
                quantity: 1,
                sewingValue: 0,
                type: 1,
                brand: '',
                startTime: new Date(),
                isComplete: false
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
            designService.addDesign(this.state.form)
                .then(
                    data => {
                        this.setState({
                            isLoading: false,
                            form: {
                                ...this.state.form,
                                name: ""
                            },
                        });
                        this.notifySuccess(`Design "${data.name}" added successfully`);
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
        }
        event.preventDefault();
        event.stopPropagation();
    };

    getSawingValueDefault = (type, brand) => {
        let val = 0;
        if(type === 1){
            if(brand === 'nolimit'){
                val = 70
            } else if(brand === 'cleopatra'){
                val = 150
            } else if(brand === 'modabella'){
                val = 250
            } else if(brand === 'sample'){
                val = 250
            }
        } else {
            if(brand === 'nolimit'){
                val = 20
            } else if(brand === 'cleopatra'){
                val = 25
            } else if(brand === 'modabella'){
                val = 25
            } else if(brand === 'sample'){
                val = 25
            }
        }
        return val;
    };

    handleDesignTypeChange = (event) => {
        const target = event.target;
        const type = parseInt(target.value);
        const sewingValue = this.getSawingValueDefault(type, this.state.form.brand)
        const form = {
            ...this.state.form,
            sewingValue: sewingValue,
            type: type
        }
        this.setState({
            form: form,
        });
    }


    handleBrandChange = (event) => {
        const target = event.target;
        const brand = target.value;
        const sewingValue = this.getSawingValueDefault(this.state.form.type, brand)
        const form = {
            ...this.state.form,
            sewingValue: sewingValue,
            brand: brand
        }
        this.setState({
            form: form,
        });
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? (parseInt(target.value) ? parseInt(target.value) : '') : target.value;
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
                <h1>Add Design</h1>
                <br/>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Form.Group as={Row} id="name">
                        <Form.Label column sm="2">
                            Name
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" name={'name'} value={this.state.form.name}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="description">
                        <Form.Label column sm="2">
                            Description
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" name={'description'} value={this.state.form.description}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="exampleForm.ControlSelect1">
                        <Form.Label column sm="2">Select Design Type</Form.Label>
                        <Col sm="10">
                            <Form.Control as="select" name={'type'} onChange={this.handleDesignTypeChange} required>
                                <option value=""/>
                                <option value="1">Sawing</option>
                                <option value="2">Helper</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="exampleForm.ControlSelect2">
                        <Form.Label column sm="2">Select Brand</Form.Label>
                        <Col sm="10">
                            <Form.Control as="select" name={'brand'} value={this.state.form.brand} onChange={this.handleBrandChange} required>
                                <option value=""/>
                                <option value="nolimit">Nolimit</option>
                                <option value="cleopatra">Cleopatra</option>
                                <option value="modabella">Moda Bella</option>
                                <option value="sample">Sample</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="quantity">
                        <Form.Label column sm="2">
                            Quantity
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type={'number'} name={'quantity'} value={this.state.form.quantity} onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="sewingValue">
                        <Form.Label column sm="2">
                            Sewing Value
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type={'number'} name={'sewingValue'} value={this.state.form.sewingValue} onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>
                    <Button type="submit" disabled={this.state.isLoading} variant={'dark'}>{this.state.isLoading ? 'Loading' : 'Add Design'}</Button>
                </Form>

            </Container>
        );
    }
}
