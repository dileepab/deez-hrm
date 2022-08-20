import React from 'react';
import {Button, Container, Form, Row} from 'react-bootstrap';
import lodash from 'lodash';
import {operatorService} from '../../../services';
import {toast} from 'react-toastify';
import {trackPromise} from 'react-promise-tracker';
import DatePicker from 'react-date-picker';

export default class OperatorOperations extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      operators: [],
      designs: [],
      operations: [],
      selectedOperator: false,
      selectedDesign: false,
      selectedOperation: false,
      form: {
        operatorId: '',
        stepId: '',
        quantity: 0,
        completedTime: new Date(),
      },
      isLoading: false,
    };

    // this.handleInputChange = this.handleInputChange.bind(this);
  }


  componentDidMount() {
    this.fetchOperators();
    this.fetchDesigns();
  }

  notifyError = (error) => toast.error(error);
  notifySuccess = (msg) => toast.success(msg);

  fetchDesigns() {
    trackPromise(
      operatorService.fetchDesigns()
        .then(
          data => {
            this.setState({
              designs: data,
            });
          },
          error => {
            this.setState({msg: error});
            console.error('Error:', error);
          },
        ),
    );
  }

  fetchOperators() {
    trackPromise(
      operatorService.getMachineOperatorsAndHelpers()
        .then(
          data => {
            this.setState({
              operators: data,
            });
          },
          error => {
            this.setState({msg: error});
            console.error('Error:', error);
          },
        ),
    );
  }

  handleDesignChange = (event) => {
    const target = event.target;
    const index = target.value;

    if (index === '') {
      this.setState({
        selectedDesign: false,
        selectedOperation: false,
      });
      return false;
    }
    const design = this.state.designs[index];

    const operations = design.steps ? design.steps : false;
    this.setState({
      operations: operations,
      selectedDesign: design,
      selectedOperation: false,
      form: {
        ...this.state.form,
        completedTime: new Date(),
      }
    });
  };

  handleSubmit = (event) => {
    trackPromise(
      operatorService.addOperatorOperations({
        'quantity': this.state.form.quantity,
        'completeTime': this.state.form.completedTime,
        'operatorId': this.state.selectedOperator.id,
        'stepId': this.state.selectedOperation.id,

      }).then(
        data => {
          let completedQuantity = lodash.cloneDeep(data.quantity);
          console.log(completedQuantity);
          this.setState({
            form: {
              ...this.state.form,
              quantity: 0,
            },
          });
          this.notifySuccess(`${this.state.selectedOperator ? this.state.selectedOperator.name : ''} has
                    completed ${completedQuantity} of ${this.state.selectedDesign ? this.state.selectedDesign.name : ''} - ${this.state.selectedOperation ? this.state.selectedOperation.name : ''}`);
        },
        error => {
          this.notifyError(error);
        },
      ),
    );
    event.preventDefault();
    event.stopPropagation();
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.type === 'number' ? (parseInt(target.value) ? parseInt(target.value) : '') : target.value;
    const name = target.name;

    this.setState({
      form: {
        ...this.state.form,
        [name]: value,
      },
    });
  };

  handleDateChange = (event) => {
    const name = 'completedTime';

    this.setState({
      form: {
        ...this.state.form,
        [name]: event,
      },
    });
  };

  render() {
    return (

      <div>
        <Container>
          <div
            aria-live='polite'
            aria-atomic='true'
            style={{
              position: 'relative',
              minHeight: '0',
            }}>
          </div>
          <br />
          <h2>Operator Operations</h2>
          <br />
          <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
            <Form.Group className={'mt-3'} controlId='operators'>
              <Form.Label>Select Operator</Form.Label>
              <Form.Control as='select' onChange={(event) => {
                this.setState({selectedOperator: this.state.operators[event.target.value]});
              }}>
                <option/>
                {this.state.operators.length > 0 && this.state.operators.map((operator, index) => (
                  <option value={index} key={index}>{operator.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            {this.state.selectedOperator &&
            <Form.Group className={'mt-3'} controlId='designs'>
              <Form.Label>Select Design</Form.Label>
              <Form.Control as='select' onChange={this.handleDesignChange}>
                <option/>
                {this.state.designs.length > 0 && this.state.designs.map((design, index) => {
                  if((design.type === 1 && this.state.selectedOperator.type === '1') || (design.type === 2 && this.state.selectedOperator.type === '2')) {
                    return <option value={index} key={index}>{design.name} ----- {design.description}</option>
                  }
                  return null;
                }
                )}
              </Form.Control>
            </Form.Group>
            }
            {this.state.selectedDesign &&
            <Form.Group className={'mt-3'} controlId='operations'>
              <Form.Label>Select Operation</Form.Label>
              <Form.Control as='select' onChange={(event) => {
                console.log(event.target.value);
                this.setState({selectedOperation: this.state.operations[event.target.value]});
              }}>
                <option/>
                {this.state.operations.length > 0 && this.state.operations.map((operation, index) => (
                  <option value={index} key={index}>{operation.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            }

            {this.state.selectedOperation &&
            <>
              <Form.Group className='mt-3' id='completedTime'>
                <Form.Label>Completed Date</Form.Label>
                <Row>
                  <DatePicker name={'completedTime'} onChange={this.handleDateChange}
                              value={this.state.form.completedTime} />
                </Row>
              </Form.Group>
              <Form.Group className={'mt-3'} id='quantity'>
                <Form.Label>
                  Quantity
                </Form.Label>
                <Form.Control type='number' name={'quantity'} value={this.state.form.quantity}
                              onChange={this.handleInputChange}
                              required />
              </Form.Group>
            </>
            }

            {this.state.selectedOperation && this.state.form.quantity > 0 &&
            <Button className={'mt-4 mb-4'} type='submit' variant={'dark'}
                    disabled={this.state.isLoading || !this.state.selectedDesign}>
              Add Operator Operations
            </Button>
            }
          </Form>
        </Container>
      </div>
    );
  }
}
