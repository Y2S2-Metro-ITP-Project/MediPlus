import React, { useState, useEffect } from "react";
import { Button, Modal, TextInput, Table } from "flowbite-react";
import { FaEye, FaTimes, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

export default function DashEMPLeave() {
  // State for leave application modal
  const { currentUser } = useSelector((state) => state.user);
  const [showModal1, setShowModal1] = useState(false);
  const [selectedLeaveReason, setSelectedLeaveReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false); // Define loading state
  const [userLeaves, setUserLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`/api/leaves/getAllLeaves`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaves");
      }
      const data = await response.json();
      // Filter leaves by the current user's ID
      const currentUserLeaves = data.filter(
        (leave) => leave.user && leave.user._id === currentUser._id
      );
      setUserLeaves(currentUserLeaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };
 
  // useEffect hook to fetch leaves on component mount or when currentUser changes
  useEffect(() => {
    fetchLeaves();
  }, [currentUser._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const createLeaveApplication = async (userId, formData) => {
    try {
      const response = await fetch(`/api/leaves/user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Leave application submitted successfully!");
        setShowModal(false);
        toast.success("Leave application submitted successfully!");
        // Refetch leaves after submission to update the table
        fetchLeaves();
      } else {
        const errorMessage = await response.text();
        console.error("Failed to submit leave application:", errorMessage);
        toast.error("Failed to submit leave application");
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast.error("Error submitting leave application");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCreateLeave = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state while submitting

    const formData = {
      reason: event.target.reason.value,
      startDate: event.target.startDate.value,
      endDate: event.target.endDate.value,
    };

    createLeaveApplication(currentUser._id, formData);
  };

  const handleViewReason = (reason) => {
    setSelectedLeaveReason(reason);
    setShowModal1(true);
  };

  const confirmDeleteLeave = async () => {
    // Handle confirm delete leave logic here
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      <ToastContainer />
      {/* Button to open the leave application modal */}
      <div className="mb-4">
        <Button
          gradientDuoTone="purpleToPink"
          onClick={() => setShowModal(true)}
          className="text-left inline-block"
        >
          Apply Leave
        </Button>
      </div>


      {/* Leave Application Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb- text-lg text-gray-500">
              Leave Application Form
            </h3>
            <form onSubmit={handleCreateLeave}>
              {/* Leave application form fields */}
              <div className="mb-4">
                <label htmlFor="reason" className="block">
                  Reason for leave
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  style={{ width: "350px" }}
                  placeholder="Reason for leave"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startDate" className="block">
                  Start Date
                </label>
                <TextInput
                  id="startDate"
                  name="startDate"
                  type="date"
                  placeholder="Start Date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="endDate" className="block">
                  End Date
                </label>
                <TextInput
                  id="endDate"
                  name="endDate"
                  type="date"
                  placeholder="End Date"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button type="submit" color="primary">
                  Submit
                </Button>
                <Button onClick={() => setShowModal(false)} color="danger">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      {/* Table for displaying leaves */}
      <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Employee</Table.HeadCell>
          <Table.HeadCell>Start Date</Table.HeadCell>
          <Table.HeadCell>End Date</Table.HeadCell>
          <Table.HeadCell>Reason</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
        </Table.Head>
        {userLeaves.map((leave) => (
          <Table.Body className="divide-y" key={leave._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{leave.user ? leave.user.username : "Unknown User"}</Table.Cell>
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
    </div>
  );
}
