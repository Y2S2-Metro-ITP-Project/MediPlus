import React, { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'flowbite-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashWards = () => {
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    // Fetch beds and doctors from the server
    const fetchData = async () => {
      try {
        // Get the authentication token from local storage or wherever it's stored
        const token = localStorage.getItem('token');
        const bedsResponse = await fetch('/api/bed/getbed');
        const doctorsResponse = await fetch('/api/user/getdoctors', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const bedsData = await bedsResponse.json();
        const doctorsData = await doctorsResponse.json();
        setBeds(bedsData.beds);
        setDoctors(doctorsData.doctors);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching beds and doctors');
      }
    };
    fetchData();
  }, []);

  const handleAssignDoctor = async () => {
    try {
      const response = await fetch('/api/bed/assignDoctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bedNumber: selectedBed.number,
          doctorId: selectedDoctor._id,
        }),
      });
      if (response.ok) {
        console.log('Doctor assigned successfully');
        toast.success('Doctor assigned successfully');
        setIsAssignModalOpen(false);
        // Optionally, you can fetch the updated bed data and update the state
      } else {
        console.error('Error assigning doctor');
        toast.error('Error assigning doctor');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error assigning doctor');
    }
  };

  const handleRemoveDoctor = async (bed) => {
    try {
      const response = await fetch(`/api/bed/${bed.number}/removeDoctor`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Doctor removed successfully');
        toast.success('Doctor removed successfully');
        // Optionally, you can fetch the updated bed data and update the state
      } else {
        console.error('Error removing doctor');
        toast.error('Error removing doctor');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error removing doctor');
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Ward Management</h1>
      <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Bed Number</Table.HeadCell>
          <Table.HeadCell>Ward</Table.HeadCell>
          <Table.HeadCell>Assigned Doctor</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        {beds.map((bed) => (
          <Table.Body className="divide-y" key={bed._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>Bed {bed.number}</Table.Cell>
              <Table.Cell> {bed.ward} Ward</Table.Cell>
              <Table.Cell>
                {bed.assignedDoctor ? (
                  <span>{bed.assignedDoctor.username}</span>
                ) : (
                  <span className="text-gray-500">not Assigned</span>
                )}
              </Table.Cell>
              <Table.Cell>
                {bed.assignedDoctor ? (
                  <span
                    className="font-medium text-red-500 hover:underline cursor-pointer ml-2"
                    onClick={() => handleRemoveDoctor(bed)}
                  >
                    Remove Doctor
                  </span>
                ) : (
                  <span
                    className="font-medium text-blue-500 hover:underline cursor-pointer ml-2"
                    onClick={() => {
                      setSelectedBed(bed);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    Assign Doctor
                  </span>
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>

      {isAssignModalOpen && (
        <Modal
          show={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedBed(null);
            setSelectedDoctor(null);
          }}
          popup
          size="md"
        >
          <Modal.Header>Assign Doctor to Bed {selectedBed?.number}</Modal.Header>
          <Modal.Body>
            <div>
              <label htmlFor="doctor" className="mb-2 block">
                Select Doctor
              </label>
              <select
                id="doctor"
                value={selectedDoctor?._id || ''}
                onChange={(e) =>
                  setSelectedDoctor(
                    doctors.find((d) => d._id === e.target.value) || null
                  )
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.username}
                  </option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="gray"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedBed(null);
                setSelectedDoctor(null);
              }}
            >
              Cancel
            </Button>
            <Button color="blue" onClick={handleAssignDoctor}>
              Assign
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DashWards;