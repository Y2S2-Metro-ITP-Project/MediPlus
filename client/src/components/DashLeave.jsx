import React, { useEffect, useState } from "react";
import { Table, Button, Modal, TextInput } from "flowbite-react";
import { FaEye, FaTimes, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";


export default function DashLeave() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal0, setShowModal0] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [selectedLeaveReason, setSelectedLeaveReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [deletingLeaveId, setDeletingLeaveId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');




  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all leaves (including the ones that were not deleted)
        const response = await fetch(`/api/leaves/getAllLeaves`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaves');
        }
        const leavesData = await response.json();
  
        // Check for leaves whose end date is more than 3 months ago
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        const oldLeaves = leavesData.filter(leave => new Date(leave.endDate) < threeMonthsAgo);
       
  
        // Delete old leave records
        await Promise.all(oldLeaves.map(leave => deleteLeave(leave._id)));
  
        // Refetch all leaves after deleting old records
        const updatedResponse = await fetch(`/api/leaves/getAllLeaves`);
        if (!updatedResponse.ok) {
          throw new Error('Failed to fetch leaves');
        }
        const updatedLeavesData = await updatedResponse.json();
        setLeaves(updatedLeavesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  }, []);
  
  

  const handleViewReason = (reason) => {
    setSelectedLeaveReason(reason);
    setShowModal1(true);
  };

  async function deleteLeave(leaveId) {
    try {
      const response = await fetch(`/api/leaves/delete/${leaveId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete leave");
      }
      
      console.log(`Leave with ID ${leaveId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting leave:", error);
      // Handle error
    }
  }


  const handleUpdateLeaveStatus = async (status) => {
    try {
      const response = await fetch(`/api/leaves/${selectedLeaveId}/approve-reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update leave status");
      }

      const data = await response.json();
      toast.success(data.message);

      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave._id === selectedLeaveId ? { ...leave, status } : leave
        )
      );
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error("Failed to update leave status");
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    setDeletingLeaveId(leaveId);
    setShowModal2(true);
  };

  const confirmDeleteLeave = async () => {
    try {
      const response = await fetch(`/api/leaves/${deletingLeaveId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLeaves((prevLeaves) =>
          prevLeaves.filter((leave) => leave._id !== deletingLeaveId)
        );
        setShowModal2(false);
        toast.success("Leave deleted successfully!");
      } else {
        toast.error("Failed to delete leave");
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("Error deleting leave");
    }
  };

  const getUserRole = (user) => {
    if (!user) return "Unknown";

    if (user.isPatient || user.isUser) {
      if (user.isAdmin) return "Admin";
    } else {
      if (user.isDoctor) return "Doctor";
      if (user.isNurse) return "Nurse";
      if (user.isPharmacist) return "Pharmacist";
      if (user.isReceptionist) return "Receptionist";
      if (user.isHeadNurse) return "Head Nurse";
      if (user.isHRM) return "HRM";
      if (user.isAdmin) return "Admin"
      if (user.isCashier) return "Cashier"
      if (user.isLabTech) return "Lab Tech";
    }
    return "Employee";
  };


  const handleDownloadPdf = async () => {
    try {
      const monthName = generateMonthName(selectedMonth);
      const fileName = `Employee-Leave-${monthName}.pdf`;

      const res = await fetch(
        `/api/leaves/PDFEmployeeLeave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedMonth, leaves }), // Pass leaves data and selected month
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
      console.log(error);
    }
  };

  const generateMonthName = (monthIndex) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[parseInt(monthIndex)];
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  const generateMonthOptions = () => {
    const currentDate = new Date();
     const currentMonth = currentDate.getMonth();
   // console.log(currentMonth)
  
    // Generate options for the current month and the two previous months
    const monthOptions = [];
    for (let i = 0; i < 3; i++) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping for previous years
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentDate.getFullYear(), monthIndex, 1));
      monthOptions.push({ value: monthIndex.toString(), label: monthName });
    }
  
    // Render the options
    return monthOptions.map(month => (
      <option key={month.value} value={month.value}>
        {month.label}
      </option>
    ));
  };
  
  

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === "") {
      return true;
    } else {
      return leave.status === filterStatus;
    }
  });

  const searchedAndFilteredLeaves = filteredLeaves.filter(leave => {
    const nameMatch = leave.user && leave.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between">
        <div className="mr-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <TextInput
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name"
            rightIcon={AiOutlineSearch}
            className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
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
      <br />
      <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Employee</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Start Date</Table.HeadCell>
          <Table.HeadCell>End Date</Table.HeadCell>
          <Table.HeadCell>Reason</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Update</Table.HeadCell>
          <Table.HeadCell>Delete</Table.HeadCell>
        </Table.Head>
        {searchedAndFilteredLeaves.map((leave) => (
          <Table.Body key={leave._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{leave.user ? leave.user.username : 'Unknown User'}</Table.Cell>
              <Table.Cell>{getUserRole(leave.user)}</Table.Cell>
              <Table.Cell>{new Date(leave.startDate).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{new Date(leave.endDate).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                <FaEye
                  className="text-blue-500 cursor-pointer"
                  onClick={() => handleViewReason(leave.reason)}
                />
              </Table.Cell>
              <Table.Cell>
                {leave.status === "approved" ? (
                  <FaCheck className="text-green-500" />
                ) : leave.status === "rejected" ? (
                  <FaTimes className="text-red-500" />
                ) : (
                  "Pending"
                )}
              </Table.Cell>
              <Table.Cell>
                <span
                  onClick={() => {
                    setSelectedLeaveId(leave._id);
                    setShowModal3(true);
                  }}
                  className="font-medium text-blue-500 hover:underline cursor-pointer"
                >
                  Update
                </span>
              </Table.Cell>
              <Table.Cell>
                <span
                  onClick={() => handleDeleteLeave(leave._id)}
                  className="font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Delete
                </span>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>
      <Modal
        show={showModal1}
        onClose={() => setShowModal1(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Reason for Leave
            </h3>
            <p>{selectedLeaveReason}</p>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showModal3}
        onClose={() => setShowModal3(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Update Leave Status
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="green"
                onClick={() => {
                  setLeaveStatus("approved");
                  handleUpdateLeaveStatus("approved");
                }}
              >
                Approve
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setLeaveStatus("rejected");
                  handleUpdateLeaveStatus("rejected");
                }}
              >
                Reject
              </Button>
              <Button
                color="yellow"
                onClick={() => {
                  setLeaveStatus("pending");
                  handleUpdateLeaveStatus("pending");
                }}
              >
                Pending
              </Button>
            </div>
          </div>
        </Modal.Body>
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
              <Button color="red" onClick={confirmDeleteLeave}>Confirm</Button>
              <Button onClick={() => setShowModal2(false)}>Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showModal0} onClose={() => setShowModal0(false)} size="md">
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
              <option value="">All leave </option>
              {generateMonthOptions()}
            </select>
          </div>
          <Button
            onClick={handleDownloadPdf}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Download PDF
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
