import {
  Alert,
  Button,
  Label,
  Select,
  Spinner,
  TextInput,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  TableCell,
  TableHeadCell,
} from "flowbite-react";
import React from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { LuTestTube } from "react-icons/lu";
import { BiShow } from "react-icons/bi";
import { toast } from "react-toastify";

export default function DashCollectionCentre() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const [logSampleModal, setLogSampleModal] = useState(false);
  const [labOrders, setLabOrders] = useState([]);
  const [testOrderToLog, setTestOrderToLog] = useState("");
  




 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSampleLog = async (e) => {
    e.preventDefault();

   

    try {
      const res = await fetch(`/api/sample/logSample/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          formData
      ),
      });

      

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success(" Samples added succesfully");
      }

      setFormData({});
      setLogSampleModal(false);
      fetchTestOrders();
    } catch (error) {
      console.log(error);
    }
  };


  const handleSetOrderDetails = (
    orders 
  ) => {
    const sampleTypes =  orders.testId.map((test) => test.sampleType);
    const orderId =orders._id;
    const testIds =orders.testId.map((test) => test._id);
    const patient = orders.patientId._id;
  
    setFormData({
      types: sampleTypes,
      testOrderId: orderId,
      testId: testIds,
      patientId: patient,
    });
  };

  const fetchTestOrders = async () => {
    try {
      const res = await fetch(`/api/labOrder/getOrdersForCollection`);
      const data = await res.json();

      if (res.ok) {
        setLabOrders(data);
      }
    } catch (error) {
      console.log(error.message);
    }

  };

  
  useEffect(() => {
    const fetchTestOrders = async () => {
      try {
        const res = await fetch(`/api/labOrder/getOrdersForCollection`);
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

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      <h1 className=" my-7 text-center font-semibold text-3xl">
        Sample Collection
      </h1>

      {currentUser.isAdmin ||
      (currentUser.isLabTech && labOrders.length > 0) ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <TableHeadCell>Patient</TableHeadCell>
              <TableHeadCell>Test types</TableHeadCell>
              <TableHeadCell>Doctor </TableHeadCell>
              <TableHeadCell>Sample Type/s</TableHeadCell>
              <TableHeadCell>Priority</TableHeadCell>
              <TableHeadCell>Log Sample</TableHeadCell>
              <TableHeadCell>More Information</TableHeadCell>
            </Table.Head>

            {labOrders.map((orders) => (
              <Table.Body className=" divide-y text-center ">
                <Table.Row>
                  <TableCell className="text-left">
                    <div className=" font-medium text-gray-900 dark:text-white hover:underline">
                      {orders.patientId.name}
                    </div>
                  </TableCell>

                  <TableCell>
                    {orders.testId.map((test) => test.name).join("/")}
                  </TableCell>
                  <TableCell>{orders.DoctorId.username} </TableCell>
                  <TableCell>
                    {orders.testId.map((test) => test.sampleType).join("/")}
                  </TableCell>
                  <TableCell>
                    {orders.highPriority ? "high priority" : "low priority"}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setTestOrderToLog(orders._id);
                        handleSetOrderDetails(orders)
                        setLogSampleModal(true);
                      }}
                    >
                      Log Sample
                    </Button>
                  </TableCell>
                  <TableCell>
                    <BiShow
                      size={25}
                      className="  text-blue-600 hover:cursor-pointer  "
                    />
                  </TableCell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>There are no sample collection requests currently</p>
      )}

      {errorMessage && (
        <Alert color="failure" className="mt-5">
          {errorMessage}
        </Alert>
      )}

      {/* ADD SAMPLE MODAL */}

      <Modal
        show={logSampleModal}
        onClose={() => setLogSampleModal(false)}
        popup
        size="xlg"
      >
        <ModalHeader />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Verify the following
            </h3>
          </div>
          <form onSubmit={handleSampleLog}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="types">Sample Type/s</Label>
                <TextInput
                  type="text"
                  value={formData.types}
                  id="types"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>


              <div>
                <Label htmlFor="testOrderId">Test Order ID:</Label>
                <TextInput
                  type="text"
                  value={formData.testOrderId}
                  id="testOrderId"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="testId">Test ID/s</Label>
                <TextInput
                  type="text"
                  value={formData.testId}
                  id="testId"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="patientId">patient ID/s</Label>
                <TextInput
                  type="text"
                  value={formData.patientId}
                  id="patientId"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex  justify-center mt-3">
              <Label value="Have the necessary samples been collected?  "></Label>

              <Button className="mr-4" color="blue" type="submit" outline>
                Yes,Submit
              </Button>
              <Button
                className="ml-4"
                color="red"
                onClick={() => {
                  setLogSampleModal(false);
                  setFormData({});
                }}
              >
                No,Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
