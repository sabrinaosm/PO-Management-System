import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './ViewPO.css'
import axios from 'axios';

function ViewPO({ selectedPO }) {

    const [invoices, setInvoices] = useState([]);
    const [updatedPO, setUpdatedPO] = useState({...selectedPO});

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/invoices/all")
            .then((response) => {
                // Get filtered invoices using the purchaseOrderRef in each invoice that's corresponding to the selected PO's number
                const filteredInvoices = response.data.filter(invoice => invoice.purchaseOrderRef === selectedPO.poNumber);
                setInvoices(filteredInvoices);
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });
    }, [selectedPO]);

    const updatePO = () => {
        axios
            .put(`http://localhost:8080/api/po/update/${selectedPO.id}`, updatedPO)
            .then((response) => {
                console.log('Purchase order updated successfully:', response.data);
            })
            .catch((error) => {
                console.error('Error updating purchase order:', error);
            });
    };

    const deletePO = () => {
        axios
            .delete(`http://localhost:8080/api/po/delete/${selectedPO.id}`)
            .then((response) => {
                console.log('Purchase order deleted successfully:', response.data);
            })
            .catch((error) => {
                console.error('Error deleting purchase order:', error);
            });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedPO(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    function handleShowInvoiceModalClose() {
        setShowInvoiceModal(false);
    }

    return (
        <div className='modal-fade'>
            {/* Current PO */}
            <div>
                    <table className='table table-light table-hover'>
                        <thead>
                            <tr>
                                <th scope="col">PO #</th>
                                <th scope="col">Client</th>
                                <th scope="col">Type</th>
                                <th scope="col">Start Date</th>
                                <th scope="col">End Date</th>
                                <th scope="col">Milestone (%)</th>
                                <th scope="col">Total Value</th>
                                <th scope="col">Total Balance</th>
                                <th scope="col">Status</th>
                                <th scope='col'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{selectedPO.poNumber}</td>
                                <td>{selectedPO.clientName}</td>
                                <td>{selectedPO.type}</td>
                                <td>{selectedPO.startDate}</td>
                                <td>{selectedPO.endDate}</td>
                                <td>{selectedPO.milestone}</td>
                                <td>{selectedPO.totalValue}</td>
                                <td>{selectedPO.balValue}</td>
                                <td>{selectedPO.status}</td>
                                <td>
                                    <button className='update-btn p-1'>
                                        <i className="fi fi-sr-file-edit p-1"></i>
                                    </button>
                                    <button className='delete-btn p-1'>
                                        <i className="fi fi-sr-trash delete p-1"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            {/* All Invoices */}
            <div>
                <h5>Invoices</h5>
                <table className='table table-light table-hover'>
                    <thead>
                        <tr>
                            <th scope="col">Invoice #</th>
                            <th scope="col">PO Number Ref</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Date Billed</th>
                            <th scope="col">Due Date</th>
                            <th scope="col">Status</th>
                            <th scope='col'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{invoice.purchaseOrderRef}</td>
                                <td>{invoice.amount}</td>
                                <td>{invoice.dateBilled}</td>
                                <td>{invoice.dueDate}</td>
                                <td>{invoice.status}</td>
                                <td>
                                    <button
                                        type='button'
                                        className='btn btn-dark'
                                        onClick={() => {
                                            setSelectedInvoice(invoice)
                                            setShowInvoiceModal(true)
                                        }}
                                    >
                                        <i className="fi fi-sr-file-edit p-1"></i>
                                    </button>
                                    <button className='delete-btn p-1'>
                                            <i className="fi fi-sr-trash delete p-1"></i>
                                        </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Update Invoice Modal */}
            <Modal show={showInvoiceModal} onHide={handleShowInvoiceModalClose} dialogClassName='custom-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>Update Invoice</Modal.Title>
                </Modal.Header>
                <Modal.Body>{showInvoiceModal && <UpdateInvoice selectedInvoice={selectedInvoice} closeModal={handleShowInvoiceModalClose} />}</Modal.Body>
            </Modal>
            <div>
            </div>
        </div>
    )
}

export default ViewPO