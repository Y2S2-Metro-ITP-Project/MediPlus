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
  Checkbox,
  FileInput,
} from "flowbite-react";
import { FaTrashCan } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { BiShow } from "react-icons/bi";

const DashSampleManager = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [samples, setSamples] = useState([]);
  const [showUploadModal, SetShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [fileName, setFileName] = useState("");


  
 

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch(`/api/sample/getSamples`);
        const data = await res.json();

        if (res.ok) {
          setSamples(data);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchSamples();
    }
  }, [currentUser._id]);

  //===============================================================================================

    const handleSetSampleDetails = (sample) => {
      const patientId = sample.patientId._id;
      const testOrderId = sample.testOrderId._id;
      const sampleId = sample._id;

      setFormData({
        patientId: patientId,
        testOrderId: testOrderId,
        sampleId: sampleId,
      
      });
    };

   

    const onChangeFile = (e) => {
       setFileName(e.target.files[0]);
      setFormData({...formData, resultPDF: fileName});
    }

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };



    const handleSubmit = async(e) => {
      
      e.preventDefault();

      try {

        const {patientId, sampleId, testOrderId, resultPDF} = formData;

        const formDataToSend = new FormData();
        formDataToSend.append('patientId', patientId);
        formDataToSend.append('sampleId', sampleId);
        formDataToSend.append('testOrderId', testOrderId);
        formDataToSend.append('resultPDF', resultPDF);

        console.log(resultPDF);

        const res = await fetch(`api/result/upload`,{
          method: "POST",
          body: formDataToSend,
        });

        if(res.ok){
          console.log("upload success");
        }else{
          console.log("upload failed", res.status);
        }
        
      } catch (error) {
        console.log(error)
      }

    }
  
  //===============================================================================================

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
                  <Table.Cell>
                    {sample.testId.map((test) => test.name).join("/")}
                  </Table.Cell>
                  <Table.Cell>{sample.testOrderId.DoctorId}</Table.Cell>
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
                    <Button
                      onClick={() => {
                       
                        handleSetSampleDetails(sample)
                        SetShowUploadModal(true);
                      }}
                    >
                      Upload Results
                    </Button>
                  </TableCell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>There are no tests available</p>
      )}

      {/* UPLOAD TEST RESULTS MODAL */}
      <Modal
        show={showUploadModal}
        onClose={() => SetShowUploadModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-xl text-gray-600 dark:text-gray-400">
              Upload Test Results
            </h3>
          </div>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* <div>
                <Label htmlFor="title">File Title</Label>
                <TextInput
                  type="text"
                  placeholder="ex: Test results of John Doe..."
                  id="title"
                  onChange={""}
                  className="input-field"
                />
              </div> */}


              <TextInput 
             
              type="hidden"
              value={formData.patientId}
              id="patientId"
              onChange={handleChange}
              
              />

              <TextInput
              type="hidden"
              value={formData.testOrderId}
              id = "testOrderId"
              onChange={handleChange}
              />

              <TextInput
              type="hidden"
              value={formData.sampleId}
              id="sampleId"
              onChange={handleChange}/>

              {/* <div>
                <Label htmlFor="secret">High Sensitivity?</Label>
                <Checkbox className=" ml-4"></Checkbox>
              </div> */}

              {/* optional ^^^ */}

              <div>
                <Label htmlFor="resultPDF"> Upload files here:</Label>
                <input 
                type="file"
                name="resultPDF"
                onChange={onChangeFile}
                accept=".pdf"/>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Button className="mr-4" color="blue" type="submit" outline>
                Submit
              </Button>
              <Button
                className="ml-4"
                color="red"
                onClick={() => {
                  SetShowUploadModal(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashSampleManager;
