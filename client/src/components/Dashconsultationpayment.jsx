import React, { useState, useEffect } from "react";
import { Table, Modal, TextInput, Button } from "flowbite-react";
import { FaTimes, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import "react-toastify/dist/ReactToastify.css";



export default function Dashconsultationpayment() {
    const [consultationPayments, setConsultationPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal0, setShowModal0] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [updatedPayment, setUpdatedPayment] = useState({
        // dateAndTime: "",
        patientName: "",
        patientEmail: "",
        totalPayment: 0,
        paymentType: "",
        status: "",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    useEffect(() => {
        fetchConsultationPayments();
    }, []);

    async function fetchConsultationPayments() {
        try {
            const response = await fetch('/api/payment/getAllConsultationPayments');
            if (!response.ok) {
                throw new Error('Failed to fetch consultation payments');
            }
            const data = await response.json();
            setConsultationPayments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching consultation payments:', error);
            toast.error('Failed to fetch consultation payments');
            setLoading(false);
        }
    }


    useEffect(() => {
        const filteredResults = consultationPayments.filter(payment => {
            const patientName = payment.patientName || ''; // Null check for patientName
            const patientEmail = payment.patientEmail || ''; // Null check for patientEmail
            const isMatchingStatus = selectedStatus ? payment.status === selectedStatus : true;
            const isMatchingPaymentType = selectedPaymentType ? payment.paymentType === selectedPaymentType : true;
            const isMatchingSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patientEmail.toLowerCase().includes(searchQuery.toLowerCase());
            return isMatchingStatus && isMatchingPaymentType && isMatchingSearch;
        });
        setSearchResults(filteredResults);
    }, [searchQuery, consultationPayments, selectedStatus, selectedPaymentType]);




    const handleEdit = (payment) => {
        setSelectedPayment(payment);
        setShowUpdateModal(true);
        setUpdatedPayment(payment); // Set current details in the update form
    };
    const handleUpdate = async () => {
        // Form validation
        if (updatedPayment.paymentType === "Card") {
            if (!updatedPayment.cardNumber || !updatedPayment.cardHolderName || !updatedPayment.expirationDate || !updatedPayment.cvv) {
                toast.error("Please fill in all card details");
                return;
            }
        }

        try {
            const response = await fetch(`/api/payment/updateConsultPayment/${selectedPayment._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: updatedPayment.status }),
            });
            if (!response.ok) {
                throw new Error('Failed to update payment');
            }
            toast.success('Payment updated successfully');
            setShowUpdateModal(false);
            // Refresh payment list
            fetchConsultationPayments();
        } catch (error) {
            console.error('Error updating payment:', error);
            toast.error('Failed to update payment');
        }
    };




    const [deletingPaymentId, setDeletingPaymentId] = useState(null);

    const handleDeleteLeave = async (paymentId) => {
        setDeletingPaymentId(paymentId);
        setShowModal2(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/payment/deleteConsultPayment/${deletingPaymentId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete payment');
            }
            toast.success('Payment deleted successfully');
            // Refresh payment list after deletion
            fetchConsultationPayments();
            // Close the modal after deletion
            setShowModal2(false);
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error('Failed to delete payment');
        }
    };


    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Function to format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    };


    const handleGenerateReport = async () => {
        try {
            const monthName = generateMonthName(selectedMonth);
            const fileName = `Consultation-Payments-${monthName}.pdf`;

            // Fetch data for report generation
            const res = await fetch(
                `/api/payment/PDFConsultationPayments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ selectedMonth, consultationPayments }), // Pass payment data and selected month
                }
            );
            if (!res.ok) {
                throw new Error("Failed to generate PDF");
            }
            const pdfBlob = await res.blob();

            // Create blob URL
            const url = window.URL.createObjectURL(pdfBlob);

            // Create temporary link element
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName ; // Set download attribute
            document.body.appendChild(a);

            // Click link to initiate download
            a.click();

            // Remove link from DOM
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
        }
    };

        // Function to generate month name
        const generateMonthName = (monthIndex) => {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            return monthNames[parseInt(monthIndex)];
        };

        const handleMonthChange = (e) => {
            setSelectedMonth(e.target.value);
        };
        
    
            // Function to generate month options
    const generateMonthOptions = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const monthOptions = [];
        for (let i = 0; i < 3; i++) {
            const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping for previous years
            const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentDate.getFullYear(), monthIndex, 1));
            monthOptions.push({ value: monthIndex.toString(), label: monthName });
        }
        return monthOptions.map(month => (
            <option key={month.value} value={month.value}>
                {month.label}
            </option>
        ));
    };
    

    return (
        <div className="table-auto overflow-x-scroll md:mx-auto p-3">
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <TextInput
                        rightIcon={AiOutlineSearch}
                        className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search by patient name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <select
                        className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
                <div className="flex-1">
                    <select
                        className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                    >
                        <option value="">All Payment Type</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                    </select>
                </div>
                <div className="mb-4">
                    <Button
                        gradientDuoTone="purpleToPink"
                        onClick={() => setShowModal0(true)}
                        className="text-left inline-block"
                    >
                        Report
                    </Button>
                </div>
            </div>


            {loading ? (
                <p>Loading...</p>
            ) : (
                <Table hoverable className="shadow-md">
                    {/* Table headers */}
                    <Table.Head>
                        <Table.HeadCell>Date</Table.HeadCell>
                        <Table.HeadCell>Time</Table.HeadCell>
                        <Table.HeadCell>Patient Name</Table.HeadCell>
                        <Table.HeadCell>Patient Email</Table.HeadCell>
                        <Table.HeadCell>Total Payment</Table.HeadCell>
                        <Table.HeadCell>Payment Type</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Pay</Table.HeadCell>
                        <Table.HeadCell>Delete</Table.HeadCell>
                    </Table.Head>
                    {/* Table body */}
                    <Table.Body>
                        {searchResults.map((payment) => (
                            <Table.Row key={payment._id}>
                                <Table.Cell>{formatDate(payment.dateAndTime)}</Table.Cell>
                                <Table.Cell>{formatTime(payment.dateAndTime)}</Table.Cell>
                                <Table.Cell>{payment.patientName}</Table.Cell>
                                <Table.Cell>{payment.patientEmail}</Table.Cell>
                                <Table.Cell>{payment.totalPayment}</Table.Cell>
                                <Table.Cell>{payment.paymentType}</Table.Cell>
                                <Table.Cell>
                                    {payment.status === "Completed" ? (
                                        <FaCheck className="text-green-500" />
                                    ) : payment.status === "Failed" ? (
                                        <FaTimes className="text-red-500" />
                                    ) : (
                                        "Pending"
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        className="font-medium text-blue-500 hover:underline cursor-pointer"
                                        onClick={() => { handleEdit(payment) }}
                                    >
                                        Pay
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        onClick={() => handleDeleteLeave(payment._id)}
                                        className="font-medium text-red-500 hover:underline cursor-pointer"
                                    >
                                        Delete
                                    </span>
                                </Table.Cell>

                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
            {/* Pay  modal */}
            <Modal
                show={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                size="md"
            >

                <Modal.Body>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Payment</h3>
                    </div>
                    <div className="mt-4">
                        <label className="block text-lg font-semibold ">Patient: {updatedPayment.patientName}</label>
                    </div>
                    <div className="mt-4">
                        <label className="block text-lg font-semibold text-green-500">Payment Amount: Rs.{updatedPayment.totalPayment}</label>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="paymentType" className="block">Payment Type</label>
                        <select
                            id="paymentType"
                            value={updatedPayment.paymentType}
                            onChange={(e) => setUpdatedPayment({ ...updatedPayment, paymentType: e.target.value })}
                            className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option value="">Select Payment Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                    {updatedPayment.paymentType === "Card" && (
                        <>
                            <div className="mt-4">
                                <label className="block">Card Number</label>
                                <input
                                    type="text"
                                    value={updatedPayment.cardNumber}
                                    onChange={(e) => setUpdatedPayment({ ...updatedPayment, cardNumber: e.target.value })}
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block">Name on card</label>
                                <input
                                    type="text"
                                    onChange={(e) => setUpdatedPayment({ ...updatedPayment, cardHolderName: e.target.value })}
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block">Expiration Date</label>
                                <input
                                    type="date"
                                    onChange={(e) => setUpdatedPayment({ ...updatedPayment, expirationDate: e.target.value })}
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block">CVV</label>
                                <input
                                    type="number"
                                    onChange={(e) => setUpdatedPayment({ ...updatedPayment, cvv: e.target.value })}
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleUpdate}>Pay</Button>
                    <Button onClick={() => setShowUpdateModal(false)} gradientDuoTone="redToOrange">Cancel</Button>
                </Modal.Footer>
            </Modal>


            <Modal
                show={showModal2}
                onClose={() => setShowModal2(false)}
                popup
                size="md"
            >
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
                            Confirm Deletion
                        </h3>
                        <p>Are you sure you want to delete this leave?</p>
                        <div className="flex justify-center gap-4">
                            <Button color="red" onClick={handleDelete}>Confirm</Button>
                            <Button onClick={() => setShowModal2(false)}>Cancel</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal
                show={showModal0}
                onClose={() => setShowModal0(false)}
                size="md"
            >
                <Modal.Header>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Generate Report</h3>
                    </div>
                </Modal.Header>
                <Modal.Body className="flex flex-col items-center">
                    <div className="text-center">
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Select a month to generate the report:</p>
                        <select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Payments</option>
                            {generateMonthOptions()}
                        </select>
                    </div>
                    {/* Download PDF Button */}
                    <Button
                        onClick={handleGenerateReport}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                    >
                        Download Report
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}
