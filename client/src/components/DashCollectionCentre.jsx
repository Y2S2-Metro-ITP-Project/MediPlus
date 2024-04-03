import {
  Alert,
  Button,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
//import {useNavigate} from "react-router-dom";

export default function DashCollectionCentre() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  // const navigate = useNavigate();

  const handleData = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.testsOrderedOnSample ||
      !formData.patientId
    ) {
      return setErrorMessage("Please fill out all fields");
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/sample/registerSample", {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
    } catch (error) {
      setLoading(false);
    }
  };

  console.log(formData);

  return (
    <div className=" max-w-lg mx-auto p-3 w-full">
      <h1 className=" my-7 text-center font-semibold text-3xl">
        Sample Collection
      </h1>
      <div className=" bg-gray-100 dark:bg-slate-800 p-10 rounded-lg ">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className=" mb-4 block">
            <Label className="" value="Patient Name:" />
            <p id="patient_name">patient name placeholder</p>
          </div>

          <div className=" mb-4 block">
            <Label className="" value="Sample collection Employee:" />

            {currentUser ? (
              <span className="block text-sm ">
                Employee name: {currentUser.username}
              </span>
            ) : (
              <span className="block text-base text-red-700 ">
                Authorized employee not logged in
              </span>
            )}
          </div>

          <div className="mb-4 block">
            <Label className="mb-2 block" value="Select the sample type:" />
            <Select
              id="type"
              placeholder="--select sample type--"
              required
              onChange={handleData}
            >
              <option value="">--please select an option--</option>
              <option value="BLOOD">Blood</option>
              <option value="URINE">Urine</option>
              <option value="MUCUS">Mucus</option>
              <option value="SALIVA">Saliva</option>
              <option value="STOOL">Stool</option>
            </Select>
          </div>

          <div className=" mb-4 block">
            <Label className="mb-2 block" value="Please enter tests orderd on sample:" />
            <TextInput
              type="text"
              placeholder="Lab Test"
              id="testsOrderedOnSample"
              onChange={handleData}
            />
          </div>

          <div className=" mb-4 block">
            <Label className="mb-2 block" value="Patient ID:" />
            <TextInput
              type="text"
              placeholder="Patient ID"
              id="patientId"
              onChange={handleData}
            />
          </div>

          <Button
            className="mt-4 block"
            gradientDuoTone="purpleToBlue"
            outline
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span className="pl-3">Loading...</span>
              </>
            ) : (
              " Register Sample"
            )}
          </Button>
        </form>
        {errorMessage && (
          <Alert color="failure" className="mt-5">
            {errorMessage}
          </Alert>
        )}
      </div>
    </div>
  );
}
