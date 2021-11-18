import React from "react";
import {Button, Col, Row, Table} from "react-bootstrap";
import readXlsxFile from 'read-excel-file';
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {codService} from "../../../services";
import {toast} from "react-toastify";
import DatePicker from 'react-date-picker';
import {trackPromise} from "react-promise-tracker";


export default class AddCod extends React.Component {

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    fileInput = {};

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            header: [],
            rows: [],
            printableBills: [],
            date: new Date(),
        };
        this.handleChange = this.handleChange.bind(this);
        this.addCod = this.addCod.bind(this);
    }

    notifyError = (error) => toast.error(error);
    notifySuccess = (msg) => toast.success(msg);

    handleChange(parameters) {
        let selectorFiles = parameters.selectorFiles;
        let header;
        const cods = [];
        this.setState({
            selectedFile: null,
            header: [],
            rows: [],
            printableBills: [],
        })
        readXlsxFile(selectorFiles[0]).then((rows) => {
            if (rows[0][0] === 'TrackingNo') {
                header = rows.shift()
            } else {

                this.notifyError('File invalid. Check the excel file before uploading');
                return false;
            }

            let cod = {};
            rows.map((row, i) => {
                cod = {};
                if(row[0] === null) {
                    return cod;
                }
                cod.cod = row[0];
                cod.amount = parseFloat(row[1]);
                cod.customer_name = row[2];
                cod.customer_address = row[3];
                cod.phone_no = row[4];
                cod.city = row[5];
                cod.description = row[6];
                cod.note = row[7];
                cod.status = 'dispatch';
                cod.weight = 1;
                cod.date = this.state.date;
                return cods.push(cod);
            });
            this.setState({rows: rows, header: header, selectedFile: selectorFiles, cods: cods});
        })
    }

    addCod(event) {
        trackPromise(
            codService.addCods(this.state.cods)
                .then(
                    data => {
                        this.setState({
                            isLoading: false,
                            form: {
                                ...this.state.form,
                                name: ""
                            },
                        });
                        this.notifySuccess(`${this.state.cods.length} COD's added successfully`);
                    },
                    error => {
                        this.notifyError(error);
                    }
                ));
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        return (
            <div className="App with-fixed-header">
                <Row className="d-flex flex-row justify-content-between pt-2 pb-2 fixed-top fixed-header pl-3 pr-3 bg-white border-bottom">
                    <Col md={4} className="text-left d-flex flex-row justify-content-between">
                        <div className="custom-file">
                            <input type="file" className="custom-file-input" id="customFile"
                                   onChange={(e) => this.handleChange({selectorFiles: e.target.files})}
                                   ref={ref => (this.fileInput = ref)}/>
                            <label className="custom-file-label"
                                   htmlFor="customFile">{this.state.selectedFile ? this.state.selectedFile[0].name : 'Choose file'}</label>
                        </div>
                        <div className={'ml-2 custom-file'}>
                            {/*<input className={"custom-control"} type="date" onChange={(e) => this.handleInputChange()} defaultValue={this.state.date}/>*/}
                            <DatePicker className={'w-100 h-100 border border-success'} value={this.state.date} onChange={date => this.setState({date})} />
                        </div>
                    </Col>
                    <Col className={'text-right'}>
                        {this.state.rows.length > 0 &&
                        <Button className={'mr-2'} variant={'primary'} onClick={this.addCod}><FontAwesomeIcon
                            icon={faUpload}/> Upload {this.state.rows.length} items</Button>
                        }
                    </Col>
                </Row>

                {this.state.rows.length > 0 &&
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>{this.state.header[0]}</th>
                        <th>{this.state.header[1]}</th>
                        <th>{this.state.header[2]}</th>
                        <th>{this.state.header[3]}</th>
                        <th>{this.state.header[4]}</th>
                        <th>{this.state.header[5]}</th>
                        <th>{this.state.header[6]}</th>
                        <th>{this.state.header[7] || 'Notes'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.rows.map((row, i) => {

                        return (
                            <tr key={i}>
                                <td>{row[0]}</td>
                                <td>{row[1]}</td>
                                <td>{row[2]}</td>
                                <td>{row[3]}</td>
                                <td>{row[4]}</td>
                                <td>{row[5]}</td>
                                <td>{row[6]}</td>
                                <td>{row[7]}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
                }

            </div>
        );
    }
}