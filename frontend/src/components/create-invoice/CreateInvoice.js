import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './CreateInvoice.css';

function CreateInvoice({ selectedPO, closeModal, isTS, onInvUpdated }) {

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const [invoiceData, setInvoiceData] = useState({
    purchaseOrderRef: '',
    invoiceNumber: '',
    amount: '',
    dateBilled: '',
    dueDate: '',
    status: '',
  });

  // For document uploads:
  const [file, setFile] = useState(null);
  const fileInput = useRef();

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (selectedPO) {
      setInvoiceData((prevState) => ({
        ...prevState,
        purchaseOrderRef: selectedPO.poNumber,
      }));
    }
  }, [selectedPO]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInvoiceData((prevState) => ({ ...prevState, [name]: value }));
  };

  const removeFile = () => {
    setFile(null);
    fileInput.current.value = null;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (parseFloat(invoiceData.amount) > selectedPO.balValue) {
      setValidationError('Amount cannot exceed the balance value of the selected purchase order.');
      return;
    }

    const createdAt = new Date().toISOString();
    const newInvoice = { ...invoiceData, createdAt };

    // Create a new form
    const formData = new FormData();

    // Append all values to the form
    for (let name in newInvoice) {
      formData.append(name, newInvoice[name]);
    }

    // Append the file to the form
    if (file) {
      formData.append('file', file);
    }

    axios
      .post('http://localhost:8080/api/invoices/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      })
      .then((response) => {
        onInvUpdated(newInvoice.invoiceNumber)
        console.log('New invoice created successfully: ', response.data);
        setInvoiceData({
          purchaseOrderRef: '',
          invoiceNumber: '',
          amount: '',
          dateBilled: '',
          dueDate: '',
          status: '',
        });
        setFile(null);  // Clear the file state
        setValidationError('');

        // Create history item after invoice is created:
        const formattedDate = new Date().toLocaleDateString('en-GB');

        const notification = {
          message: `New Invoice ${newInvoice.invoiceNumber} created by ${username} on ${formattedDate}`,
          userRole: `${role}`
        };

        axios
          .post('http://localhost:8080/api/notification/create', notification)
          .then(response => {
            console.log('Notification created successfully')
          })
          .catch(error => {
            console.error(`Error creating notification: ${error}`)
          });

        closeModal();
      })
      .catch((error) => {
        console.error('Error creating invoice:', error);
      });

    if (newInvoice.status === "Paid" && selectedPO.balValue >= newInvoice.amount) {
      const updatedBalValue = selectedPO.balValue - newInvoice.amount;
      let updatedMilestone;
      let updatedStatus;

      if (isTS) {
        updatedMilestone = ((selectedPO.totalValue - updatedBalValue) / selectedPO.totalValue) * 100;
      }

      if (updatedBalValue === 0) {
        updatedStatus = "Completed"
      }

      const patchData = {
        balValue: updatedBalValue,
        milestone: updatedMilestone,
        status: updatedStatus
      };

      axios
        .patch(`http://localhost:8080/api/po/update/${selectedPO.id}`, patchData)
        .then((response) => {
          console.log('Purchase order updated successfully:', response.data);

          closeModal();
        })
        .catch((error) => {
          console.error('Error updating purchase order:', error);
        });

    }
  };

  return (
    <div className="invoice-container">
      <form onSubmit={handleSubmit} className="create-invoice-model">
        <div>
          <label htmlFor="purchaseOrderRef">Purchase Order Reference</label>
          <input
            type="text"
            id="purchaseOrderRef"
            name="purchaseOrderRef"
            value={invoiceData.purchaseOrderRef}
            onChange={handleChange}
            placeholder="Enter Purchase Order Reference"
            className="form-control"
            disabled
          />
        </div>
        <div>
          <label htmlFor="invoiceNumber">Invoice Number</label>
          <input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
            onChange={handleChange}
            placeholder="Enter Invoice Number"
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={invoiceData.amount}
            onChange={handleChange}
            placeholder="Enter Amount"
            className="form-control"
          />
          {validationError && <div className="text-danger">{validationError}</div>}
        </div>
        <div>
          <label htmlFor="dateBilled">Date Billed</label>
          <input
            type="date"
            id="dateBilled"
            name="dateBilled"
            value={invoiceData.dateBilled}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={invoiceData.dueDate}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="status">Payment Status</label>
          <select
            id="status"
            name="status"
            value={invoiceData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="" disabled>
              Select Status
            </option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div>
          <label className='me-1' htmlFor="file">File</label>
          <input
            className='w-25'
            type="file"
            id="file"
            name="file"
            ref={fileInput}
            onChange={(event) => setFile(event.target.files[0])}
          />
          {file && (
            <button className='ms-2' type="button" onClick={removeFile}>
              <i class="fi fi-ss-cross-circle"></i>
            </button>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Create Invoice
        </button>
      </form>
    </div>
  );
}

export default CreateInvoice;
