import React, {Fragment} from 'react';

// Set up all routes in App
import {Link, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';

// Using custom styled components from Global folder in components

// Importing all routes
import {Col, Container, Nav, Navbar, NavDropdown, Row} from "react-bootstrap";
import {AddOperator, EditOperator, ViewOperator} from "./components/GarmentSawing/Operator";
import {AddDesign, EditDesign, ViewDesign} from "./components/GarmentSawing/Design";
import {AddOperation, ViewOperation} from "./components/GarmentSawing/Operation";
import OperatorOperations from "./components/GarmentSawing/Operator/OperatorOperations";
import SignIn from "./components/SignIn/SignIn";
import PrivateRoute from "./helpers/PrivateRote";
import {authenticationService} from "./services";
import {ToastContainer, toast} from "react-toastify";
import {AddCod, EditCod, PrintCod, UpdateCodPaymentStatus, ViewCod} from "./components/cleopatra/Cod/";

toast.configure({
    autoClose: 15000,
});

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentUser: null
        }
    }

    componentDidMount() {
        authenticationService.currentUser.subscribe(x => this.setState({
            currentUser: x,
        }));
    }

    allowNav(allowedRole) {
        return this.state.currentUser?.roles?.filter(value => allowedRole.includes(value)).length > 0 ? true : false;
    }

    onLogOut = () => {
        authenticationService.logout()
    } //clearing the context

    render() {
        return (
            <div>
                <ToastContainer/>
                <Navbar bg="dark" variant="dark" sticky="top" expand={'lg'} collapseOnSelect>
                    <Navbar.Brand>
                        {/*<img src="/logo192.png" width="30" height="30" className="d-inline-block align-top" alt="React Bootstrap logo"/>*/}
                        DEEZ
                    </Navbar.Brand>
                    {this.state.currentUser &&
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    }

                    {this.state.currentUser &&
                    <Navbar.Collapse id="basic-navbar-nav">
                        <div className={'mr-auto'}>
                            <Row className={'ml-0 mr-0'}>
                                {this.allowNav(['admin', 'manager']) &&
                                <Nav className={'pr-0'} as={Col}>
                                    <NavDropdown title="Operators" id="basic-nav-dropdown">
                                        <NavDropdown.Item eventKey="11" as={Link} to={'add-operator'}>
                                            Add Operators
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="12" as={Link} to={'edit-operator'}>
                                            Edit Operators
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="13" as={Link} to={'view-operator'}>
                                            View Operators
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="14" as={Link} to={'operator-operations'}>
                                            Operator Operations
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Design" id="basic-nav-dropdown">
                                        <NavDropdown.Item eventKey="21" as={Link} to={'add-design'}>
                                            Add Design
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="22" as={Link} to={'view-design'}>
                                            View Design
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Operations" id="basic-nav-dropdown">
                                        <NavDropdown.Item eventKey="31" as={Link} to={'add-operations'}>
                                            Add Operations
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="32" as={Link} to={'view-operations'}>
                                            View Operations
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </Nav>
                                }
                                {this.allowNav(['admin', 'cleo']) &&
                                <Nav className={'pr-0'} as={Col}>
                                    <NavDropdown title="COD" id="basic-nav-dropdown">
                                        <NavDropdown.Item eventKey="41" as={Link} to={'print-cod'}>
                                            Print COD's
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="42" as={Link} to={'add-cod'}>
                                            Add COD's
                                        </NavDropdown.Item>
                                        <NavDropdown.Item eventKey="43" as={Link} to={'edit-cod'}>
                                            Edit COD's
                                        </NavDropdown.Item>
                                        {this.allowNav(['admin']) &&
                                        <Fragment>
                                            <NavDropdown.Item eventKey="44" as={Link} to={'update-cod-payment-status'}>
                                                Update COD's Payment Status
                                            </NavDropdown.Item>
                                            <NavDropdown.Item eventKey="45" as={Link} to={'view-cod'}>
                                                View COD's
                                            </NavDropdown.Item>
                                        </Fragment>
                                        }
                                    </NavDropdown>
                                </Nav>
                                }
                            </Row>
                        </div>
                        <Nav>
                            <h6 className="text-center text-white mb-0 d-lg-flex align-items-center d-none"> {`Hello, ${this.state.currentUser.firstName}`} </h6>
                            <Nav.Link onClick={this.onLogOut}>Log out</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                    }
                </Navbar>
                <Container fluid>
                    <Route path="/sign-in" component={SignIn}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/" exact component={ViewOperator}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/add-operator" exact component={AddOperator}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/edit-operator" exact component={EditOperator}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/view-operator" exact component={ViewOperator}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/operator-operations" exact
                                  component={OperatorOperations}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/add-design" exact component={AddDesign}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/edit-design" exact component={EditDesign}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/view-design" exact component={ViewDesign}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/add-operations" exact component={AddOperation}/>
                    <PrivateRoute roles={['admin', 'manager']} path="/view-operations" exact component={ViewOperation}/>
                    <PrivateRoute roles={['admin', 'cleo']} path="/print-cod" exact component={PrintCod}/>
                    <PrivateRoute roles={['admin', 'cleo']} path="/add-cod" exact component={AddCod}/>
                    <PrivateRoute roles={['admin', 'cleo']} path="/edit-cod" exact component={EditCod}/>
                    <PrivateRoute roles={['admin']} path="/update-cod-payment-status" exact component={UpdateCodPaymentStatus}/>
                    <PrivateRoute roles={['admin']} path="/view-cod" exact component={ViewCod}/>
                </Container>
            </div>
        );
    }
}
