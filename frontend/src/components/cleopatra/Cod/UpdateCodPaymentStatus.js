import React from "react";
import {toast} from "react-toastify";
import {Button, Col, Row, Table} from "react-bootstrap";
import lodash from "lodash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import readXlsxFile from "read-excel-file";
import {codService} from "../../../services";
import {trackPromise} from "react-promise-tracker";


export default class UpdateCodPaymentStatus extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            selectedFile: null,
            header: [],
            rows: [],
        }
        this.updateCodPaymentStatus = this.updateCodPaymentStatus.bind(this);
    }

    componentDidMount() {
        // this.searchCod();
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

            let i = rows.length;
            while (i--) {
                if(rows[i][0] === null){
                    rows.splice(i, 1);
                }
                else if(rows[i][0].indexOf('COD0') !== -1) {
                    cods.push({cod : rows[i][0]})
                } else if(rows[i][0].indexOf('Tracking No') !== -1){
                    header = lodash.cloneDeep(rows[i]);
                    rows.splice(i, 1);
                }else {
                    rows.splice(i, 1);
                }
            }
            if (rows.length === 0) {
                this.notifyError('File invalid. Check the excel file before uploading');
                return false;
            }

            this.setState({rows: rows, header: header, selectedFile: selectorFiles, cods: cods});
        })
    }

    updateCodPaymentStatus(event) {

        console.log(this.state.cods);
        trackPromise(
        codService.updateCodPaymentReceived(this.state.cods)
            .then(
                data => {
                    this.setState({
                        selectedFile: null,
                        header: [],
                        rows: [],
                        printableBills: [],
                    });
                    this.notifySuccess(`${this.state.cods.length} COD's updated successfully`);
                },
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
                    </Col>
                    <Col className={'text-right'}>
                        {this.state.rows.length > 0 &&
                        <Button className={'mr-2'} variant={'primary'} onClick={this.updateCodPaymentStatus}><FontAwesomeIcon
                            icon={faUpload}/> Update {this.state.rows.length} items Payment Status</Button>
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
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
                }

            </div>
        )
    }
}