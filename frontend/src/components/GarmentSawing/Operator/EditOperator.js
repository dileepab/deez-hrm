import React from "react";
import {Button, Col, Container, Form, Modal, Row, Table} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import lodash from "lodash"
import {authenticationService, operatorService} from "../../../services";
import {toast} from "react-toastify";
import {trackPromise} from "react-promise-tracker";


export default class EditOperator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            operators: [],
            modal: {
                showConfirmation: false,
                showSuccess: false,
                showEditModal: false,
                title: '',
                body: ''
            },
            selectedOperator: {},
            isLoading: false
        };
    }


    notifyError = (error) => toast.error(error);
    notifySuccess = (msg) => toast.success(msg);

    componentDidMount() {

        authenticationService.currentUser.subscribe(x => this.setState({
            currentUser: x,
        }));
        trackPromise(
            operatorService.getOperators()
                .then(
                    data => {
                        const operators = data || [];
                        this.setState({
                            // this.setState({
                            operators: operators
                        });
                    },
                    error => {
                        this.setState({msg: error});
                        console.error('Error:', error);
                    }
                ));
    }

    editOperator = (id, ind) => {
        let selectedOperator = lodash.cloneDeep(this.state.operators[ind]);
        selectedOperator.ind = ind;
        this.setState({
            selectedOperator: selectedOperator,
            modal: {
                ...this.state.modal,
                showEditModal: true,
                title: `Edit Operator ${selectedOperator.name}`
            }
        })
    }

    removeOperator = (id, ind) => {
        let selectedOperator = this.state.operators[ind];
        this.setState({
            selectedOperator: selectedOperator,
            modal: {
                ...this.state.modal,
                showConfirmation: true,
                title: `Remove Operator ${selectedOperator.name}`,
                body: 'Are you sure ?'
            }
        })
    }

    confirmEdit = () => {
        this.setState({isLoading: true});
        let data = lodash.cloneDeep(this.state.selectedOperator);
        delete data.ind;
        trackPromise(
            operatorService.editOperator(this.state.selectedOperator.id, data)
                .then(
                    data => {
                        let operators = this.state.operators;
                        let ind = this.state.selectedOperator.ind;
                        console.log('here', ind);
                        operators[ind] = this.state.selectedOperator;
                        this.setState({
                            operators: operators,
                            isLoading: false,
                        });
                        this.handleClose();
                        this.notifySuccess(`${this.state.selectedOperator.name} successfully edited`);
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
    }

    confirmDelete = () => {
        this.setState({isLoading: true});
        trackPromise(
            operatorService.deleteOperator(this.state.selectedOperator.id)
                .then(
                    () => {
                        let operators = this.state.operators;
                        let ind = operators.indexOf(this.state.selectedOperator);
                        operators.splice(ind, 1);
                        this.setState({
                            operators: operators,
                            isLoading: false,
                        });
                        this.handleClose();
                        this.notifySuccess(`${this.state.selectedOperator.name} successfully deleted`);
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
    }

    handleClose = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                showConfirmation: false,
                showSuccess: false,
                showEditModal: false,
            }
        });
    }


    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            selectedOperator: {
                ...this.state.selectedOperator,
                [name]: value
            }
        });
    }


    render() {
        return (
            <Container>
                <br/>
                <h2>Edit Operators</h2>
                <br/>
                <Row>
                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Team</th>
                            <th width={90}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.operators && this.state.operators.map((operator, ind) => {
                            return (
                                <tr key={ind}>
                                    <td>{operator.name}</td>
                                    <td>{operator.team}</td>
                                    <td className={'text-center'}>
                                        <Button variant={"outline-primary"}
                                                onClick={() => this.editOperator(operator.id, ind)}
                                                size={"sm"}>
                                            <FontAwesomeIcon icon={faEdit}/>
                                        </Button>
                                        &nbsp;

                                        {this.state.currentUser && this.state.currentUser.roles.includes('admin') &&
                                        <Button variant={"danger"} onClick={() => this.removeOperator(operator.id, ind)}
                                                size={"sm"}>
                                            <FontAwesomeIcon icon={faTrash}/>
                                        </Button>
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>
                </Row>

                <Modal show={this.state.modal.showEditModal} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            <Form noValidate validated={this.state.validated}>
                                <Form.Group as={Row} id="name">
                                    <Form.Label column sm="4">
                                        Name
                                    </Form.Label>
                                    <Col sm="8">
                                        <Form.Control type="text" name={'name'}
                                                      defaultValue={this.state.selectedOperator.name}
                                                      onChange={this.handleInputChange} required/>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row} id="team">
                                    <Form.Label column sm="4">
                                        Team
                                    </Form.Label>
                                    <Col sm="8">
                                        <Form.Control name={'team'} as="select"
                                                      defaultValue={this.state.selectedOperator.team}
                                                      onChange={this.handleInputChange}>
                                            <option value={'1'}>1</option>
                                            <option value={'2'}>2</option>
                                            <option value={'3'}>3</option>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} id="type">
                                    <Form.Label column sm="4">Select Operator Type</Form.Label>
                                    <Col sm="8">
                                        <Form.Control as="select" name={'type'}
                                                      defaultValue={this.state.selectedOperator.type}
                                                      onChange={this.handleInputChange}>
                                            <option value="1">Machine Operator</option>
                                            <option value="2">Helper</option>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                {this.state.selectedOperator.type === '2' &&
                                <Form.Group as={Row} id="type">
                                    <Form.Label column sm="4">Is QC?</Form.Label>
                                    <Col sm="8">
                                        <Form.Check name={'isQC'} type="checkbox" label=""
                                                    checked={this.state.selectedOperator.isQC}
                                                    onChange={this.handleInputChange}/>
                                    </Col>
                                </Form.Group>
                                }
                            </Form>
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.confirmEdit}>
                            {this.state.isLoading ? 'Loading' : 'Edit'}
                        </Button>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

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
            </Container>
        );
    }
}
