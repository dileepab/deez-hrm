import React, {Fragment} from "react";
import {Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import {faClock, faPlus, faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Timer from "react-compound-timer";
import {designService, operationService} from "../../../services";
import {trackPromise} from "react-promise-tracker";


export default class AddOperation extends React.Component {

    constructor(props) {
        super(props);
        this.userTimer = React.createRef();
        this.state = {
            designs: [],
            selectedDesign: false,
            selectedOperationIndex: false,
            form: [
                {
                    name: '',
                    description: '',
                    estimatedTime: '',
                    designId: null,
                }
            ],
            modal: {
                show: false,
                title: '',
                body: ''
            },
            timerModal: false,
            validated: false,
            isLoading: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        this.fetchDesigns();
    }

    fetchDesigns() {
        trackPromise(
        designService.getIncompleteDesignsWithOperations().then(
            data => {
                let operations = data[0] && data[0].steps ? data[0].steps : [{
                    name: '',
                    description: '',
                    estimatedTime: 0,
                    designId: data[0] ? data[0].id : undefined
                }];
                this.setState({
                    designs: data,
                    selectedDesign: data[0],
                    form: operations
                });
            },
            error => {
                this.setState({msg: error});
                console.error('Error:', error);
            }
        ));
    }

    handleAddOperation = () => {
        const values = [...this.state.form];
        values.unshift({name: '', description: '', estimatedTime: 0, designId: this.state.selectedDesign.id});
        this.setState({
            form: values
        });
    };

    handleRemoveOperation = (index, isInDb) => {
        const values = [...this.state.form];
        values.splice(index, 1);
        this.setState({
            form: values
        });
    };

    handleUpdateOperation = (index, event) => {
        if (!this.state.selectedDesign) {
            event.preventDefault();
            event.stopPropagation();
            return false
        }
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true});
        } else {
            this.setState({isLoading: true});

            const operation = this.state.form[index];
            delete operation.isChange;
            trackPromise(
            operationService.updateOperations(operation.id, operation).then(
                data => {
                    let values = this.state.form;
                    values[index].isChange = false;
                    values[index].id = data.id;
                    this.setState({
                        isLoading: false,
                        form: values,
                        modal: {
                            ...this.state.modal,
                            show: true,
                            title: 'Success',
                            body: `Operation "${data.name}" Added Successfully`
                        }
                    });
                },
                error => {
                    this.setState({msg: error});
                    console.error('Error:', error);
                }
            ));
        }
        event.preventDefault();
        event.stopPropagation();
    };

    handleCreateOperation = (index, event) => {
        if (!this.state.selectedDesign) {
            event.preventDefault();
            event.stopPropagation();
            return false
        }
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true});
        } else {
            this.setState({isLoading: true});

            const operation = this.state.form[index];
            delete operation.isChange;
            trackPromise(
            operationService.addOperations(operation).then(
                data => {
                    let values = this.state.form;
                    values[index].isChange = false;
                    values[index].id = data.id;
                    this.setState({
                        isLoading: false,
                        form: values,
                        modal: {
                            ...this.state.modal,
                            show: true,
                            title: 'Success',
                            body: `Operation "${data.name}" Added Successfully`
                        }
                    });
                },
                error => {
                    this.setState({msg: error});
                    console.error('Error:', error);
                }
            ));
        }
        event.preventDefault();
        event.stopPropagation();
    };

    handleInputChange = (index, event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? (parseInt(target.value) ? parseInt(target.value) : '') : target.value;
        const name = target.name;

        let values = this.state.form;
        values[index][name] = value;
        values[index].isChange = value !== '';
        this.setState({
            form: values
        });
    }

    handleDesignChange = (event) => {
        const target = event.target;
        const index = target.value;

        if (index === '') {
            this.setState({
                form: [],
                selectedDesign: false
            });
            return false;
        }
        const design = this.state.designs[index];

        const operations = design.steps ? design.steps : [{
            name: '',
            description: '1',
            estimatedTime: 0,
            designId: design.id,
        }]
        this.setState({
            form: operations,
            selectedDesign: design
        });
    }

    handleTimer = (index) => {
        this.setState({
            timerModal: true,
            selectedOperationIndex: index
        })
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
                <br/>
                <h2>Add Operations</h2>
                <br/>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Select Design</Form.Label>
                        <Form.Control as="select" onChange={this.handleDesignChange}>
                            {this.state.designs.length > 0 && this.state.designs.map((design, index) => (
                                <option value={index} key={index}>{design.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    {this.state.form.length > 0 && this.state.form.map((inputField, index) => (
                        <Fragment key={index}>
                            <Row className={'align-items-center no-gutters'}>
                                <h5 className={'mr-2'}>Operation {index + 1} --</h5><h6 className={'mr-2'}> Hourly
                                Target </h6><h6 className={'mr-2'}> (Idle)
                                = {Math.floor(3600 / inputField.estimatedTime)}, </h6><h6 className={'mr-2'}> (Minimum)
                                = {Math.floor((3600 / inputField.estimatedTime) * .8)}</h6>
                            </Row>
                            <hr className={'mt-0'}/>
                            <Form.Group as={Row}>
                                <Col sm={12} md={3} className={'mb-2'}>
                                    <Form.Label>
                                        Name
                                    </Form.Label>
                                    <Form.Control type="text" name={'name'} value={inputField.name}
                                                  onChange={event => this.handleInputChange(index, event)} required/>
                                </Col>
                                <Col sm={12} md={3} className={'mb-2'}>
                                    <Form.Label>
                                        Description
                                    </Form.Label>
                                    <Form.Control type="text" name={'description'} value={inputField.description}
                                                  onChange={event => this.handleInputChange(index, event)}/>
                                </Col>
                                <Col sm={12} md={3} className={'mb-2'}>
                                    <Form.Label>
                                        Estimated Time (S)
                                    </Form.Label>
                                    <Row>
                                        <Col xs={9}>
                                            <Form.Control type="number" name={'estimatedTime'}
                                                          value={inputField.estimatedTime}
                                                          onChange={event => this.handleInputChange(index, event)}
                                                          required/>
                                        </Col>
                                        <Col xs={3}>
                                            <Button type="button" variant={'dark'} onClick={() => this.handleTimer(index)}>
                                                <FontAwesomeIcon icon={faClock}/>
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={12} md={3}
                                     className={'mb-2 d-flex align-items-end justify-content-center pt-3'}>
                                    {index === 0 &&
                                    <Button type="button" variant={'dark'} onClick={() => this.handleAddOperation()}>
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </Button>
                                    }
                                    {/*&nbsp;*/}
                                    {/*{this.state.form.length !== (index + 1) &&*/}
                                    {/*<Button type="button" variant={'dark'}*/}
                                    {/*        onClick={() => this.handleRemoveOperation(index, !!this.state.form.id)}>*/}
                                    {/*    <FontAwesomeIcon icon={faTrash}/>*/}
                                    {/*</Button>*/}
                                    {/*}*/}

                                    &nbsp;
                                    {inputField.isChange && inputField.id &&
                                    <Button type="button" variant={'dark'}
                                            disabled={this.state.isLoading || !this.state.selectedDesign || inputField.name.replace(/ /g, "") === '' || inputField.description.replace(/ /g, "") === '' || inputField.estimatedTime < 1}
                                            onClick={(event) => this.handleUpdateOperation(index, event)}>
                                        <FontAwesomeIcon icon={faUpload}/>
                                    </Button>
                                    }
                                    {inputField.isChange && !inputField.id &&
                                    <Button type="button" variant={'dark'}
                                            disabled={this.state.isLoading || !this.state.selectedDesign || inputField.name.replace(/ /g, "") === '' || inputField.description.replace(/ /g, "") === '' || inputField.estimatedTime < 1}
                                            onClick={(event) => this.handleCreateOperation(index, event)}>
                                        <FontAwesomeIcon icon={faUpload}/>
                                    </Button>
                                    }
                                </Col>
                            </Form.Group>
                        </Fragment>

                    ))}

                </Form>

                <Modal show={this.state.modal.show} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modal.body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.timerModal} onHide={()=>{this.setState({timerModal:false})}} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Timer</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={'text-center'}>


                        <Timer ref={this.userTimer}
                               initialTime={0}
                               startImmediately={false}
                        >
                            {({ start, resume, pause, stop, reset }) => (
                                <React.Fragment>
                                    <Row>
                                        <h1 className=" col-6 pr-0 text-center"><Timer.Minutes /> min</h1>
                                        <h1 className=" col-6 text-center"><Timer.Seconds /> sec</h1>
                                    </Row>
                                </React.Fragment>
                            )}
                        </Timer>
                    </Modal.Body>
                    <Modal.Footer>

                        <Button variant="primary" onClick={()=>{this.userTimer.current.start()}}>
                            start
                        </Button>
                        <Button variant="secondary" onClick={()=>{this.userTimer.current.pause()}}>
                            pause
                        </Button>
                        <Button variant="warning" onClick={()=>{this.userTimer.current.reset()}}>
                            reset
                        </Button>
                        <Button variant="info" onClick={()=>{
                            let form = this.state.form;
                            let selectedOperation = form[this.state.selectedOperationIndex];
                            selectedOperation.estimatedTime = Math.floor(this.userTimer.current.getTime()/1000);
                            selectedOperation.isChange = true;
                            console.log(form);
                            this.setState({
                                form: form,
                                timerModal: false,
                            })
                        }}>
                            set
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}
