import React from "react";
import {Button, Container, Modal, Row, Table} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfo} from "@fortawesome/free-solid-svg-icons";
import Moment from "react-moment";
import {designService} from "../../../services";
import {trackPromise} from "react-promise-tracker";


export default class ViewOperation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            designs: [],
            selectedOperation: [],
            modal: {
                showInfoModal: false,
                title: '',
                body: ''
            }
        };
    }

    componentDidMount() {
        trackPromise(
        designService.getAllIncompleteDesignsWithOperator().then(
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


    operationCompletedCount = (operatorSteps, design) => {
        if (!operatorSteps) {
            return 0
        }
        let completedCount = 0;
        operatorSteps.map((operatorStep, ind) => {
            return completedCount += operatorStep.quantity;
        });
        return (completedCount < design.quantity ?
            <span
                className='text-warning'>{completedCount}</span> : completedCount > design.quantity ?
                <span className='text-danger'>{completedCount}</span> :
                <span className='text-success'>{completedCount}</span>);
    }


    viewOperationInfo = (design, operation) => {

        this.setState({
            selectedOperation: operation,
            modal: {
                ...this.state.modal,
                showInfoModal: true,
                title: `${design.name} - ${operation.name} Details`,
            }
        })
    }


    handleClose = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                showInfoModal: false,
            }
        });
    }

    render() {
        return (
            <Container>
                <br/>
                <h2>View Operations</h2>
                <br/>
                {this.state.designs.map((design, ind) => {
                    return (
                        <Row key={ind}>
                            <h4>{design.name} - {design.description} </h4>
                            <Table striped bordered hover size="sm">
                                <thead>
                                <tr>
                                    <th>Op. Name</th>
                                    <th className={'d-none d-md-table-cell'}>Op. Description</th>
                                    <th width={110} className={'d-none d-md-table-cell'}>Est. Time</th>
                                    <th width={100}>Completed</th>
                                    <th width={50}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {design.steps && design.steps.map((step, ind) => {
                                    return (
                                        <tr key={ind}>
                                            <td>{step.name}</td>
                                            <td className={'d-none d-md-table-cell'}>{step.description}</td>
                                            <td className={'d-none d-md-table-cell'}>{step.estimatedTime}</td>
                                            <td className={'text-right'}>{this.operationCompletedCount(step.operatorSteps, design)}</td>
                                            <td className={'text-center'}>
                                                <Button variant={"outline-primary"}
                                                        onClick={() => this.viewOperationInfo(design, step)}
                                                        size={"sm"}>
                                                    <FontAwesomeIcon icon={faInfo}/>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </Table>
                        </Row>
                    )
                })}


                <Modal scrollable show={this.state.modal.showInfoModal} onHide={this.handleClose} centered>

                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover size="sm">
                            <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{this.state.selectedOperation.name}</td>
                            </tr>
                            <tr>
                                <td>Description</td>
                                <td>{this.state.selectedOperation.description}</td>
                            </tr>
                            <tr>
                                <td>Estimated Time (S)</td>
                                <td>{this.state.selectedOperation.estimatedTime}</td>
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
                                <th width={150}>Completed On</th>
                            </tr>
                            </thead>
                            <tbody>

                            {this.state.selectedOperation.operatorSteps && this.state.selectedOperation.operatorSteps.map((operatorStep, ind) => {
                                return (
                                    <tr key={ind}>
                                        <td>{operatorStep.operator && operatorStep.operator.name}</td>
                                        <td>{operatorStep.quantity}</td>
                                        <td><Moment format={'YYYY-MMM-DD'}>{operatorStep.completeTime}</Moment></td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={this.state.isLoading} variant="secondary" onClick={this.handleClose}>
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}
