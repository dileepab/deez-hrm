import React from "react";
import {Button, Modal, Table} from "react-bootstrap";
import readXlsxFile from 'read-excel-file';
import {faPrint} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


export default class PrintCod extends React.Component {

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    fileInput = {};

    constructor(props) {
        super(props);
        this.state = {
            modal: {
                show: false
            },
            selectedFile: null,
            header: [],
            rows: [],
            printableBills: [],
            date: new Date(),
        };
        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.print = this.print.bind(this);
        this.printAll = this.printAll.bind(this);
        this.printSelected = this.printSelected.bind(this);
        this.printOne = this.printOne.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(rowId, ind, event) {
        if (!event) return;
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        let rows = this.state.printableBills;
        rows[rowId][ind] = value;
        this.setState({printableBills: rows});
    }

    handleChange(parameters) {
        let selectorFiles = parameters.selectorFiles;
        let header;
        console.log(selectorFiles);
        readXlsxFile(selectorFiles[0]).then((rows) => {
            if(rows[0][0] === 'TrackingNo'){
                header = rows.shift()
            }

            rows.map((row, i) => {
                return row.selected = false
            });
            this.setState({rows: rows, header: header, selectedFile: selectorFiles});
            // this.toggle()
            // `rows` is an array of rows
            // each row being an array of cells.
        })
        // XLSX.read(selectorFiles[0]);
    }

    toggle() {
        this.setState({
            modal: {
                ...this.state.modal,
                show: !this.state.modal.show
            }
        });
        // this.fileInput.value = '';
    }

    print() {
        this.toggle();
        window.print();
    }

    printOne(bill) {
        this.setState({
            printableBills: [bill]
        });
        this.toggle();
    }

    printAll() {
        this.setState({
            printableBills: this.state.rows
        });
        this.toggle();
    }

    toggleSelected(i, elem) {
        let rows = this.state.rows;
        rows[i].selected = elem.target.checked;
        this.setState({rows});
    }

    printSelected() {
        let selected = [];

        this.state.rows.map((row, i) => {
            if (row.selected) {
                selected.push(row);
            }
            return row;
        });
        this.setState({
            printableBills: selected
        });
        this.toggle();
    }

    render() {
        return (
            <div className="App non-printable">
                <div className="d-flex flex-row justify-content-between mt-2 mb-2">
                    <div className="custom-file w-25 text-left">
                        <input type="file" className="custom-file-input" id="customFile" onChange={ (e) => this.handleChange({selectorFiles: e.target.files})}
                               ref={ref => (this.fileInput = ref)}/>
                            <label className="custom-file-label" htmlFor="customFile">{this.state.selectedFile? this.state.selectedFile[0].name : 'Choose file'}</label>
                    </div>
                    <div>
                        <Button className={'mr-2'} variant={'primary'} onClick={this.printAll}><FontAwesomeIcon icon={faPrint}/> Print All</Button>
                        <Button variant={'primary'} onClick={this.printSelected}><FontAwesomeIcon icon={faPrint}/> Print Selected</Button>
                    </div>
                </div>

                {this.state.rows.length > 0 &&
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th></th>
                        <th>{this.state.header[0]}</th>
                        <th>{this.state.header[1]}</th>
                        <th>{this.state.header[2]}</th>
                        <th>{this.state.header[3]}</th>
                        <th>{this.state.header[4]}</th>
                        <th>{this.state.header[5]}</th>
                        <th>{this.state.header[6]}</th>
                        <th>{this.state.header[7] || 'Notes'}</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.rows.map((row, i) => {

                        return (
                            <tr key={i}>
                                <td><input style={{margin: '10px'}} type="checkbox" defaultChecked={row.selected}
                                           onChange={(elem) => this.toggleSelected(i, elem)}/>
                                </td>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                                <td>{row[2]}</td>
                                <td>{row[3]}</td>
                                <td>{row[4]}</td>
                                <td>{row[5]}</td>
                                <td>{row[6]}</td>
                                <td>{row[7]}</td>
                                <td>
                                    <Button variant={'primary'} onClick={() => this.printOne(row)}><FontAwesomeIcon icon={faPrint}/></Button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
                }

                <Modal show={this.state.modal.show} onHide={this.handleClose} centered>
                    <Modal.Body className="printable">
                        {this.state.printableBills.map((row, i) => {

                            return <div className="bill" key={i}>
                                <div className="left">
                                    <img alt={'logo'} className="logo" src={require("../../../../src/img/logo-cleopatra.png")}/>
                                    <span className="phone-number">0775025907</span>
                                </div>
                                <div className="center">
                                    <span className="contact-name">{row[2]}</span>
                                    <span className="contact-address">{row[3]}</span>
                                    <span className="contact-number">{row[4]}</span>
                                </div>

                                <div className="right">
                                    <span>{row[0]}</span>
                                    <span>{row[6]}</span>
                                    <span>Rs.{row[1]}.00</span>
                                </div>
                            </div>
                        })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="primary" onClick={this.print}>Print</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}