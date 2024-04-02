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
  const {currentUser} = useSelector(state => state.user);
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
    <div className="min-h-screen mt-20">
      <div className=" flex flex-col items-center justify-center">
        <div className=" font-bold dark:text-white  text-4xl p-10 ">
          Sample Collection
        </div>
        <div className=" bg-gray-200 dark:bg-slate-800 ">
          <form
            className="flex flex-col items-center justify-center gap-8"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-row gap-6">
              <div className="mb-3 block">
                <Label className="" value="Select the sample type:" />
                <Select id="type" required onChange={handleData}>
                  <option>Blood</option>
                  <option>Urine</option>
                  <option>Mucus</option>
                  <option>Saliva</option>
                  <option>Stool</option>
                </Select>
              </div>

              <div className=" mb-3 block">
                <Label
                  className=""
                  value="Please enter tests orderd on sample:"
                />
                <TextInput
                  type="text"
                  placeholder="Lab Test"
                  id="testsOrderedOnSample"
                  onChange={handleData}
                />
              </div>

              <div className=" mb-3 block">
                <Label className="" value="Patient ID:" />
                <TextInput
                  type="text"
                  placeholder="Patient ID"
                  id="patientId"
                  onChange={handleData}
                />
              </div>

              <div className=" mb-3 block">
                <Label className="" value="Patient Name:" />
                <p id="patient_name">patient name placeholder</p>
              </div>

              <div className=" mb-3 block">
                <Label className="" value="Sample collection Employee:" />

                {currentUser? (
                <span className="block text-sm ">
                    Employee name: @{currentUser.username}
                </span>) : ( <span className="block text-base text-red-700 ">
                  Authorized employee not logged in
                </span>)
                }
                {/* <TextInput
                  type="text"
                  placeholder="Employee ID"
                  id="collectionEmployeeId"
                  onChange={handleData}
                /> */}
              </div>
            </div>
            <Button className=" bg-gray-600 " type="submit" disabled={loading}>
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
    </div>
  );
}
