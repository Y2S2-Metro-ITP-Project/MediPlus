import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "flowbite-react";
import { FaEye, FaTimes, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

export default function DashLeave() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [selectedLeaveReason, setSelectedLeaveReason] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [deletingLeaveId, setDeletingLeaveId] = useState(null);

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const response = await fetch(`/api/leaves/getAllLeaves`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaves');
        }
        const data = await response.json();
        setLeaves(data);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    }

    fetchLeaves();
  }, []);

  const handleViewReason = (reason) => {
    setSelectedLeaveReason(reason);
    setShowModal1(true);
  };

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

  // Function to determine user role based on role fields
  const getUserRole = (user) => {
    if (!user) return "Unknown"; // Handle null or undefined user
    
    // Check if patient or user is true
    if (user.isPatient || user.isUser) {
      // Check for other true roles
      if (user.isAdmin) return "Admin";
      // Add more conditions for other roles...
      // if (user.isDoctor) return "Doctor";
      // if (user.isNurse) return "Nurse";
      // if (user.isPharmacist) return "Pharmacist";
      // if (user.isReceptionist) return "Receptionist";
      // if (user.isHeadNurse) return "Head Nurse";
      // if (user.isHRM) return "HRM";
    } else {
      // Check individual roles
      if (user.isDoctor) return "Doctor";
      if (user.isNurse) return "Nurse";
      if (user.isPharmacist) return "Pharmacist";
      if (user.isReceptionist) return "Receptionist";
      if (user.isHeadNurse) return "Head Nurse";
      if (user.isHRM) return "HRM";
      if (user.isAdmin) return "Admin";
    }
    
    // If none of the specific roles, return "Employee" by default
    return "Employee";
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
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
        {leaves.map((leave) => (
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
      {/* Modal for viewing reason */}
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

      {/* Modal for updating leave status */}
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
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal for confirming deletion */}
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
    </div>
  );
}
