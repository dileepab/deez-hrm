import React from "react";
import {Button, ButtonGroup, Col, Container, Form, Modal, Row, Table} from "react-bootstrap";
import {faCopy, faEdit, faInfo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import EditDesign from "./EditDesign";
import _ from "lodash";
import {authenticationService, designService, operationService} from "../../../services";
import {toast} from "react-toastify";
import {trackPromise} from "react-promise-tracker";


export default class ViewDesign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            designs: [],
            filteredDesign: [],
            filter: {
                keyword: '',
                type: '',
                brand: '',
            },
            currentUser: null,
            view: 'incomplete',
            modal: {
                showConfirmation: false,
                showInfoModal: false,
                showEditModal: false,
                showDuplicateModal: false,
                title: '',
                body: ''
            },
            selectedDesign: {},
            isLoading: false
        };
    }

    notifyError = (error) => toast.error(error);
    notifySuccess = (msg) => toast.success(msg);

    componentDidMount() {
        authenticationService.currentUser.subscribe(x => this.setState({
            currentUser: x,
        }));
        this.fetchDesigns(this.state.view);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.filter !== this.state.filter || prevState.designs !== this.state.designs){
            this.filterData();
        }
    }

    fetchDesigns = (type) => {
        trackPromise(
            designService.getAllDesigns(type).then(
                data => {
                    this.setState({
                        designs: data
                    });
                },
                error => {
                    this.setState({msg: error});
                    console.error('Error:', error);
                }
            ));
    }

    editDesign = (design) => {
        this.setState({
            selectedDesign: design,
            modal: {
                ...this.state.modal,
                showEditModal: true,
                title: 'Edit Design',
                body: ''
            }
        })
    }

    removeDesign = (design) => {
        this.setState({
            selectedDesign: design,
            modal: {
                ...this.state.modal,
                showConfirmation: true,
                title: `Remove Design ${design.name}`,
                body: 'Are you sure ?'
            }
        })
    }

    confirmDelete = () => {
        this.setState({isLoading: true});
        trackPromise(
            designService.deleteDesign(this.state.selectedDesign.id).then(
                data => {
                    let designs = this.state.designs;
                    let ind = designs.indexOf(this.state.selectedDesign);
                    designs.splice(ind, 1);
                    this.setState({
                        designs: designs,
                        isLoading: false,
                    });
                    this.handleClose();
                    this.notifySuccess(`${this.state.selectedDesign.name} successfully deleted`)
                },
                error => {
                    this.notifyError(error);
                }
            ));
    }

    duplicateDesign = (design) => {
        let selectedDesign = _.cloneDeep(design);
        delete selectedDesign.id;
        selectedDesign.steps && selectedDesign.steps.forEach(function (step) {
            delete step.id;
            delete step.operatorSteps;
            delete step.designId;
        })
        console.log(selectedDesign);
        this.setState({
            selectedDesign: selectedDesign,
            modal: {
                ...this.state.modal,
                showDuplicateModal: true,
                title: `Duplicate Design`,
            }
        })
    }

    confirmDesignDuplicate = () => {

        this.setState({isLoading: true});
        let selectedDesign = this.state.selectedDesign;
        trackPromise(
            designService.addDesign({
                "name": selectedDesign.name,
                "description": selectedDesign.description,
                "quantity": 0,
                "sewingValue": selectedDesign.sewingValue,
                "startTime": new Date(),
                "isComplete": false
            })
                .then(
                    data => {
                        this.duplicateOperations(data.id);
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
    }

    duplicateOperations = (id) => {

        let selectedDesign = this.state.selectedDesign;
        let steps = [];
        selectedDesign.steps && selectedDesign.steps.forEach(function (step) {
            step.designId = id;
            steps.push(step)
        })
        trackPromise(
            operationService.addAllOperations(steps)
                .then(
                    data => {
                        this.setState({
                            isLoading: false,
                            form: {
                                ...this.state.form,
                                name: ""
                            },
                            modal: {
                                ...this.state.modal,
                                showDuplicateModal: false,
                                title: 'Success',
                                body: `Design "${selectedDesign.name}" duplicated successfully`
                            }
                        });

                        this.notifySuccess(`Design "${selectedDesign.name}" duplicated successfully`)
                        this.fetchDesigns();
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
    }

    viewDesignInfo = async (design) => {
        await this.setState({
            selectedDesign: design,
            modal: {
                ...this.state.modal,
                showInfoModal: true,
                title: `${design.name} Details`,
                body: ''
            }
        })

        this.calculateTotalTimeToComplete();
        this.calculateCompletedTime();

    }

    calculateTimeToComplete = () => {
        let selectedDesign = this.state.selectedDesign;
        if (!selectedDesign.steps) {
            return 0
        }
        let operationTimes = 0;
        selectedDesign.steps.map((operation, ind) => {
            return operationTimes += operation.estimatedTime;
        });
        return Math.floor(operationTimes / 60) + ' Minutes  ' + operationTimes % 60 + ' Seconds';
    }

    calculateCompletedTime = () => {
        let selectedDesign = this.state.selectedDesign;
        if (!selectedDesign.steps) {
            return 0
        }
        let totalCompletedTime = 0;
        selectedDesign.steps.map((operation, ind) => {

            operation.operatorSteps && operation.operatorSteps.map((operatorStep, ind) => {
                return totalCompletedTime += operatorStep.quantity * operation.estimatedTime;
            });
            return 0
        });
        selectedDesign.totalCompletedTime = totalCompletedTime;
        this.setState({
            selectedDesign: selectedDesign
        })
    }

    calculateTotalTimeToComplete = () => {
        let selectedDesign = this.state.selectedDesign;
        if (!selectedDesign.steps) {
            return 0
        }
        let operationTimes = 0;
        selectedDesign.steps.map((operation, ind) => {
            return operationTimes += operation.estimatedTime;
        });
        selectedDesign.totalTimeToComplete = operationTimes * this.state.selectedDesign.quantity;
        this.setState({
            selectedDesign: selectedDesign
        })
        return this.state.selectedDesign
    }

    timeFormatter = (time) => {
        return Math.floor(time / 60 / 60) + ' Hours  ' + Math.floor(time / 60 % 60) + ' Minutes  ' + time % 60 + ' Seconds';
    }

    operationCompletedCount = (operatorSteps) => {
        if (!operatorSteps) {
            return 0
        }
        let completedCount = 0;
        operatorSteps.map((operatorStep, ind) => {
            return completedCount += operatorStep.quantity;
        });
        return (completedCount < this.state.selectedDesign.quantity ?
            <span
                className='text-warning'>{completedCount}</span> : completedCount > this.state.selectedDesign.quantity ?
                <span className='text-danger'>{completedCount}</span> :
                <span className='text-success'>{completedCount}</span>);
    }

    handleClose = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                showConfirmation: false,
                showEditModal: false,
                showInfoModal: false,
                showDuplicateModal: false,
            }
        });
    }

    handleDesignTypeChange = (event) => {
        const target = event.target;
        const type = target.value;
        const filter = {
            ...this.state.filter,
            type: type
        }
        this.setState({
            filter: filter,
        });
    }

    handleBrandChange = (event) => {
        const target = event.target;
        const brand = target.value;
        const filter = {
            ...this.state.filter,
            brand: brand
        }
        this.setState({
            filter: filter,
        });
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? (parseInt(target.value) ? parseInt(target.value) : '') : target.value;
        const name = target.name;
        console.log(name, value);

        this.setState({
            filter: {
                ...this.state.filter,
                [name]: value
            }
        });
    }

    filterData = () => {
        let brand = this.state.filter.brand;
        let type = this.state.filter.type;
        let keyword = this.state.filter.keyword.toLowerCase();
        let filteredData = this.state.designs;
        filteredData = _.filter(filteredData, function (design){
            if(design.name.toLowerCase().includes(keyword) || design.description.toLowerCase().includes(keyword)){
                return design;
            }
        });
        if(brand !== '') {
            filteredData = _.filter(filteredData, function (design) {
                return design != null && design.brand === brand;
            });
        }
        if(type !== '') {
            filteredData = _.filter(filteredData, function (design) {
                return design != null && design.type === parseInt(type);
            });
        }
        this.setState({
            filteredDesign: filteredData
        })
    }


    render() {
        return (

            <Container>
                <br/>
                <div className="d-flex flex-row justify-content-between mt-2 mb-2">
                    <div className="custom-file w-25 text-left">
                        <h2>View Designs</h2>
                    </div>
                    <div className={'flex-row d-flex flex-grow-1'}>

                        <Form.Group as={Col} id="name">
                            <div>
                                <Form.Control type="text" name={'keyword'} value={this.state.filter.keyword}
                                              onChange={this.handleInputChange} required/>
                            </div>
                        </Form.Group>
                    </div>
                    <div className={'flex-row d-flex'}>

                        <Form.Group className={'mb-0'} as={Col} controlId="exampleForm.ControlSelect1">
                            <div>
                                <Form.Control defaultValue={''} className={'w-auto'} as="select" name={'type'} onChange={this.handleDesignTypeChange}>
                                    <option value="" disabled>Select Type</option>
                                    <option value=""></option>
                                    <option value="1">Sawing</option>
                                    <option value="2">Helper</option>
                                </Form.Control>
                            </div>
                        </Form.Group>

                        <Form.Group className={'mb-0'} as={Col} controlId="exampleForm.ControlSelect1">
                            <div>
                                <Form.Control defaultValue={''} className={'w-auto'} as="select" name={'brand'} onChange={this.handleBrandChange} required>
                                    <option value="" disabled>Select Brand</option>
                                    <option value=""></option>
                                    <option value="nolimit">Nolimit</option>
                                    <option value="cleopatra">Cleopatra</option>
                                    <option value="modabella">Moda Bella</option>
                                    <option value="sample">Sample</option>
                                </Form.Control>
                            </div>
                        </Form.Group>
                    </div>
                    <div>
                        <ButtonGroup size="sm">
                            <Button variant={this.state.view === 'incomplete' ? 'primary' : 'outline-primary'}
                                    onClick={() => {
                                        this.setState({view: 'incomplete'});
                                        this.fetchDesigns('incomplete')
                                    }}>Incomplete</Button>
                            <Button variant={this.state.view === 'complete' ? 'primary' : 'outline-primary'}
                                    onClick={() => {
                                        this.setState({view: 'complete'});
                                        this.fetchDesigns('complete')
                                    }}>Complete</Button>
                            <Button variant={this.state.view === 'all' ? 'primary' : 'outline-primary'} onClick={() => {
                                this.setState({view: 'all'});
                                this.fetchDesigns('all')
                            }}>All</Button>
                        </ButtonGroup>
                    </div>
                </div>
                <br/>
                <Row>
                    <Table striped bordered hover size="sm" style={{'width': '100%'}}>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th className={'d-none d-md-table-cell'}>Desc</th>
                            <th className={'d-none d-md-table-cell'}>Type</th>
                            <th className={'d-none d-md-table-cell'}>Brand</th>
                            <th width={90} className={'d-none d-md-table-cell'}>Quantity</th>
                            <th width={110}>Status</th>
                            <th width={145}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.filteredDesign.map((design, ind) => {
                            return (
                                <tr key={ind}>
                                    <td title={design.name}>
                                        <div>{design.name}</div>
                                    </td>
                                    <td className={'d-none d-md-table-cell text-truncate'}
                                        title={design.description}>{design.description}</td>
                                    <td className={'d-none d-md-table-cell pr-3'}>{design.type === 1 ? 'Sawing' : 'Helper'}</td>
                                    <td className={'d-none d-md-table-cell pr-3 text-capitalize'}>{design.brand}</td>
                                    <td className={'d-none d-md-table-cell text-right pr-3'}>{design.quantity}</td>
                                    <td>{design.isComplete ? 'Complete' : 'Not Complete'}</td>
                                    <td>
                                        <div className={"d-flex align-items-center justify-content-center"}>
                                            <Button className={"mr-1"} variant={"outline-primary"}
                                                    onClick={() => this.viewDesignInfo(design)}
                                                    size={"sm"}>
                                                <FontAwesomeIcon title={"Details"} icon={faInfo}/>
                                            </Button>
                                            <Button className={"mr-1"} variant={"outline-primary"}
                                                    onClick={() => this.editDesign(design)}
                                                    size={"sm"}>
                                                <FontAwesomeIcon title={"Edit"} icon={faEdit}/>
                                            </Button>
                                            <Button className={"mr-1"} variant={"outline-primary"}
                                                    onClick={() => this.duplicateDesign(design)}
                                                    size={"sm"}>
                                                <FontAwesomeIcon title={"Duplicate"} icon={faCopy}/>
                                            </Button>
                                            {this.state.currentUser && this.state.currentUser.roles.includes('admin') && !design.steps &&
                                            <Button variant={"danger"} onClick={() => this.removeDesign(design)}
                                                    size={"sm"}>
                                                <FontAwesomeIcon title={"Delete"} icon={faTrash}/>
                                            </Button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>
                </Row>

                <Modal show={this.state.modal.showConfirmation} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modal.body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.confirmDelete}>
                            {this.state.isLoading ? 'Loading' : 'Confirm'}
                        </Button>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.modal.showEditModal} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EditDesign design={this.state.selectedDesign} history={this.props.history}
                                    editComplete={() => this.handleClose()}></EditDesign>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.modal.showInfoModal} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover size="sm">
                            <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{this.state.selectedDesign.name}</td>
                            </tr>
                            <tr>
                                <td>Desc</td>
                                <td>{this.state.selectedDesign.description}</td>
                            </tr>
                            <tr>
                                <td>Quantity</td>
                                <td>{this.state.selectedDesign.quantity}</td>
                            </tr>
                            <tr>
                                <td>Sewing Value</td>
                                <td>{this.state.selectedDesign.sewingValue}</td>
                            </tr>
                            <tr>
                                <td>Time To Complete One</td>
                                <td>{this.calculateTimeToComplete()}</td>
                            </tr>
                            <tr>
                                <td>Time To Complete {this.state.selectedDesign.quantity}</td>
                                <td>{this.timeFormatter(this.state.selectedDesign.totalTimeToComplete)}</td>
                            </tr>
                            <tr>
                                <td>Currently Completed</td>
                                <td>{this.timeFormatter(this.state.selectedDesign.totalCompletedTime)}</td>
                            </tr>
                            <tr>
                                <td> Completed Percentage</td>
                                <td>{Math.round((this.state.selectedDesign.totalCompletedTime / this.state.selectedDesign.totalTimeToComplete) * 10000) / 100} %</td>
                            </tr>
                            </tbody>
                        </Table>
                        <br/>
                        <h6>Operations</h6>
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th width={150}>Completed Count</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.selectedDesign.steps && this.state.selectedDesign.steps.map((step, ind) => {
                                return (
                                    <tr key={ind}>
                                        <td>{step.name}</td>
                                        <td className={'text-right'}>{this.operationCompletedCount(step.operatorSteps)}</td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/*Duplicate modal*/}
                <Modal show={this.state.modal.showDuplicateModal} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className={"mb-3"}>
                            <Col md={5}>
                                {this.state.selectedDesign.name}
                            </Col>
                            <Col md={7}>
                                {this.state.selectedDesign.description}
                            </Col>
                        </Row>
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Estimated Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.selectedDesign.steps && this.state.selectedDesign.steps.map((step, ind) => {
                                return (
                                    <tr key={ind}>
                                        <td>{step.name}</td>
                                        <td>{step.description}</td>
                                        <td>{step.estimatedTime}</td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={this.state.isLoading} variant="primary" onClick={this.confirmDesignDuplicate}>
                            Duplicate
                        </Button>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}
