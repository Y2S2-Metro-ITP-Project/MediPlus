import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  Button,
  Label,
  Modal,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import {
  faHeartbeat,
  faThermometerHalf,
  faTint,
} from "@fortawesome/free-solid-svg-icons";
import { set } from "mongoose";
const THRESHOLDS = {
  temperature: { low: 36.1, high: 37.2 },
  bloodPressureSystolic: { low: 90, high: 120 },
  bloodPressureDiastolic: { low: 60, high: 80 },
  heartRate: { low: 60, high: 100 },
  bloodGlucose: { low: 70, high: 140 },
  oxygenSaturation: { low: 95, high: 100 },
};

const COLORS = {
  low: "text-blue-700", // Low value color
  high: "text-red-700", // High value color
  normal: "text-green-700", // Normal value color
};

function getColorClass(value, thresholds) {
  if (value < thresholds.low) {
    return COLORS.low;
  } else if (value > thresholds.high) {
    return COLORS.high;
  } else {
    return COLORS.normal;
  }
}

const BMI_RANGES = {
  underweight: { low: 0, high: 18.5 },
  healthyWeight: { low: 18.5, high: 24.9 },
  overweight: { low: 25.0, high: 29.9 },
  obese: { low: 30.0, high: Infinity }, // Infinity represents any value above 30.0
};

const BMI_COLORS = {
  underweight: "text-blue-700",
  healthyWeight: "text-green-700",
  overweight: "text-yellow-700",
  obese: "text-red-700",
};

function getBMICategory(value) {
  if (value < BMI_RANGES.underweight.high) {
    return "underweight";
  } else if (
    value >= BMI_RANGES.healthyWeight.low &&
    value <= BMI_RANGES.healthyWeight.high
  ) {
    return "healthyWeight";
  } else if (
    value >= BMI_RANGES.overweight.low &&
    value <= BMI_RANGES.overweight.high
  ) {
    return "overweight";
  } else {
    return "obese";
  }
}

export default function PatientVitals() {
  const [vitals, setVitals] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [pageNumber, setPageNumber] = useState(0);
    const [latestVitals, setLatestVitals] = useState(null);
  const VitalsPerPage = 5;
  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await fetch(
          `/api/vital/getPatientUserVitals/${currentUser._id}`
        );
        const data = await response.json();
        if (response.ok) {
          setVitals(data.vitals);
          setLatestVitals(data.latestVitals);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred. Please try again later.");
      }
    };
    fetchVitals();
  }, [currentUser._id]);
  const pageCount = Math.ceil(vitals.length / VitalsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };
  const displayVitals = vitals
    .slice(pageNumber * VitalsPerPage, (pageNumber + 1) * VitalsPerPage)
    .map((vital) => (
      <Table.Body className="divide-y" key={vital._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell
            className={getColorClass(vital.temperature, THRESHOLDS.temperature)}
          >
            {vital.temperature}
          </Table.Cell>
          <Table.Cell
            className={`${getColorClass(
              vital.bloodPressureSystolic,
              THRESHOLDS.bloodPressureSystolic
            )} ${getColorClass(
              vital.bloodPressureDiastolic,
              THRESHOLDS.bloodPressureDiastolic
            )}`}
          >
            {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
          </Table.Cell>
          <Table.Cell
            className={getColorClass(vital.heartRate, THRESHOLDS.heartRate)}
          >
            {vital.heartRate}
          </Table.Cell>
          <Table.Cell
            className={getColorClass(
              vital.bloodGlucose,
              THRESHOLDS.bloodGlucose
            )}
          >
            {vital.bloodGlucose}
          </Table.Cell>
          <Table.Cell
            className={getColorClass(
              vital.oxygenSaturation,
              THRESHOLDS.oxygenSaturation
            )}
          >
            {vital.oxygenSaturation}
          </Table.Cell>
          <Table.Cell>{vital.bodyweight}</Table.Cell>
          <Table.Cell>{vital.height}</Table.Cell>
          <Table.Cell
            className={
              BMI_COLORS[getBMICategory(parseFloat(vital.BMI).toFixed(2))]
            }
          >
            {parseFloat(vital.BMI).toFixed(2)}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">Heart Rate</h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.heartRate
                    ? `${latestVitals.heartRate} BPM`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faHeartbeat}
                className="text-indigo-600 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>

          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Body Temperature
                </h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.temperature
                    ? `${latestVitals.temperature} °C`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faThermometerHalf}
                className="text-green-700 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>

          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Blood Glucose Level
                </h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.bloodGlucose
                    ? `${latestVitals.bloodGlucose} mg/dL`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faTint}
                className="text-red-700 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className=" flex items-center mb-2">
          <Button outline gradientDuoTone="greenToBlue" className=" ml-4">
            Download Vitals Report
          </Button>
          <div className="flex ml-4">
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-full mr-1.5"></span>
              Normal
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-blue-700 rounded-full mr-1.5"></span>
              Low
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-red-700 rounded-full mr-1.5"></span>
              High
            </span>
          </div>
          <div className="flex ml-4">
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-green-700 rounded-full mr-1.5"></span>
              BMI Normal
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-blue-700 rounded-full mr-1.5"></span>
              BMI Under Weight
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-yellow-700 rounded-full mr-1.5"></span>
              BMI Overweight
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="w-2.5 h-2.5 bg-red-700 rounded-full mr-1.5"></span>
              BMI Obese
            </span>
          </div>
        </div>
      </div>

      {vitals.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>body Temperature-°C</Table.HeadCell>
              <Table.HeadCell>blood Pressure-mmHg</Table.HeadCell>
              <Table.HeadCell>Heart Rate-bpm</Table.HeadCell>
              <Table.HeadCell>blood Sugar-mg/dL</Table.HeadCell>
              <Table.HeadCell>Oxygen Saturation-SpO2</Table.HeadCell>
              <Table.HeadCell>weight-Kg</Table.HeadCell>
              <Table.HeadCell>height-CM</Table.HeadCell>
              <Table.HeadCell>BMI</Table.HeadCell>
            </Table.Head>
            {displayVitals}
          </Table>
          <div className="mt-9 center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName={"pagination flex justify-center"}
              previousLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              nextLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              disabledClassName={"opacity-50 cursor-not-allowed"}
              activeClassName={"bg-indigo-500 text-white"}
            />
          </div>
        </>
      ) : (
        <p>Patient Has No recorded Vitals</p>
      )}
    </div>
  );
}
