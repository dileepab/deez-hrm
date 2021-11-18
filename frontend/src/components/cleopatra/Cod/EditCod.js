import React from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {codService} from "../../../services";
import {trackPromise} from "react-promise-tracker";
import lodash from "lodash";
import {toast} from "react-toastify";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


export default class EditCod extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            search: 'COD0722750',
            cod: null,
        }
    }

    notifySuccess = (msg) => toast.success(msg);

    componentDidMount() {
        // this.searchCod();
    }

    searchCod = (e) => {
        const cod = e.target.value;
        if (cod.length !== 10) {
            this.setState({
                cod: null
            });
            return false;
        }
        trackPromise(
            codService.getCodByCod(cod)
                .then(
                    data => {
                        const cod = data[0];
                        this.setState({
                            // this.setState({
                            cod: cod
                        });
                    }
                ));
    }

    updateCod = () => {
        let cod = lodash.cloneDeep(this.state.cod);
        delete cod.id;
        trackPromise(
            codService.updateCod(cod, this.state.cod.id)
                .then(
                    data => {
                        this.notifySuccess(`${cod.cod} update successfully`);
                    }
                ));
    }

    render() {
        return (
            <Container>
                <h3 className={'mt-3'}>Update COD</h3>
                <Form as={Row} className={'mt-3'}>
                    <Form.Group as={Col} md={6} controlId="search">

                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroupPrepend">
                                    <FontAwesomeIcon icon={faSearch}/>
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text" name={'search'} placeholder="Search COD" onChange={this.searchCod}/>
                        </InputGroup>
                    </Form.Group>
                </Form>
                {this.state.cod &&
                <Form as={Row} className={'mt-3 pt-3 mb-3 border-top'}>
                    <Form.Group as={Col} md={6} controlId="cod">
                        <Form.Label>COD</Form.Label>
                        <Form.Control readOnly type="text" name={'cod'} placeholder="Search COD"
                                      value={this.state.cod.cod}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, cod: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="amount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control readOnly type="number" name={'amount'} placeholder="amount"
                                      value={this.state.cod.amount}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, amount: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control readOnly type="text" name={'address'} placeholder="address"
                                      value={this.state.cod.customer_address}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, customer_address: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control readOnly type="text" name={'name'} placeholder="name"
                                      value={this.state.cod.customer_name}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, customer_name: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control readOnly type="text" name={'phone'} placeholder="phone"
                                      value={this.state.cod.phone_no}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, phone_no: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control readOnly type="text" name={'description'} placeholder="description"
                                      value={this.state.cod.description}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, description: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="note">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control readOnly type="text" name={'note'} placeholder="note"
                                      value={this.state.cod.note}
                                      onChange={(e) => this.setState({cod: {...this.state.cod, note: e.target.value}})}/>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="note">
                        <Form.Label>Status</Form.Label>
                        <Form.Control as="select" name={'status'} placeholder="status"
                                      onChange={(e) => this.setState({cod: {...this.state.cod, status: e.target.value}})}
                                      defaultValue={this.state.cod.status}>
                            <option value={'dispatch'}>Dispatch</option>
                            <option value={'return'}>Return</option>
                            <option value={'payment_received'}>Payment Received</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} md={6} controlId="weight">
                        <Form.Label>Weight</Form.Label>
                        <Form.Control as="select" type="text" name={'weight'} placeholder="weight"
                                      onChange={(e) => this.setState({cod: {...this.state.cod, weight: e.target.value}})}
                                      defaultValue={this.state.cod.weight}>
                            <option value={1}>1 Kg</option>
                            <option value={2}>2 Kg</option>
                            <option value={3}>3 Kg</option>
                            <option value={4}>4 Kg</option>
                            <option value={5}>5 Kg</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className={'text-right'} as={Col} md={6} controlId="weight">
                        <Form.Label>&nbsp;</Form.Label>
                        <Button className={'d-block'} onClick={this.updateCod} variant={'primary'}>Update</Button>
                    </Form.Group>
                </Form>
                }
            </Container>
        );
    }
}