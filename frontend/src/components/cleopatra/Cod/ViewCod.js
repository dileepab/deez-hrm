import React from "react";
import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {codService} from "../../../services";
import {trackPromise} from "react-promise-tracker";
import {toast} from "react-toastify";
import DatePicker from "react-date-picker";


export default class ViewCod extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            startDate: new Date(),
            endDate: new Date(),
            cods: [],
            codStatus: {
                dispatch: false,
                return: false,
                paymentReceive: true,
            }
        }
    }

    notifySuccess = (msg) => toast.success(msg);

    componentDidMount() {

        let today = new Date();
        let startMonth = new Date(today);
        let endMonth = new Date(today);
        startMonth.setMonth(startMonth.getMonth() - 1);
        let startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1, 0, 0, 0, 0);
        endMonth.setMonth(endMonth.getMonth());
        let endDate = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1, 0, 0, 0, 0);

        console.log(startDate);
        console.log(endDate);
        this.setState({
            startDate: startDate,
            endDate: endDate
        })
        const _this = this;
        setTimeout(function () {
            _this.getCod()
        }, 1000)

    }

    getCod = () => {
        trackPromise(
            codService.getCodByStatusAndDate(this.state.codStatus, this.state.startDate, this.state.endDate)
                .then(
                    data => {
                        console.log(data);
                        this.setState({
                            // this.setState({
                            cods: data,
                            receivedPayment: this.calculateReceivedPayment(data)
                        });
                    }
                ));
    }

    calculateReceivedPayment(data) {
        let total = 0;
        data.forEach((cod, ind) => {
            if (cod.status === 'payment_received') {
                total += cod.amount;
            }
        })
        return total
    }


    render() {
        return (
            <div className="App with-fixed-header">
                <div className={'fixed-top fixed-header'}>
                    <Row
                        className="d-flex text-left flex-row pt-2 pb-2 pl-3 pr-3 align-items-center bg-white border-bottom">
                        <Col md={"auto"}>
                            <Form.Check inline label={"Dispatched "} type="checkbox" id="dispatched"
                                        onChange={(e) => {
                                            this.setState({
                                                codStatus: {
                                                    ...this.state.codStatus,
                                                    dispatch: e.target.checked
                                                }
                                            })
                                        }}
                            />
                        </Col>
                        <Col md={"auto"}>
                            <Form.Check inline label="Return" type="checkbox" id="returned"
                                        onChange={(e) => {
                                            this.setState({
                                                codStatus: {
                                                    ...this.state.codStatus,
                                                    return: e.target.checked
                                                }
                                            })
                                        }}
                            />
                        </Col>
                        <Col md={"auto"}>
                            <Form.Check inline label="Payment Received" checked={this.state.codStatus.paymentReceive}
                                        type="checkbox" id="payment_receive"
                                        onChange={(e) => {
                                            this.setState({
                                                codStatus: {
                                                    ...this.state.codStatus,
                                                    paymentReceive: e.target.checked
                                                }
                                            })
                                        }}
                            />
                        </Col>
                        <Col md={"auto"}>
                            <Row className=" pt-2 pb-2  pl-3 pr-3 ">
                                <Col md={"auto"}>
                                    <Row className={'mr-0 ml-0 align-items-center'}>
                                        <label className={'m-0'} style={{width: '70px'}}>From</label>
                                        <DatePicker className={'h-100 border border-success'}
                                                    value={this.state.startDate}
                                                    onChange={startDate => this.setState({startDate})}/>
                                    </Row>
                                </Col>
                                <Col md={"auto"}>
                                    <Row className={'mr-0 ml-0 align-items-center'}>
                                        <label className={'m-0'} style={{width: '70px'}}>To</label>
                                        <DatePicker className={'h-100 border border-success'} value={this.state.endDate}
                                                    onChange={endDate => this.setState({endDate})}/>
                                    </Row>
                                </Col>
                                <Col md={"auto"}>
                                    <Button variant={'primary'} onClick={this.getCod}>View Cod's</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className={"bg-white border-bottom pt-2"}>
                        <Col>
                            <h6 className={"text-primary"}>Total Received Payment for {this.state.cods.length}- {this.state.receivedPayment}</h6>
                        </Col>
                    </Row>
                </div>
                {this.state.cods.length > 0 &&

                <div className={"pt-2"}>
                    <Table className={'mt-5'} striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>Tracking No</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.cods.map((cod, i) => {

                            return (
                                <tr className={cod.status === 'return' ? 'text-warning' : cod.status === 'dispatch' ? '' : 'text-success'}
                                    key={i}>
                                    <td>{cod.cod}</td>
                                    <td>{cod.amount}</td>
                                    <td>{cod.status}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>
                </div>
                }
            </div>
        );
    }
}