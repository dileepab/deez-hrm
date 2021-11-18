import React from "react";
import {Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import {designService} from "../../../services";
import {trackPromise} from "react-promise-tracker";


export default class EditDesign extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            form: {
                name: '',
                description: '',
                type: 1,
                brand: '',
                quantity: 0,
                sewingValue: 0,
                isComplete: false
            },
            modal:{
                show: false,
                title: '',
                body: ''
            },
            validated: false,
            isLoading: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        console.log(this.props.design.name);
        this.setState({
            form: {
                ...this.state.form,
                name: this.props.design.name || '',
                description: this.props.design.description || '',
                type: this.props.design.type || 1,
                brand: this.props.design.brand || '',
                quantity: this.props.design.quantity || 0,
                sewingValue: this.props.design.sewingValue || 0,
                isComplete: this.props.design.isComplete || false,
            }
        })
    }

    handleSubmit = (event, data) => {

        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            this.setState({validated: true});
        } else {
            this.setState({isLoading: true});
            trackPromise(
            designService.editDesign(this.props.design.id, this.state.form).then(
                data => {
                    this.setState({
                        isLoading: false,
                        modal: {
                            ...this.state.modal,
                            show: true,
                            title: 'Success',
                            body: `Design "${this.state.form.name}" Updated successfully`
                        }
                    });
                    this.props.design.description = this.state.form.description;
                    this.props.design.type = this.state.form.type;
                    this.props.design.brand = this.state.form.brand;
                    this.props.design.name = this.state.form.name;
                    this.props.design.quantity = this.state.form.quantity;
                    this.props.design.sewingValue = this.state.form.sewingValue;
                    this.props.design.isComplete = this.state.form.isComplete;
                },
                error => {
                    this.setState({msg: error, isLoading: false});
                    console.error('Error:', error);
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
            type: type,
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

    handleClose = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                show: false
            }
        });
    }

    render() {
        return (

            <Container>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Form.Group as={Row} id="name">
                        <Form.Label column sm="3">
                            Name
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name={'name'} value={this.state.form.name}
                                          onChange={this.handleInputChange}  required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="description">
                        <Form.Label column sm="3">
                            Description
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name={'description'} value={this.state.form.description}
                                          onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="exampleForm.ControlSelect1">
                        <Form.Label column sm="3">Select Design Type</Form.Label>
                        <Col sm="9">
                            <Form.Control as="select" name={'type'} value={this.state.form.type} onChange={this.handleDesignTypeChange}>
                                <option value="1">Sawing</option>
                                <option value="2">Helper</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="exampleForm.ControlSelect2">
                        <Form.Label column sm="3">Select Brand</Form.Label>
                        <Col sm="9">
                            <Form.Control as="select" name={'brand'} value={this.state.form.brand} onChange={this.handleBrandChange} required>
                                <option value=""></option>
                                <option value="nolimit">Nolimit</option>
                                <option value="cleopatra">Cleopatra</option>
                                <option value="modabella">Moda Bella</option>
                                <option value="sample">Sample</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="quantity">
                        <Form.Label column sm="3">
                            Quantity
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type={'number'} name={'quantity'} value={this.state.form.quantity} onChange={this.handleInputChange}/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="sewingValue">
                        <Form.Label column sm="3">
                            Sewing Value
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type={'number'} name={'sewingValue'} value={this.state.form.sewingValue} onChange={this.handleInputChange} required/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} id="quantity">
                        <Col sm="12">
                            <Form.Check type="checkbox" id={'isComplete'} label="Check here for complete the design" name={'isComplete'} checked={this.state.form.isComplete} onChange={this.handleInputChange}/>
                        </Col>
                    </Form.Group>
                    <Button type="submit" disabled={this.state.isLoading} variant={'dark'}>{this.state.isLoading ? 'Loading' : 'Edit Design'}</Button>
                </Form>

                <Modal show={this.state.modal.show} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modal.body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.props.editComplete}>
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}
