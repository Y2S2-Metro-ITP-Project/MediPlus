import React, { useEffect, useState } from "react";
import { Table, Button, Modal, TextInput } from "flowbite-react";
import { FaEye, FaTimes, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";


export default function DashEmpsalary() {

  const [showModal0, setShowModal0] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [finalSalaries, setFinalSalaries] = useState([]);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [Salary, setSalary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const [updatedSalary, setUpdatedSalary] = useState(0);
  const [updatedConsultationFee, setUpdatedConsultationFee] = useState(0);
  const [updatedBonus, setUpdatedBonus] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");


  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch leaves
        const SalaeyResponse = await fetch(`/api/salary/getAllSalary`);
        if (!SalaeyResponse.ok) {
          throw new Error('Failed to fetch Salary');
        }
        const SalaryData = await SalaeyResponse.json();
        setSalary(SalaryData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSalaryId) {
      const employeeData = Salary.find(employee => employee._id === selectedSalaryId);
      setSelectedEmployeeData(employeeData);
      setUpdatedSalary(employeeData.salary);
      setUpdatedConsultationFee(employeeData.consultationFee);
      setUpdatedBonus(employeeData.bonus);
    }
  }, [selectedSalaryId, Salary]);

  const handleUpdateFormSubmit = async () => {
    try {
      // Send updated data to the server
      const response = await fetch(`/api/salary/update/${selectedSalaryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salary: updatedSalary,
          consultationFee: updatedConsultationFee,
          
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update salary");
      }

      // Show success message
      toast.success("Salary updated successfully");

      // Close the modal
      setShowModal3(false);
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error("Failed to update salary");
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
      if (user.isAdmin) return "Admin";
      if (user.isCashier) return "Cashier"
      if (user.isLabTech) return "Lab Tech";
    }
    return "Employee";
  };

  const doctors = Salary.filter((employee) => getUserRole(employee.userId) === 'Doctor');

  const medicalEmployees = Salary.filter(
    (employee) =>
      ["Nurse", "Pharmacist", "Head Nurse", "Lab Tech"].includes(getUserRole(employee.userId))
  );
  const generalEmployees = Salary.filter(
    (employee) =>
      ["Cashier", "Receptionist", "HRM", "Admin"].includes(getUserRole(employee.userId))
  );


   // Filtered doctors based on search term
  const searchedAndFilteredDoctors = doctors.filter((doctor) => {
    const username = doctor.userId ? doctor.userId.username.toLowerCase() : "";
    return username.includes(searchTerm.toLowerCase());
  });

  // Filtered medical employees based on search term
  const searchedAndFilteredMedicalEmployees = medicalEmployees.filter((employee) => {
    const username = employee.userId ? employee.userId.username.toLowerCase() : "";
    return username.includes(searchTerm.toLowerCase());
  });

  // Filtered general employees based on search term
  const searchedAndFilteredGeneralEmployees = generalEmployees.filter((employee) => {
    const username = employee.userId ? employee.userId.username.toLowerCase() : "";
    return username.includes(searchTerm.toLowerCase());
  });

  const handleDownloadPdf = async (category) => {
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
  
    let rolesToSend = [];
    switch (category) {
      case "Doctor":
        rolesToSend = ["Doctor"];
        break;
      case "Medical Employees":
        rolesToSend = ["Nurse", "Pharmacist", "Head Nurse", "Lab Tech"];
        break;
      case "General Employees":
        rolesToSend = ["Cashier", "Receptionist", "HRM", "Admin"];
        break;
      default:
        break;
    }
  
    const filteredSalary = Salary.filter(employee => rolesToSend.includes(getUserRole(employee.userId)));
  
    try {
      const fileName = `Employee-Report-${category}.pdf`;
  
      const res = await fetch(
        `/api/salary/DownloadSalaryReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roles: rolesToSend, Salary: filteredSalary }), // Pass roles data and filtered Salary data
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
  
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between">
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
      <h2 className="text-2xl font-bold mb-4">Doctor Salary Details</h2>
      <Table hoverable className="shadow-md text-center" >
        <Table.Head>
          <Table.HeadCell>Employee</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Salary</Table.HeadCell>
          <Table.HeadCell>Consultation Fee</Table.HeadCell>
          <Table.HeadCell>Consultations</Table.HeadCell>
          <Table.HeadCell> Final</Table.HeadCell>
          <Table.HeadCell>Update</Table.HeadCell>

        </Table.Head>
        {searchedAndFilteredDoctors.map((employee) => (
          <Table.Body key={employee._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell >{employee.userId ? employee.userId.username : 'Unknown User'}</Table.Cell>
              <Table.Cell>{getUserRole(employee.userId)}</Table.Cell>
              <Table.Cell>{employee.doctortype}</Table.Cell>
              <Table.Cell>{employee.salary}</Table.Cell>
              <Table.Cell>{employee.consultationFee}</Table.Cell>
              <Table.Cell>{employee.consultationN0}</Table.Cell>
              <Table.Cell>{employee.Final}</Table.Cell>
              <Table.Cell>
                <span
                  onClick={() => {
                    setSelectedEmployee(getUserRole(employee.userId));
                    setSelectedSalaryId(employee._id);
                    setShowModal3(true);
                  }}
                  className="font-medium text-blue-500 hover:underline cursor-pointer"
                >
                  Update
                </span>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>
      <br />
      <h2 className="text-2xl font-bold mb-4">Medical Employees Salary Details</h2>
      <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Employee</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Salary</Table.HeadCell>
          <Table.HeadCell> Final</Table.HeadCell>
          <Table.HeadCell>Update</Table.HeadCell>

        </Table.Head>
        {searchedAndFilteredMedicalEmployees.map((employee) => (
          <Table.Body key={employee._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{employee.userId ? employee.userId.username : 'Unknown User'}</Table.Cell>
              <Table.Cell>{getUserRole(employee.userId)}</Table.Cell>
              <Table.Cell>{employee.salary}</Table.Cell>
              <Table.Cell>{employee.Final}</Table.Cell>
              <Table.Cell>
                <span
                  onClick={() => {
                    setSelectedEmployee(getUserRole(employee.userId)); // Set selected employee here
                    setSelectedSalaryId(employee._id);
                    setShowModal3(true);
                  }}
                  className="font-medium text-blue-500 hover:underline cursor-pointer"
                >
                  Update
                </span>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>
      <br />
      <h2 className="text-2xl font-bold mb-4">General Employees Salary Details</h2>
      <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Employee</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Salary</Table.HeadCell>
          <Table.HeadCell> Final</Table.HeadCell>
          <Table.HeadCell>Update</Table.HeadCell>

        </Table.Head>
        {searchedAndFilteredGeneralEmployees.map((employee) => (
          <Table.Body key={employee._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>{employee.userId ? employee.userId.username : 'Unknown User'}</Table.Cell>
              <Table.Cell>{getUserRole(employee.userId)}</Table.Cell>
              <Table.Cell>{employee.salary}</Table.Cell>
              <Table.Cell>{employee.Final}</Table.Cell>
              <Table.Cell>
                <span
                  onClick={() => {
                    setSelectedEmployee(getUserRole(employee.userId)); // Set selected employee here
                    setSelectedSalaryId(employee._id);
                    setShowModal3(true);
                  }}
                  className="font-medium text-blue-500 hover:underline cursor-pointer"
                >
                  Update
                </span>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
      </Table>
      <Modal
        show={showModal3}
        onClose={() => setShowModal3(false)}
        popup
        size="md"
      >
        <Modal.Header>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Update Salary</h3>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="mt-4">
              <label className="block">Salary</label>
              <TextInput
                type="number"
                value={updatedSalary}
                onChange={(e) => setUpdatedSalary(e.target.value)}
              />
            </div>
            <div className="mt-4">

              {/* Check if selectedEmployee is a doctor before rendering the Consultation Fee input */}
              {selectedEmployee === 'Doctor' && (
                <>
                  <label className="block">Consultation Fee</label>
                  <TextInput
                    label="Consultation Fee"
                    type="number"
                    value={updatedConsultationFee}
                    onChange={(e) => setUpdatedConsultationFee(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdateFormSubmit}>Update</Button>
          <Button onClick={() => setShowModal3(false)} gradientDuoTone="redToOrange">Cancel</Button>
        </Modal.Footer>
      </Modal>



  <Modal show={showModal0} onClose={() => setShowModal0(false)} size="md">
  <Modal.Header>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Generate Report</h3>
    </div>
  </Modal.Header>
  <Modal.Body className="flex flex-col items-center">
    <div className="text-center">
      <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Select a role to generate the report:</p>
      <select
       value={selectedRole}
       onChange={(e) => setSelectedRole(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select Role</option>
        <option value="Doctor">Doctor</option>
        <option value="Medical Employees">Medical Employees</option>
        <option value="General Employees">General Employees</option>
      </select>
    </div>
    {/* Download PDF Button */}
    <Button
      onClick={() => handleDownloadPdf(selectedRole)} 
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
    >
      Download PDF
    </Button>
  </Modal.Body>
</Modal>


    </div>
  );
}
