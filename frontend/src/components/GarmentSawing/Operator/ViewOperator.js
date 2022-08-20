import React from 'react';
import {Accordion, Button, ButtonGroup, Container, Modal, Row, Table} from 'react-bootstrap';
import Moment from 'react-moment';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faInfo, faPrint, faUpload} from '@fortawesome/free-solid-svg-icons';
import lodash from 'lodash';
import {designService, operatorService} from '../../../services';
import {trackPromise} from 'react-promise-tracker';
import logo from '../../../img/deez-logo.png';
import {settingsService} from '../../../services/settings.service';

export default class ViewOperator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operators: [],
      helpersCount: 0,
      cutterCount: 0,
      designs: [],
      view: 'monthly',
      operatorType: 'operator',
      days: [],
      selectedOperator: {},
      thisMonthCompletedCount: {},
      lastMonthCompletedCount: {},
      modal: {
        showInfoModal: false,
        showSalaryModal: false,
      },
      settings: {
        qcPrice: 0,
        perKMPrice: 0,
        maxTransportAmount: 0,
        isTransportEnable: false,
      },
    };
  }

  componentDidMount() {
    this.fetchDesigns();
    this.fetchSettings();
  }

  fetchDesigns = () => {
    trackPromise(
      designService.getLastTwoMonthsAllDesigns().then(
        data => {
          let formattedData = this.calculateTimeToComplete(data);
          this.setState({
            designs: formattedData,
          });
          this.fetchOperators();
        },
        error => {
          this.setState({msg: error});
          console.error('Error:', error);
        },
      ));
  };

  fetchSettings = () => {
    trackPromise(
      settingsService.getAll().then(
        data => {
          this.setState({
            settings: data[0],
          });
        },
        error => {
          this.setState({msg: error});
          console.error('Error:', error);
        },
      ));
  };

  calculateTimeToComplete = (data) => {
    let date = new Date();
    let thisMonthStartDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    let lastMonthStartDate = new Date(date.getFullYear(), date.getMonth() - 1, 1, 0, 0, 0);
    let thisMonthCompletedCount = {};
    let lastMonthCompletedCount = {};
    this.createBrandObject(thisMonthCompletedCount);
    this.createBrandObject(lastMonthCompletedCount);
    data.map((selectedDesign, i) => {
      let operationTimes = {};
      let thisMonthCompletedTime = {};
      let lastMonthCompletedTime = {};
      this.createBrandObject(operationTimes);
      this.createBrandObject(thisMonthCompletedTime);
      this.createBrandObject(lastMonthCompletedTime);
      selectedDesign.steps && selectedDesign.steps.map((operation, ind) => {
        operationTimes['total'] += operation.estimatedTime;
        operationTimes[selectedDesign.brand] += operation.estimatedTime;
        if (selectedDesign.type === 2) {
          return false;
        }
        operation.operatorSteps && operation.operatorSteps.map((operatorStep, ind) => {
          if (new Date(operatorStep.completeTime) > new Date(thisMonthStartDate)) {
            thisMonthCompletedTime['total'] += operation.estimatedTime * operatorStep.quantity;
            thisMonthCompletedTime[selectedDesign.brand] += operation.estimatedTime * operatorStep.quantity;
          } else if (new Date(operatorStep.completeTime) > new Date(lastMonthStartDate)) {
            lastMonthCompletedTime['total'] += operation.estimatedTime * operatorStep.quantity;
            lastMonthCompletedTime[selectedDesign.brand] += operation.estimatedTime * operatorStep.quantity;
          }
          return operatorStep;
        });
        return operationTimes;
      });
      //this month
      thisMonthCompletedCount['total'] += thisMonthCompletedTime['total'] / operationTimes['total'] || 0;
      lastMonthCompletedCount['total'] += lastMonthCompletedTime['total'] / operationTimes['total'] || 0;
      this.state.settings.brands.forEach((item)=>{
        thisMonthCompletedCount[item] += thisMonthCompletedTime[item] / operationTimes[item] || 0;
        lastMonthCompletedCount[item] += lastMonthCompletedTime[item] / operationTimes[item] || 0;
      })

      selectedDesign.totalTime = operationTimes['total'];
      selectedDesign.sewingValueForSecond = (selectedDesign.sewingValue ? selectedDesign.sewingValue : 0) / operationTimes['total'];
      return selectedDesign;
    });
    console.log(thisMonthCompletedCount, lastMonthCompletedCount);
    this.setState({
      thisMonthCompletedCount: thisMonthCompletedCount,
      lastMonthCompletedCount: lastMonthCompletedCount,
    });
    return data;
  };

  createBrandObject = (obj) => {
    obj['total'] = 0;
    this.state.settings.brands.forEach((item)=>{
      obj[item] = 0;
    })
  }

  fetchOperators = () => {
    trackPromise(
      operatorService.getOperatorWithOperations()
        .then(
          data => {
            let date = new Date();
            let today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            let yesterday = moment(today).add(-1, 'days');
            let tomorrow = new Date(date.setDate(today.getDate() + 1));
            let thisMonthStartDate = moment(new Date()).subtract(1, 'months').endOf('month');
            let lastMonthStartDate = moment(new Date()).subtract(2, 'months').endOf('month');
            let helpersCount = 0;
            let cutterCount = 0;
            data.map((operator, ind) => {
              if(operator.type === "2"){
                helpersCount++;
              }
              if(operator.type === "3"){
                cutterCount++;
              }
              let todayTimeAndSalary = this.calculateSalary(operator, today, tomorrow);
              operator.todaySalary = todayTimeAndSalary.totalSalary;
              operator.todayTime = todayTimeAndSalary.totalTime;
              operator.todayCompleteCount = todayTimeAndSalary.totalCompleteCount['total'];

              let yesterdayTimeAndSalary = this.calculateSalary(operator, yesterday, today);
              operator.yesterdaySalary = yesterdayTimeAndSalary.totalSalary;
              operator.yesterdayTime = yesterdayTimeAndSalary.totalTime;
              operator.yesterdayCompleteCount = yesterdayTimeAndSalary.totalCompleteCount['total'];
              operator.yesterdayCLCompleteCount = yesterdayTimeAndSalary.totalCompleteCount['cleopatra'];
              operator.yesterdayNLMCompleteCount = yesterdayTimeAndSalary.totalCompleteCount['nolimit'];
              operator.yesterdayMBCompleteCount = yesterdayTimeAndSalary.totalCompleteCount['modabella'];

              let thisMonthTimeAndSalary = this.calculateSalary(operator, thisMonthStartDate, tomorrow);
              operator.thisMonthTime = thisMonthTimeAndSalary.totalTime;
              operator.thisMonthSalary = thisMonthTimeAndSalary.totalSalary;
              operator.thisMonthCompleteCount = thisMonthTimeAndSalary.totalCompleteCount['total'];
              operator.thisMonthCLCompleteCount = thisMonthTimeAndSalary.totalCompleteCount['cleopatra'];
              operator.thisMonthNLMCompleteCount = thisMonthTimeAndSalary.totalCompleteCount['nolimit'];
              operator.thisMonthMBCompleteCount = thisMonthTimeAndSalary.totalCompleteCount['modabella'];

              let lastMonthTimeAndSalary = this.calculateSalary(operator, lastMonthStartDate, thisMonthStartDate);
              operator.lastMonthTime = lastMonthTimeAndSalary.totalTime;
              operator.lastMonthSalary = lastMonthTimeAndSalary.totalSalary;
              operator.lastMonthCompleteCount = lastMonthTimeAndSalary.totalCompleteCount['total'];
              operator.lastMonthCLCompleteCount = lastMonthTimeAndSalary.totalCompleteCount['cleopatra'];
              operator.lastMonthNLMCompleteCount = lastMonthTimeAndSalary.totalCompleteCount['nolimit'];
              operator.lastMonthMBCompleteCount = lastMonthTimeAndSalary.totalCompleteCount['modabella'];

              operator.thisMonthWRKDays = this.calculateWorkDays(operator, thisMonthStartDate, tomorrow);
              operator.lastMonthWRKDays = this.calculateWorkDays(operator, lastMonthStartDate, thisMonthStartDate);
              operator.extraPayments = [];
              return operator;
            });
            const percentage = this.calculatePercentage(data);
            data.map((operator, ind) => {
              operator.todayPercentage = operator.todayTime === 0 ? 0 : Math.round((operator.todayTime / percentage.totalTodayTime) * 10000) / 100;
              operator.thisMonthPercentage = operator.thisMonthTime === 0 ? 0 : Math.round((operator.thisMonthTime / percentage.totalThisMonthTime) * 10000) / 100;
              operator.lastMonthPercentage = operator.lastMonthTime === 0 ? 0 : Math.round((operator.lastMonthTime / percentage.totalLastMonthTime) * 10000) / 100;
              return operator;
            });
            this.calculateBonus(data);
            this.addOperatorInfo(data);
            data = lodash.orderBy(data, ['todayTime', 'yesterdayTime'], ['desc', 'desc']);
            this.setState({
              operators: data,
              helpersCount: helpersCount,
              cutterCount: cutterCount
            });
          },
          error => {
            this.setState({msg: error});
            console.error('Error:', error);
          },
        ),
    );
  };

  calculateBonus(data) {
    let bestOperatorThisMonth = lodash.orderBy(data, ['thisMonthTime'], ['desc']);
    let bestOperatorLastMonth = lodash.orderBy(data, ['lastMonthTime'], ['desc']);
    bestOperatorThisMonth.map((operator, ind) => {
      if (operator.type !== '1') {
        operator.lastMonthBonus = 0;
        return false;
      }
      if (ind === 0) {
        operator.thisMonthBonus = 3000;
      } else if (ind === 1) {
        operator.thisMonthBonus = 2000;
      } else if (ind === 2) {
        operator.thisMonthBonus = 1000;
      } else if (ind === 3) {
        operator.thisMonthBonus = 500;
      } else {
        operator.thisMonthBonus = 0;
      }
      return operator;
    });
    bestOperatorLastMonth.map((operator, ind) => {
      if (operator.type !== '1') {
        operator.lastMonthBonus = 0;
        return false;
      }
      if (ind === 0) {
        operator.lastMonthBonus = 3000;
      } else if (ind === 1) {
        operator.lastMonthBonus = 2000;
      } else if (ind === 2) {
        operator.lastMonthBonus = 1000;
      } else if (ind === 3) {
        operator.lastMonthBonus = 500;
      } else {
        operator.lastMonthBonus = 0;
      }
      operator.performancePlaceLastMonth = this.ordinal_suffix_of(ind + 1);
      return operator;
    });
  }

  ordinal_suffix_of(i) {
    let j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  calculatePercentage(data) {
    let totalLastMonthTime = 0;
    let totalThisMonthTime = 0;
    let totalTodayTime = 0;
    data && data.map((operator, ind) => {
      if (operator.type !== '1') {
        return false;
      }
      totalLastMonthTime += operator.lastMonthTime;
      totalThisMonthTime += operator.thisMonthTime;
      totalTodayTime += operator.todayTime;
      return operator;
    });
    return {totalLastMonthTime, totalThisMonthTime, totalTodayTime};
  }

  timeFormatter(totalTime) {
    // return moment.duration(totalTime, 'seconds').format("d [d] hh [h] mm [min]")
    return (Math.floor(totalTime / 60 / 60 / 8) > 0 ? Math.floor(totalTime / 60 / 60 / 8) + ' days  ' : '') +
      (Math.floor(totalTime / 60 / 60 % 8) > 0 ? Math.floor(totalTime / 60 / 60 % 8) + ' hrs  ' : '') +
      (Math.floor(totalTime / 60 % 60) > 0 ? Math.floor(totalTime / 60 % 60) + ' mins  ' : '') +
      totalTime % 60 + ' secs';
  }

  salaryFormatter(salary) {
    return (
      <span className={'salary-format'}>Rs. <span>{salary ? salary.toFixed(2) : 0}</span></span>
    );
  }

  calculateWorkDays(operator, start, end) {
    let monthOperatorSteps = [];
    operator.operatorSteps && operator.operatorSteps.map((operatorStep, ind) => {
      if (new Date(start) > new Date(operatorStep.completeTime) || new Date(operatorStep.completeTime) > new Date(end)) {
        return operatorStep;
      }
      return monthOperatorSteps.push(operatorStep);
    });
    let monthWRKDays = lodash.groupBy(monthOperatorSteps, function(b) {
      return moment(b.completeTime).format('YYYY-MM-DD');
    });
    return Object.keys(monthWRKDays).length;
  }

  calculateSalary(operator, start, end) {
    let totalTime = 0;
    let totalCompleteCount = {};
    this.createBrandObject(totalCompleteCount)
    // let totalCLCompleteCount = 0;
    // let totalNLMCompleteCount = 0;
    // let totalMBCompleteCount = 0;
    let totalSalary = 0;
    operator.operatorSteps && operator.operatorSteps.map((operatorStep, ind) => {
      if (new Date(start) > new Date(operatorStep.completeTime) || new Date(operatorStep.completeTime) > new Date(end)) {
        return totalTime;
      }
      let design = lodash.find(this.state.designs, {'id': operatorStep.step.designId});
      if (!design) {
        alert('Design with id - ' + operatorStep.step.designId + ' not found');
      }
      totalTime += operatorStep.step.estimatedTime * operatorStep.quantity;
      totalCompleteCount['total'] += operatorStep.step.estimatedTime * operatorStep.quantity / design.totalTime;
      totalCompleteCount[design.brand] += operatorStep.step.estimatedTime * operatorStep.quantity / design.totalTime;

      totalSalary += operatorStep.step.estimatedTime * operatorStep.quantity * design.sewingValueForSecond;
      return operatorStep;
    });
    return {totalTime, totalSalary, totalCompleteCount};
  }

  calculateDaily(operatorSteps) {

    let totalTime = 0;
    let totalCompleteCount = 0;
    let totalSalary = 0;
    operatorSteps && operatorSteps.map((operatorStep, ind) => {
      let design = lodash.find(this.state.designs, {'id': operatorStep.step.designId});
      totalTime += operatorStep.step.estimatedTime * operatorStep.quantity;
      totalCompleteCount += operatorStep.step.estimatedTime * operatorStep.quantity / design.totalTime;
      totalSalary += operatorStep.step.estimatedTime * operatorStep.quantity * design.sewingValueForSecond;
      return operatorStep;
    });
    return `${this.salaryFormatter(totalSalary)} - ${moment.duration(totalTime, 'seconds').format('hh [hr] mm [min]')} ~ ${parseInt(totalCompleteCount)} Dresses`;
  }

  calculateTransport(operator) {
    let transport = 0;
    transport = operator.distance * operator.lastMonthWRKDays * this.state.settings.perKMPrice * 2;
    return this.state.settings.maxTransportAmount > transport ? transport : this.state.settings.maxTransportAmount;
  }

  calculateExtraPayments(operator) {
    let extraPaymentTotal = 0;
    operator.extraPayments.map((extraPayment) => {
      return extraPaymentTotal += extraPayment.val;
    });
    return extraPaymentTotal;
  }

  calculateTotalSalary(operator) {
    let totalSalary = 0;
    if(operator.type === "1" || operator.type === "2"){
      totalSalary += operator.lastMonthSalary + operator.lastMonthBonus;
    }
    if(operator.type === "3"){
      totalSalary = (this.state.lastMonthCompletedCount['nolimit'] * 20 + this.state.lastMonthCompletedCount['cleopatra'] * 50 + this.state.lastMonthCompletedCount['modabella'] * 100) / this.state.cutterCount;
    }
    if(operator.type === "4"){
      totalSalary = this.state.settings.qcSalary;
    }
    if(operator.type === "5"){
      totalSalary = this.state.lastMonthCompletedCount['total'] * 25;
    }
    totalSalary += this.calculateExtraPayments(operator)
    if (this.state.settings.isTransportEnable) {
      totalSalary += this.calculateTransport(operator);
    }
    return this.salaryFormatter(totalSalary);
  }

  addOperatorInfo(operators) {

    let days = [];
    operators.map((operator, i) => {
      operator.operatorSteps && operator.operatorSteps.map((operatorStep, ind) => {
        operatorStep.date = moment(operatorStep.completeTime).format('MMM DD YYYY');
        return operatorStep;
      });
      operator.operatorSteps = lodash.groupBy(operator.operatorSteps, 'date');
      Object.keys(operator.operatorSteps).map((key, index) => {
        if (!days.includes(key) && index < 5) {
          days.push(key);
        }
        return operator;
      });
      return operators;
    });
    days = days.slice(0, 5);
    this.setState({
      days: days.reverse(),
    });
  }

  viewOperatorInfo(operator) {

    this.setState({
      modal: {
        showInfoModal: true,
      },
      selectedOperator: operator,
    });
  }

  viewSalarySheetModal = () => {
    this.setState(prevState => ({
      modal: {
        ...prevState.modal,
        showSalaryModal: true,
      },
    }));
  };

  handleClose = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        showInfoModal: false,
        showSalaryModal: false,
      },
    });
  };

  print() {
    this.handleClose();
    window.print();
  }

  sortOperator = (type) => {
    if (type === 'today') {
      let operators = lodash.orderBy(this.state.operators, ['todaySalary'], ['desc']);
      this.setState({
        operators: operators,
      });
    }
    if (type === 'yesterday') {
      let operators = lodash.orderBy(this.state.operators, ['yesterdaySalary'], ['desc']);
      this.setState({
        operators: operators,
      });
    }
    if (type === 'thisMonth') {
      let operators = lodash.orderBy(this.state.operators, ['thisMonthSalary'], ['desc']);
      this.setState({
        operators: operators,
      });
    }
    if (type === 'lastMonth') {
      let operators = lodash.orderBy(this.state.operators, ['lastMonthSalary'], ['desc']);
      this.setState({
        operators: operators,
      });
    }
  };

  updateOperatorStep = (operatorStep, key, ind) => {
    trackPromise(
      operatorService.updateOperatorSteps(operatorStep.id, {'quantity': operatorStep.updatedQuantity})
        .then(
          data => {
            this.fetchOperators();
            operatorStep.editable = false;
            operatorStep.quantity = operatorStep.updatedQuantity;
            let operator = this.state.selectedOperator;
            operator.operatorSteps[key][ind] = operatorStep;
            this.setState({
              operator,
            });
          },
          error => {
            this.setState({msg: error});
            console.error('Error:', error);
          },
        ),
    );
  };

  render() {
    const date = new Date();
    return (
      <Container className={'non-printable'}>
        <br />
        <div className='d-flex flex-row justify-content-between mt-2 mb-2'>
          <div>
            <ButtonGroup size='sm'>
              <Button variant={this.state.operatorType === 'operator' ? 'primary' : 'outline-primary'}
                      onClick={() => this.setState({operatorType: 'operator'})}>Machine Operator</Button>
              <Button variant={this.state.operatorType === 'helper' ? 'primary' : 'outline-primary'}
                      onClick={() => this.setState({operatorType: 'helper'})}>Helper</Button>
            </ButtonGroup>

            {this.state.operatorType === 'operator' &&
            <h2 className={'mt-2'}>View Operators</h2>
            }
            {this.state.operatorType === 'helper' &&
            <h2 className={'mt-2'}>View Helpers</h2>
            }
          </div>
          <div>
            <div className={'flex-column'}>
              <div className={'d-flex flex-row'}>
                <div>
                  <div className={'justify-content-end'}>This Month Completed Count</div>
                  <div className={'justify-content-end'}>Cleopatra</div>
                  <div className={'justify-content-end'}>Modabella</div>
                  <div className={'justify-content-end'}>Nolimit</div>
                </div>
                <div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.thisMonthCompletedCount['total'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.thisMonthCompletedCount['cleopatra'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.thisMonthCompletedCount['modabella'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.thisMonthCompletedCount['nolimit'])}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={'flex-column'}>
              <div className={'d-flex flex-row'}>
                <div>
                  <div className={'justify-content-end'}>Last Month Completed Count</div>
                  <div className={'justify-content-end'}>Cleopatra</div>
                  <div className={'justify-content-end'}>Modabella</div>
                  <div className={'justify-content-end'}>Nolimit</div>
                </div>
                <div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.lastMonthCompletedCount['total'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.lastMonthCompletedCount['cleopatra'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.lastMonthCompletedCount['modabella'])}</div>
                  <div className={'justify-content-start'}> : {parseInt(this.state.lastMonthCompletedCount['nolimit'])}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={'d-flex flex-column'}>
            <Button variant={'primary'} onClick={this.viewSalarySheetModal}><FontAwesomeIcon
              icon={faPrint} /> Print Salary Sheet</Button>

            {this.state.operatorType === 'operator' &&
            <ButtonGroup className={'mt-3'} size='sm'>
              <Button variant={this.state.view === 'monthly' ? 'primary' : 'outline-primary'}
                      onClick={() => this.setState({view: 'monthly'})}>Monthly</Button>
              <Button variant={this.state.view === 'daily' ? 'primary' : 'outline-primary'}
                      onClick={() => this.setState({view: 'daily'})}>Daily</Button>
            </ButtonGroup>
            }
          </div>
        </div>
        {this.state.operatorType === 'operator' &&
        <div>
          <Row>
            {this.state.view === 'monthly' &&
            <Table striped bordered hover size='sm'>
              <thead>
              <tr>
                <th>Name</th>
                <th className={'d-none d-md-table-cell'}>Team</th>
                <th className={'cursor-pointer d-none d-md-table-cell'}
                    onClick={() => this.sortOperator('lastMonth')}>
                                        <span className={'d-none d-md-block'}>
                                        <Moment format={'MMMM'} subtract={{months: 1}}>
                                            {date}
                                        </Moment>
                                        </span>
                  <span className={'d-block d-md-none'}>
                                        <Moment format={'MMM'} subtract={{months: 1}}>
                                            {date}
                                        </Moment>
                                        </span>
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('thisMonth')}>
                                        <span className={'d-none d-md-block'}>
                                        <Moment format={'MMMM'}>
                                            {date}
                                        </Moment>
                                        </span>
                  <span className={'d-block d-md-none'}>
                                        <Moment format={'MMM'}>
                                            {date}
                                        </Moment>
                                        </span>
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('yesterday')}>
                  Yesterday
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('today')}>
                  Today
                </th>
                <th width={40}></th>
              </tr>
              </thead>
              <tbody>

              {this.state.operators && this.state.operators.map((operator, ind) => {
                if (operator.type !== '1') {
                  return false;
                }
                return (
                  <tr key={ind}>
                    <td>{operator.name}</td>
                    <td className={'d-none d-md-table-cell'}>{operator.team}</td>
                    <td className={'d-none d-md-table-cell'}>
                      <div>
                        <strong>{this.salaryFormatter(operator.lastMonthSalary)}</strong> + <small
                        className={'text-success'}>{this.salaryFormatter(operator.lastMonthBonus)}</small>
                      </div>
                      <div>
                        <small>{this.timeFormatter(operator.lastMonthTime)}</small> ~ <small>{parseInt(operator.lastMonthCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{this.salaryFormatter(operator.thisMonthSalary)}</strong> + <small
                        className={'text-muted'}>{this.salaryFormatter(operator.thisMonthBonus)}</small>
                      </div>
                      <div>
                        <small>{this.timeFormatter(operator.thisMonthTime)}</small> ~ <small>{parseInt(operator.thisMonthCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td>
                      <div><strong>{this.salaryFormatter(operator.yesterdaySalary)}</strong></div>
                      <div>
                        <small>{this.timeFormatter(operator.yesterdayTime)}</small> ~ <small>{parseInt(operator.yesterdayCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td>
                      <div><strong>{this.salaryFormatter(operator.todaySalary)}</strong></div>
                      <div>
                        <small>{this.timeFormatter(operator.todayTime)}</small> ~ <small>{parseInt(operator.todayCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td className={'text-center'}>
                      <Button variant={'outline-primary'}
                              onClick={() => this.viewOperatorInfo(operator)}
                              size={'sm'}>
                        <FontAwesomeIcon icon={faInfo} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </Table>
            }
            {this.state.view === 'daily' &&
            <Table striped bordered hover size='sm'>
              <thead>
              <tr>
                <th>Name</th>
                {this.state.days.map((day, ind) => {
                  return (
                    <th key={ind}>{this.state.days[ind]}</th>
                  );
                })}
                <th></th>
              </tr>
              </thead>
              <tbody>

              {this.state.operators && this.state.operators.map((operator, ind) => {
                if (operator.type !== '1') {
                  return false;
                }
                return (
                  <tr key={ind}>
                    <td>{operator.name}</td>
                    {this.state.days.map((day, ind) => {
                      return (
                        <td key={ind}>{this.calculateDaily(operator.operatorSteps[day])}</td>
                      );
                    })}
                    <td className={'text-center'}>
                      <Button variant={'outline-primary'}
                              onClick={() => this.viewOperatorInfo(operator)}
                              size={'sm'}>
                        <FontAwesomeIcon icon={faInfo} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </Table>
            }
          </Row>
        </div>
        }
        {this.state.operatorType === 'helper' &&
        <div>
          <Row>
            <Table striped bordered hover size='sm'>
              <thead>
              <tr>
                <th>Name</th>
                <th className={'cursor-pointer d-none d-md-table-cell'}
                    onClick={() => this.sortOperator('lastMonth')}>
                                        <span className={'d-none d-md-block'}>
                                        <Moment format={'MMMM'} subtract={{months: 1}}>
                                            {date}
                                        </Moment>
                                        </span>
                  <span className={'d-block d-md-none'}>
                                        <Moment format={'MMM'} subtract={{months: 1}}>
                                            {date}
                                        </Moment>
                                        </span>
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('thisMonth')}>
                                        <span className={'d-none d-md-block'}>
                                        <Moment format={'MMMM'}>
                                            {date}
                                        </Moment>
                                        </span>
                  <span className={'d-block d-md-none'}>
                                        <Moment format={'MMM'}>
                                            {date}
                                        </Moment>
                                        </span>
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('yesterday')}>
                  Yesterday
                </th>
                <th className={'cursor-pointer'} onClick={() => this.sortOperator('today')}>
                  Today
                </th>
                <th width={40}></th>
              </tr>
              </thead>
              <tbody>

              {this.state.operators && this.state.operators.map((operator, ind) => {
                if (operator.type === '1') {
                  return false;
                }
                let isQC = operator.type === '4';
                return (
                  <tr key={ind}>
                    <td>{operator.name}</td>
                    <td className={'d-none d-md-table-cell'}>
                      <div>
                        <strong>{this.salaryFormatter(operator.lastMonthSalary + (isQC ? this.state.lastMonthCompletedCount['total'] * 10 : 0))} </strong>
                        <br />
                        ~ <small>{parseInt(operator.lastMonthCompleteCount)} Helper
                        Dresses </small>
                        {isQC &&
                        <small> & {this.state.lastMonthCompletedCount['totlal']} Checked Dresses</small>
                        }
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{this.salaryFormatter(operator.thisMonthSalary + (isQC ? this.state.thisMonthCompletedCount * 10 : 0))} </strong>
                        <br />
                        ~ <small>{parseInt(operator.thisMonthCompleteCount)} Helper
                        Dresses</small>
                        {isQC &&
                        <small> & {this.state.thisMonthCompletedCount} Checked Dresses</small>
                        }
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{this.salaryFormatter(operator.yesterdaySalary)} </strong>
                        ~ <small>{parseInt(operator.yesterdayCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{this.salaryFormatter(operator.todaySalary)} </strong>
                        ~ <small>{parseInt(operator.todayCompleteCount)} Dresses</small>
                      </div>
                    </td>
                    <td className={'text-center'}>
                      <Button variant={'outline-primary'}
                              onClick={() => this.viewOperatorInfo(operator)}
                              size={'sm'}>
                        <FontAwesomeIcon icon={faInfo} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </Table>
          </Row>
        </div>
        }

        {/*operator info modal*/}
        <Modal scrollable show={this.state.modal.showInfoModal} onHide={this.handleClose} centered>

          <Modal.Header closeButton>
            <Modal.Title>{this.state.selectedOperator.name}'s Activities</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover size='sm'>
              <tbody>
              <tr>
                <td>Today Work</td>
                <td className={'text-right'}>{this.state.selectedOperator.todayPercentage} %</td>
                <td className={'text-right'}>{this.salaryFormatter(this.state.selectedOperator.todaySalary)}</td>
              </tr>
              <tr>
                <td>This Month Work</td>
                <td className={'text-right'}>{this.state.selectedOperator.thisMonthPercentage} %</td>
                <td className={'text-right'}>{this.salaryFormatter(this.state.selectedOperator.thisMonthSalary)}</td>
              </tr>
              <tr>
                <td>Last Month Work</td>
                <td className={'text-right'}>{this.state.selectedOperator.lastMonthPercentage} %</td>
                <td className={'text-right'}>{this.salaryFormatter(this.state.selectedOperator.lastMonthSalary)}</td>
              </tr>
              </tbody>
            </Table>
            <Accordion defaultActiveKey='0' className={'w-100'}>
              {this.state.selectedOperator.operatorSteps && Object.keys(this.state.selectedOperator.operatorSteps).map((key) => {
                return (
                  <Accordion.Item key={key} eventKey={key}>
                    <Accordion.Header className={'pl-1'}>
                      <h6 className={'d-flex justify-content-between m-0'}>
                        <span>{key}</span>
                        <span>{this.calculateDaily(this.state.selectedOperator.operatorSteps[key])}</span>
                      </h6>
                    </Accordion.Header>
                    <Accordion.Body className={'p-0'}>

                      <Table striped bordered hover size='sm'
                             className={'m-0'}>
                        <tbody>
                        {this.state.selectedOperator.operatorSteps[key].map((operatorStep, ind) => {
                          let design = lodash.find(this.state.designs, {'id': operatorStep.step.designId});
                          let isLast = this.state.selectedOperator.operatorSteps[key].length - 1 === ind;
                          return (
                            <tr key={ind}>
                              <td
                                className={`ps-4 border-left-0 ${isLast ? 'border-bottom-0' : ''}`}>{design.name}-{design.description}-{operatorStep.step.name}</td>
                              <td className={isLast ? 'border-bottom-0' : ''}>
                                {!operatorStep.editable &&
                                <span>{operatorStep.quantity}</span>}
                                {operatorStep.editable &&
                                <div className={'d-flex'}>
                                  <input name='quantity' type='number'
                                         className='form-control'
                                         defaultValue={operatorStep.quantity}
                                         onChange={(e) => {
                                           operatorStep.updatedQuantity = parseInt(e.target.value);
                                           let operator = this.state.selectedOperator;
                                           operator.operatorSteps[key][ind] = operatorStep;
                                           this.setState({
                                             operator,
                                           });
                                         }}
                                  />
                                  <Button variant={'primary'}
                                          onClick={() => {
                                            this.updateOperatorStep(operatorStep, key, ind);
                                          }}
                                          size={'sm'}>
                                    <FontAwesomeIcon icon={faUpload} />
                                  </Button>
                                </div>
                                }
                              </td>
                              <td
                                className={isLast ? 'border-bottom-0' : ''}>{moment.duration(operatorStep.step.estimatedTime * operatorStep.quantity, 'seconds').format('d [d] hh [h] mm [min]')}</td>
                              <td className={`text-center border-right-0 ${isLast ? 'border-bottom-0' : ''}`}>
                                <Button variant={'outline-primary'} className='mr-1'
                                        onClick={() => {
                                          operatorStep.editable = !operatorStep.editable;
                                          operatorStep.updatedQuantity = operatorStep.quantity;
                                          let operator = this.state.selectedOperator;
                                          operator.operatorSteps[key][ind] = operatorStep;
                                          this.setState({
                                            operator,
                                          });
                                        }}
                                        size={'sm'}>
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Modal.Body>
          <Modal.Footer>
            <Button disabled={this.state.isLoading} variant='secondary' onClick={this.handleClose}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>

        {/*Salary modal*/}
        <Modal scrollable show={this.state.modal.showSalaryModal} onHide={this.handleClose} centered>

          <Modal.Header closeButton>
            <Modal.Title>Salary Sheets</Modal.Title>
          </Modal.Header>
          <Modal.Body className='printable'>
            <Container>
              <Row>
                {this.state.operators && this.state.operators.map((operator, ind) => {
                  if (operator.lastMonthTime === 0 && operator.type === '1') {
                    return false;
                  } else {
                    return (
                      <div key={ind} className={'salary-table w-50 mb-5'}>
                        <Table borderless>
                          <colgroup>
                            <col />
                            <col />
                            <col />
                          </colgroup>
                          <tbody>
                          <tr>
                            <td colSpan={3} className={'text-center'}>
                              <div className={'flex-column align-items-center'}>
                                <div><img alt={'logo'} className={'logo-salary-print'}
                                          src={logo} /></div>
                                <br />
                                <div><small>Garment</small></div>
                                <div><small>Temple Road, Bingiriya</small></div>
                              </div>
                            </td>
                          </tr>
                          <tr className={'border-top'}>
                            <td colSpan={3} className={'text-center'}>
                              {operator.fullName || operator.name} - <small>
                              <Moment format={'MMMM YYYY'} subtract={{months: 1}}>
                                {date}
                              </Moment>
                            </small>
                            </td>
                          </tr>

                          {operator.type === '1' &&
                          <>
                            <tr className={'border-top'}>
                              <td>Working Hours</td>
                              <td className={'text-right'}>
                                <small>{this.timeFormatter(operator.lastMonthTime)}</small>
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td>Completed Dresses</td>
                              <td className={'text-right'}>
                                <small>{parseInt(operator.lastMonthCompleteCount)}</small>
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td>Salary</td>
                              <td></td>
                              <td>{this.salaryFormatter(operator.lastMonthSalary)}</td>
                            </tr>
                            <tr>
                              <td>Operator Of Month</td>
                              <td className={'text-right'}>
                                <small>{operator.performancePlaceLastMonth}</small>
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td>Operator Of Month Bonus</td>
                              <td></td>
                              <td className={'text-right'}>{this.salaryFormatter(operator.lastMonthBonus)}</td>
                            </tr>
                          </>
                          }
                          {operator.type === '2' &&
                            <>
                              <tr className={'border-top'}>
                                <td>Completed Dresses (Nolimit)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(operator.lastMonthNLMCompleteCount)}</small>
                                </td>
                                <td></td>
                              </tr>
                              <tr>
                                <td>Completed Dresses (Cleopatra)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(operator.lastMonthCLCompleteCount)}</small>
                                </td>
                                <td></td>
                              </tr>
                              <tr>
                                <td>Completed Dresses (Moda Bella)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(operator.lastMonthMBCompleteCount)}</small>
                                </td>
                                <td></td>
                              </tr>
                              <tr>
                                <td>Completed Dresses Total</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(operator.lastMonthCompleteCount)}</small>
                                </td>
                                <td></td>
                              </tr>
                              <tr>
                                <td>Salary (Helper)</td>
                                <td></td>
                                <td className={'text-right'}>{this.salaryFormatter(operator.lastMonthSalary)}</td>
                              </tr>
                            </>
                          }
                          {operator.type === '3' &&
                            <>
                              <tr className={'border-top'}>
                                <td>Number of cut garments (NOLIMIT)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(this.state.lastMonthCompletedCount['nolimit']) /this.state.cutterCount}</small>
                                </td>
                                <td/>
                              </tr>
                              <tr>
                                <td/>
                                <td/>
                                <td>{this.salaryFormatter(parseInt(this.state.lastMonthCompletedCount['nolimit']) /this.state.cutterCount * 20)}</td>
                              </tr>
                              <tr>
                                <td>Number of cut garments (CLEOPATRA)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(this.state.lastMonthCompletedCount['cleopatra']) /this.state.cutterCount}</small>
                                </td>
                                <td/>
                              </tr>
                              <tr>
                                <td/>
                                <td/>
                                <td>{this.salaryFormatter(parseInt(this.state.lastMonthCompletedCount['cleopatra']) /this.state.cutterCount * 50)}</td>
                              </tr>
                              <tr>
                                <td>Number of cut garments (MODABELLA)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(this.state.lastMonthCompletedCount['modabella']) /this.state.cutterCount}</small>
                                </td>
                                <td/>
                              </tr>
                              <tr>
                                <td/>
                                <td/>
                                <td>{this.salaryFormatter(parseInt(this.state.lastMonthCompletedCount['modabella']) /this.state.cutterCount * 100)}</td>
                              </tr>
                              <tr>
                                <td>Number of cut garments (Total)</td>
                                <td className={'text-right'}>
                                  <small>{parseInt(this.state.lastMonthCompletedCount['total']) /this.state.cutterCount}</small>
                                </td>
                                <td/>
                              </tr>
                              <tr>
                                <td/>
                                <td/>
                                <td>{this.calculateTotalSalary(operator)}</td>
                              </tr>
                            </>
                          }
                          {this.state.settings.isTransportEnable &&
                          <tr>
                            <td>Transport</td>
                            <td>
                              <div>Work Days: <input style={{width: '50px'}}
                                                     className={'small border-0'}
                                                     defaultValue={operator.lastMonthWRKDays}
                                                     onChange={(e) => {
                                                       operator.lastMonthWRKDays = parseInt(e.target.value);
                                                       let operators = this.state.operators;
                                                       operators[ind] = operator;
                                                       this.setState({
                                                         operators,
                                                       });
                                                     }} />
                              </div>
                              <div>
                                Distance (KM) : {operator.distance}
                              </div>
                            </td>
                            <td
                              className={'text-right'}>{this.salaryFormatter(this.calculateTransport(operator))}</td>
                          </tr>
                          }
                          <tr className={'non-printable'}>
                            <td colSpan={3}>
                              <Button onClick={(e) => {
                                let op = operator;
                                op.extraPayments.push({
                                  label: '',
                                  val: 0,
                                });
                                let operators = this.state.operators;
                                operators[ind] = op;
                                this.setState({
                                  operators,
                                });
                              }} variant='primary'>Add Extra</Button>
                            </td>
                          </tr>
                          {operator.extraPayments.map((payment, i) => {
                            return (
                              <>
                                <tr className='non-printable'>
                                  <td>
                                    <Button size={'sm'} variant='danger'> - </Button>
                                  </td>
                                  <td className='vertical_align_middle'>
                                    <input className={'small border-0 border-bottom'}
                                           defaultValue={payment.label}
                                           onChange={(e) => {
                                             payment.label = e.target.value;
                                             let op = operator;
                                             op.extraPayments[i] = payment;
                                             let operators = this.state.operators;
                                             operators[ind] = op;
                                             this.setState({
                                               operators,
                                             });
                                           }} />
                                  </td>
                                  <td className='vertical_align_middle'> Rs.
                                    <input className={'small border-0 border-bottom'}
                                           defaultValue={payment.val}
                                           onChange={(e) => {
                                             payment.val = parseInt(e.target.value);
                                             let op = operator;
                                             op.extraPayments[i] = payment;
                                             let operators = this.state.operators;
                                             operators[ind] = op;
                                             this.setState({
                                               operators,
                                             });
                                           }} />
                                  </td>
                                </tr>
                                <tr className='d-none printable-row'>
                                  <td className='vertical_align_middle'>{payment.label}</td>
                                  <td></td>
                                  <td className='vertical_align_middle'>{this.salaryFormatter(payment.val)}</td>
                                </tr>
                              </>
                            );
                          })}
                          <tr className={'border-top'}>
                            <td>Total Salary</td>
                            <td></td>
                            <td className={'text-right border-bottom'}>
                              <strong>{this.calculateTotalSalary(operator)}</strong>
                            </td>
                          </tr>
                          </tbody>
                        </Table>
                      </div>
                    );
                  }
                  return true;
                })}
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={() => {
              this.print();
            }}>Print</Button>{' '}
            <Button variant='secondary' onClick={this.handleClose}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}
