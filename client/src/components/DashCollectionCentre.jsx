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

export default function DashCollectionCentre() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const [logSampleModal, setLogSampleModal] = useState(false);
  const [labOrders, setLabOrders] = useState([]);

  const handleSampleLog = () => {
    console.log("logging sample");
  };


  useEffect( () => {

    const fetchTestOrders = async () => {
      try {
      
        const res = await fetch (`/api/labOrder/getOrdersForCollection`);
        const data = await res.json();
  
        if(res.ok){
          setLabOrders(data);
        }
  
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchTestOrders();
    };
  }, [currentUser._id]);

  

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3">
      <h1 className=" my-7 text-center font-semibold text-3xl">
        Sample Collection
      </h1>

      {currentUser.isAdmin || (currentUser.isLabTech && labOrders.length > 0) ? (
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
                  
                  <TableCell>{orders.testId.map((test) => test.name).join("/")}</TableCell>
                  <TableCell>{orders.DoctorId.username} </TableCell>
                  <TableCell>
                    {orders.testId.map((test)=> test.sampleType).join("/")}
                  </TableCell>
                  <TableCell>{orders.highPriority? "high priority" : "low priority"}</TableCell>
                  <TableCell><Button onClick={""}>Log Sample</Button></TableCell>
                  <TableCell >
                      <BiShow  size={25} className="  text-blue-600 hover:cursor-pointer  "/>
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
        size="lg"
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <LuTestTube className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Log these samples?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleSampleLog}>
              Yes, log sample/s
            </Button>
            <Button color="grey" onClick={() => setLogSampleModal(false)}>
              No, Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
