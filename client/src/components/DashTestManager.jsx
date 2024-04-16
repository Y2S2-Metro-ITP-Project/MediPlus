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
} from "flowbite-react";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { BiShow } from "react-icons/bi";

//import LabTest from "../../../api/models/labtest.model";

export default function DashTestManager() {
  const { currentUser } = useSelector((state) => state.user);
  const [labTests, setLabTests] = useState([]);
  // const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testIdToDelete, setTestIdToDelete] = useState(" ");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [addTestModal, setAddTestModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [testIdToUpdate, setTestIdToUpdate] = useState("");
  const [updateTestModal, setUpdateTestModal] = useState(false);
  const [showTestData, setShowTestData] = useState(false);
  const [testData, setTestData] = useState({
    name: false,
    sampleType: false,
    sampleVolume: false,
    completionTime: false,
    advice: false,
    description: false,
    price: false,
  });
  const [showTestModal, setShowTestModal] = useState(false);

  // format seconds to dd-hh-ss format
  const formatSeconds = (s) =>
    new Date(s * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`/api/labTest/paginateTests?page=${page}`);
      const data = await res.json();

      if (res.ok) {
        setLabTests(data);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    // Fetch all tests
    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/labTest/paginateTests?page=${page}`);
        const data = await res.json();

        if (res.ok) {
          setLabTests(data);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchTests();
    }
  }, [currentUser._id]);

  // PAGINATION
  const handlePrevious = async () => {
    setPage((p) => {
      return p - 1;
    });

    fetchTests();
  };

  const handleNext = async () => {
    setPage((p) => {
      return p + 1;
    });

    fetchTests();
  };

  //Delete test handler
  const handleDeleteTest = async () => {
    setShowModal(false);

    try {
      const res = await fetch(`/api/labTest/deleteTest/${testIdToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        setLabTests((prev) =>
          prev.filter((test) => test._id !== testIdToDelete)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Handle new test submissions

  const handleTestSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name ? formData.name.trim() : "";
    const sampleType = formData.sampleType;
    const sampleVolume = formData.sampleVolume
      ? formData.sampleVolume.trim()
      : "";
    const completionTime = formData.completionTime
      ? formData.completionTime.trim()
      : "";
    const price = formData.price ? formData.price.trim() : "";
    const advice = formData.advice ? formData.advice.trim() : "";
    const description = formData.description ? formData.description.trim() : "";
    if (!name || !sampleType || !sampleVolume || !completionTime || !price) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch(`/api/labTest/createTest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchTests();
        setAddTestModal(false);
        setFormData({});
        toast.success("Test added to database succesfully");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // // VIEW TEST DATA
  // const handleTestDetailsView = (
  //   name,
  //   sampleType,
  //   sampleVolume,
  //   completionTime,
  //   price
  // ) =>
  //   setTestData({
  //     name,
  //     sampleType,
  //     sampleVolume,
  //     completionTime,
  //     price,
  //   });
  // setShowTestData(true);

  // UPDATE TESTS HANDLER

  const handleTestUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/labTest/updateTest/${testIdToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUpdateTestModal(false);
        setFormData({});
        fetchTests();
        toast.success("Test Updated Succesfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSetTestDetails = (
    name,
    sampleType,
    sampleVolume,
    completionTime,
    advice,
    description,
    price
  ) => {
    setTestData({
      name,
      sampleType,
      sampleVolume,
      completionTime,
      advice,
      description,
      price,
    });
  };

  // SEARCH

  const handleSearch = async (e) => {
    console.log("searching");
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 ">
      <div className=" flex justify-between items-center mb-5 ">
        <Button
          className=" "
          gradientDuoTone="purpleToPink"
          outline
          onClick={() => setAddTestModal(true)}
        >
          Add Test
        </Button>

        <form onSubmit={handleSearch}>
          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="hidden lg:inline"
            id="search"
            onChange={handleChange}
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
              <Table.HeadCell>Test Name</Table.HeadCell>
              <Table.HeadCell>Sample Type</Table.HeadCell>
              <Table.HeadCell>Sample Volume</Table.HeadCell>
              <Table.HeadCell>Time to completion</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
              <Table.HeadCell>Show More</Table.HeadCell>
            </Table.Head>

            {labTests.map((labtest) => (
              <Table.Body className=" divide-y text-center ">
                <Table.Row>
                  <Table.Cell className="text-left">
                    <Link className=" font-medium text-gray-900 dark:text-white hover:underline">
                      {labtest.name}
                    </Link>
                  </Table.Cell>

                  <Table.Cell>{labtest.sampleType.toLowerCase()}</Table.Cell>
                  <Table.Cell>{labtest.sampleVolume} ml</Table.Cell>
                  <Table.Cell>
                    {formatSeconds(labtest.completionTime)}
                  </Table.Cell>
                  <Table.Cell>Rs.{labtest.price}</Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setTestIdToDelete(labtest._id);
                      }}
                      className="text-red-500 hover: cursor-pointer "
                    >
                      <FaTrashCan />
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className="text-green-500 hover: cursor-pointer "
                      onClick={() => {
                        setTestIdToUpdate(labtest._id);
                        handleSetTestDetails(
                          labtest.name,
                          labtest.sampleType,
                          labtest.sampleVolume,
                          labtest.completionTime,
                          labtest.advice,
                          labtest.description,
                          labtest.price
                        );
                        setUpdateTestModal(true);
                      }}
                    >
                      <FaEdit />
                    </span>
                  </Table.Cell>
                  <TableCell>
                    {" "}
                    <span
                      className=" text-blue-600 hover:cursor-pointer "
                      onClick={() => {
                        handleSetTestDetails(
                          labtest.name,
                          labtest.sampleType,
                          labtest.sampleVolume,
                          labtest.completionTime,
                          labtest.advice,
                          labtest.description,
                          labtest.price
                        );
                        setShowTestModal(true);
                      }}
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
        <p>There are no tests available</p>
      )}

      {/* PAGINATION */}
      <div className="flex flex-row ">
        <Button
          disabled={page === 1}
          onClick={handlePrevious}
          pill
          className=" text-gray-900 dark:text-white"
          gradientDuoTone="purpleToPink"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          pill
          className=" text-gray-900 dark:text-white"
          gradientDuoTone="purpleToPink"
        >
          Next
        </Button>
      </div>

      {/* DELETE TEST MODAL */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this test?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteTest}>
              Yes, I'm sure
            </Button>
            <Button color="grey" onClick={() => setShowModal(false)}>
              No, Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ADD TEST MODAL */}
      <Modal
        show={addTestModal}
        onClose={() => setAddTestModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Register new test
            </h3>
          </div>
          <form onSubmit={handleTestSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <TextInput
                  type="text"
                  placeholder="test name"
                  id="name"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="sampleType">Sample Type</Label>
                <Select
                  id="sampleType"
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Sample Type</option>
                  <option value="BLOOD">Blood</option>
                  <option value="URINE">Urine</option>
                  <option value="MUCUS">Mucus</option>
                  <option value="SALIVA">Saliva</option>
                  <option value="STOOL">Stool</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="sampleVolume">Sample Volume</Label>
                <TextInput
                  type="text"
                  placeholder="--ml"
                  id="sampleVolume"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="completionTime">Time for completion</Label>
                <TextInput
                  type="text"
                  placeholder="submit time as seconds"
                  id="completionTime"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="advice">Advice</Label>
                </div>
                <Textarea
                  type="text"
                  id="advice"
                  onChange={handleChange}
                  placeholder="Enter advice if necessary or leave blank"
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="description">Test description</Label>
                </div>
                <Textarea
                  type="text"
                  id="description"
                  onChange={handleChange}
                  placeholder="Pathology test description..."
                  rows={7}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <TextInput
                  type="text"
                  placeholder="9999"
                  id="price"
                  onChange={handleChange}
                  className="input-field"
                />
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
                  setAddTestModal(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* UPDATE TEST MODAL */}

      <Modal
        show={updateTestModal}
        onClose={() => setUpdateTestModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              UPDATE
            </h3>
          </div>
          <form onSubmit={handleTestUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <TextInput
                  type="text"
                  placeholder={testData.name}
                  id="name"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="sampleType">Sample Type</Label>
                <Select
                  id="sampleType"
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">{testData.sampleType}</option>
                  <option value="BLOOD">Blood</option>
                  <option value="URINE">Urine</option>
                  <option value="MUCUS">Mucus</option>
                  <option value="SALIVA">Saliva</option>
                  <option value="STOOL">Stool</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="sampleVolume">Sample Volume</Label>
                <TextInput
                  type="text"
                  placeholder={testData.sampleVolume}
                  id="sampleVolume"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="completionTime">Time for completion</Label>
                <TextInput
                  type="text"
                  placeholder={testData.completionTime}
                  id="completionTime"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="advice">Advice</Label>
                </div>
                <Textarea
                  type="text"
                  id="advice"
                  onChange={handleChange}
                  placeholder={testData.advice}
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="description">Test description</Label>
                </div>
                <Textarea
                  type="text"
                  id="description"
                  onChange={handleChange}
                  placeholder={testData.description}
                  rows={7}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <TextInput
                  type="text"
                  placeholder={testData.price}
                  id="price"
                  onChange={handleChange}
                  className="input-field"
                />
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
                  setUpdateTestModal(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* MODAL FOR VIEW MORE INFO BUTTON */}
      <Modal
        show={showTestModal}
        onClose={() => setShowTestModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              {testData.name + " Test"}
            </h3>
          </div>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <TextInput
                  type="text"
                  value={testData.name}
                  id="name"
                  readOnly={true}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="sampleType">Sample Type</Label>
                <Select id="sampleType" readOnly={true} className="input-field">
                  <option value="">{testData.sampleType}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="sampleVolume">Sample Volume</Label>
                <TextInput
                  type="text"
                  value={testData.sampleVolume}
                  id="sampleVolume"
                  readOnly={true}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="completionTime">Time for completion</Label>
                <TextInput
                  type="text"
                  value={testData.completionTime}
                  id="completionTime"
                  readOnly={true}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="advice">Advice</Label>
                </div>
                <Textarea
                  type="text"
                  id="advice"
                  readOnly={true}
                  value={testData.advice}
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="">
                <div className="mb-2 block">
                  <Label htmlFor="description">Test description</Label>
                </div>
                <Textarea
                  type="text"
                  id="description"
                  readOnly={true}
                  value={testData.description}
                  rows={7}
                  className="input-field"
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <TextInput
                  type="text"
                  value={testData.price}
                  id="price"
                  readOnly={true}
                  className="input-field"
                />
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
