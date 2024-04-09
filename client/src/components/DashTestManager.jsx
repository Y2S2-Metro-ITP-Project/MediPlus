import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, TableHeadCell, Button } from "flowbite-react";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

//import LabTest from "../../../api/models/labtest.model";

export default function DashTestManager() {
  const { currentUser } = useSelector((state) => state.user);
  const [labTests, setLabTests] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testIdToDelete, setTestIdToDelete] = useState(" ");

  const formatSeconds = (s) =>
    new Date(s * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/labTest/getTests`);
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

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 ">
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
            </Table.Head>

            {labTests.map((labtest) => (
              <Table.Body className=" divide-y">
                <Table.Row>
                  <Table.Cell>
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
                    <span className="text-green-500 hover: cursor-pointer ">
                      <FaEdit />
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>There are no tests available</p>
      )}
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
    </div>
  );
}
