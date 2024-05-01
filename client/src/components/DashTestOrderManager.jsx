import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableHeadCell,
  Button,
  TextInput,
  Label,
  TableCell,
  Textarea,
  ModalHeader,
  ModalBody,
  Modal,
  Checkbox,
} from "flowbite-react";
import Select from "react-select";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { BiShow } from "react-icons/bi";

const DashTestOrderManager = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [labOrders, setLabOrders] = useState([]);

  const [formData, setFormData] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients, setPatients] = useState([]);

  const [selectedTests, setSelectedTests] = useState([]);
  const [tests, setTests] = useState([]);
  const [teststoSubmit, setTeststoSubmit] = useState([]);

  const [testOrderIdToDelete, setTestOrderIdToDelete] = useState(" ");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [priority, setPriority] = useState(true);
  const [AddModal, setAddModal] = useState(false);

  useEffect(() => {
    const fetchTestOrders = async () => {
      try {
        const res = await fetch(`/api/labOrder/getTestOrders`);
        const data = await res.json();

        if (res.ok) {
          setLabOrders(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchTestOrders();
    }
  }, [currentUser._id]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patient/getPatients`);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setPatients(data.patients);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin || currentUser.isReceptionist) {
      fetchPatients();
    }
  }, [currentUser._id]);

  const optionsPatient = patients.map((patient) => ({
    value: patient._id,
    label: patient.name,
  }));

  const handlePatientSelectChange = (selectedOptions) => {
    // console.log("handleChange", selectedOptions);
    const { value } = selectedOptions;
    // console.log("value from patient",value);
    setSelectedPatient(value);

    setFormData({
      ...formData,
      patientId: value,
    });
  };

  //=====================================================

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/labTest/getTests`);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setTests(data.labtests);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchTests();
    }
  }, [currentUser._id]);

  const options = tests.map((test) => ({
    value: test._id,
    label: test.name,
  }));

  const handleTestSelectChange = (selectedOptions) => {
    // console.log("handleChange", selectedOptions);
    const tests = selectedOptions.map((test) => test.value);
    //console.log("value from tests:", tests);
    setTeststoSubmit(tests);
    setSelectedTests(selectedOptions);
    setFormData({
      ...formData,
      testId: tests,
    });
  };

  //========================================================

  const handlePriorityChange = (e) => {
    setPriority(e.target.checked);
    setFormData({
      ...formData,
      highPriority: priority,
    });
  };

  //========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/labOrder/orderTest/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success("Test order placed");
      }

      setFormData([]);
    } catch (error) {
      console.log(error);
    }
  };

  //Delete test orders handler
  const handleDeleteTestOrder = async () => {
    setShowDeleteModal(false);

    try {
      const res = await fetch(
        `/api/labOrder/deleteOrder/${testOrderIdToDelete}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        setLabOrders((prev) =>
          prev.filter((order) => order._id !== testOrderIdToDelete)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 ">
      <div className=" flex justify-between items-center mb-5 ">
        <Button
          className=" "
          gradientDuoTone="purpleToPink"
          outline
          onClick={() => setAddModal(true)} 
        >
          Create Test Order
        </Button>

        <form onSubmit={""}>
          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="hidden lg:inline"
            id="search"
            //missing handle change here
            style={{ width: "300px" }}
          />
          <Button className="w-12 h-10 lg:hidden" color="gray">
            <AiOutlineSearch />
          </Button>
        </form>
      </div>

      {currentUser.isAdmin ||
      (currentUser.isLabTech && labOrders.length > 0) ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Patient Name</Table.HeadCell>
              <Table.HeadCell>Test/s Ordered</Table.HeadCell>
              <Table.HeadCell>Prescribed by</Table.HeadCell>
              <Table.HeadCell>Priority</Table.HeadCell>
              <Table.HeadCell>Payment Status</Table.HeadCell>
              <Table.HeadCell>Stage</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Show More</Table.HeadCell>
            </Table.Head>

            {labOrders.map((labOrder) => (
              <Table.Body className=" divide-y text-center ">
                <Table.Row>
                  <Table.Cell className="text-left">
                    <div className=" font-medium text-gray-900 dark:text-white hover:underline">
                      {labOrder.patientId.name}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    {labOrder.testId.map((test) => test.name).join("/")}
                  </Table.Cell>
                  <Table.Cell>{labOrder.DoctorId.username} </Table.Cell>
                  <Table.Cell>
                    {labOrder.highPriority ? "High priortiy" : " Low priority"}
                  </Table.Cell>
                  <Table.Cell>
                    {labOrder.paymentComplete
                      ? "Payment complete"
                      : "Payment Pending"}
                  </Table.Cell>
                  <Table.Cell>{labOrder.orderStages}</Table.Cell>

                  <Table.Cell>
                    <span className="text-green-500 hover: cursor-pointer ">
                      <FaEdit />
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowDeleteModal(true);
                        setTestOrderIdToDelete(labOrder._id);
                      }}
                      className="text-red-500 hover: cursor-pointer "
                    >
                      <FaTrashCan />
                    </span>
                  </Table.Cell>

                  <TableCell>
                    {" "}
                    <span className=" text-blue-600 hover:cursor-pointer ">
                      <BiShow className=" " />
                    </span>
                  </TableCell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>There are no test Orders Currently </p>
      )}

      {/* DELETE TEST ORDER MODAL */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-700 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this Order?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteTestOrder}>
              Yes, I'm sure
            </Button>
            <Button color="grey" onClick={() => setShowDeleteModal(false)}>
              No, Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={AddModal} onClose={() => setAddModal(false)} popup size="lg">
        <ModalHeader />
        <ModalBody>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <Label>Select Lab Tests:</Label>
              <Select
                isMulti
                id="labTests"
                value={selectedTests}
                options={options}
                onChange={handleTestSelectChange}
              />
            </div>

            <div>
              <Label>Select patient:</Label>
              <Select
                id="patient"
                value={selectedPatient}
                onChange={handlePatientSelectChange}
                options={optionsPatient}
                isSearchable={true}
              />
            </div>

            <div>
              <Label> Test order placed by: </Label>
              <TextInput
                id="test order employe name"
                value={currentUser.username}
                readOnly={true}
              />
            </div>

            <div>
              <Label value="High priority?  " />
              <Checkbox
                id="priority"
                checked={priority}
                onChange={handlePriorityChange}
              />
            </div>

            <div>
              <p className="p-1 border-solid border-2 border-sky-700 rounded-lg">
                order total price:
              </p>
            </div>

            <Button gradientDuoTone="purpleToPink" outline type="submit">
              Create Order
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DashTestOrderManager;
