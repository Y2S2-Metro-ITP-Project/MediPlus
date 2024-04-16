import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableHeadCell,
  Button,
  TextInput,
  Label,
  Select,
  TableCell,
  Textarea,
  ModalHeader,
  ModalBody,
  Modal,
} from "flowbite-react";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { BiShow } from "react-icons/bi";

const DashTestOrderManager = () => {

  const { currentUser } = useSelector((state) => state.user);
  const  [labOrders, setLabOrders] = useState([]);
  const [testOrderIdToDelete, setTestOrderIdToDelete] = useState(" ");
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  

  
  useEffect(()=> {
    const fetchTestOrders = async () => {
      try {
        
        const res = await fetch(`/api/labOrder/getTestOrders`);
        const data = await res.json();
  
  
        if(res.ok){
          setLabOrders(data);
        }
  
      } catch (error) {
        console.log(error.message);
      }
    };

    if(currentUser.isAdmin || currentUser.isLabTech){
      fetchTestOrders();
    }
  }, [currentUser._id]);


  //Delete test orders handler
  const handleDeleteTestOrder = async () => {
    setShowDeleteModal(false);

    try {
      const res = await fetch(`/api/labOrder/deleteOrder/${testOrderIdToDelete}`, {
        method: "DELETE",
      });

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
          onClick={() => setAddTestOrderModal(true)} // button not implemented yet
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

      {currentUser.isAdmin || (currentUser.isLabTech && labOrders.length > 0) ? (
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

                  <Table.Cell>{labOrder.testId.map((test) => test.name).join("/")}</Table.Cell>
                  <Table.Cell>{labOrder.DoctorId.username} </Table.Cell>
                  <Table.Cell>
                    {labOrder.highPriority? "High priortiy" : " Low priority"}
                  </Table.Cell>
                  <Table.Cell>{labOrder.paymentComplete? "Payment complete" : "Payment Pending"}</Table.Cell>
                  <Table.Cell>{labOrder.orderStages}</Table.Cell>
                 
                  <Table.Cell>
                    <span
                      className="text-green-500 hover: cursor-pointer "
                    >
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
                    <span
                      className=" text-blue-600 hover:cursor-pointer "
                    >
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

    </div>
  )
}

export default DashTestOrderManager
