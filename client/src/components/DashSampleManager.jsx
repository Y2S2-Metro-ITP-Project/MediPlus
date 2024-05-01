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
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { FaTrashCan } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { BiShow } from "react-icons/bi";

const DashSampleManager = () => {

  const {currentUser} = useSelector((state)=> state.user)
  const [samples, setSamples] = useState([]);


  useEffect(()=> {

    const fetchSamples = async () => {

      try{

        const res = await fetch (`/api/sample/getSamples`)
        const data = await res.json();

        if(res.ok){
          setSamples(data);
        }

      }catch(error){
          console.error(error.message);
      }
    };
    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchSamples();
    }
    
  },[currentUser._id])



  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 ">
    <div className=" flex justify-between items-center mb-5 ">
      

      <form onSubmit={""}>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
          id="search"
          onChange={""}
          style={{ width: "300px" }}
        />
        <Button className="w-12 h-10 lg:hidden" color="gray">
          <AiOutlineSearch />
        </Button>
      </form>
    </div>

    {currentUser.isAdmin || (currentUser.isLabTech && labTests.length > 0) ? (
      <>
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Test Order ID</Table.HeadCell>
            <Table.HeadCell>Patient Name</Table.HeadCell>
            <Table.HeadCell>Sample Type</Table.HeadCell>
            <Table.HeadCell>Test Name/s</Table.HeadCell>
            <Table.HeadCell>Referenced by</Table.HeadCell>
            <Table.HeadCell>Sample Collected at</Table.HeadCell>
            <Table.HeadCell>Sample Status</Table.HeadCell>
            <Table.HeadCell>Delete</Table.HeadCell>
            <Table.HeadCell>Show More</Table.HeadCell>
            <Table.HeadCell> Upload Results</Table.HeadCell>
          </Table.Head>

          {samples.map((sample) => (
            <Table.Body className=" divide-y text-center ">
              <Table.Row>
                <Table.Cell className="text-left">
                  {sample.testOrderId._id}
                </Table.Cell>
                <Table.Cell>{sample.patientId.name}</Table.Cell>
                <Table.Cell>{sample.sampleType.toLowerCase()}</Table.Cell>
                <Table.Cell>{sample.testId.map((test) => test.name).join("/")}</Table.Cell>
                <Table.Cell>
                  {sample.testOrderId.DoctorId}
                </Table.Cell>
                <Table.Cell>{sample.createdAt}</Table.Cell>
                <Table.Cell>{sample.sampleStatus}</Table.Cell>
                <Table.Cell>
                  <span
                    // onClick={() => {
                    //   setShowModal(true);
                    //   setTestIdToDelete(labtest._id);
                    // }}
                    className="text-red-500 hover: cursor-pointer "
                  >
                    <FaTrashCan />
                  </span>
                </Table.Cell>
                
                <TableCell>
                  <span>
                    <BiShow className=" " />
                  </span>
                </TableCell>
                <TableCell>
                  <span className=" hover: cursor-pointer">
                    Uplaod Test Results
                  </span>
                </TableCell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      </>
    ) : (
      <p>There are no tests available</p>
    )}

   
    </div>
  )
};

export default DashSampleManager;
