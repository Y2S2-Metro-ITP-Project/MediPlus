import React from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import {ToastContainer , toast} from "react-toastify";

import Select from "react-select";

import { useSelector } from "react-redux";

const DashLabTestOrder = () => {
  const [formData, setFormData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  const [priority, setPriority] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients, setPatients] = useState([]);

  const [selectedTests, setSelectedTests] = useState([]);
  const [teststoSubmit, setTeststoSubmit] = useState([]);
  const [tests, setTests] = useState([]);

 

  //FETCHING DATA FOR PATIENT SELECTION

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patient/getPatients`);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setPatients(data.patients);
          if (data.patients.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin || currentUser.isReceptionist) {
      fetchPatients();
    }
  }, [currentUser._id]);

  // FETCHING DATA FOR TEST SLECTION

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`/api/labTest/getTests`);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setTests(data.labtests);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    if (currentUser.isAdmin || currentUser.isLabTech) {
      fetchTests();
    }
  }, [currentUser._id]);

//   useEffect(()=>{
//     console.log(teststoSubmit)
//  }, [teststoSubmit]);
//FOR TESTING PURPOUSES
  
  const handleTestSelectChange = (selectedOptions) => {
   // console.log("handleChange", selectedOptions);
    const tests = selectedOptions.map(test => test.value);
    //console.log("value from tests:", tests);
    setTeststoSubmit(tests);
    setSelectedTests(selectedOptions);
    setFormData({
      ...formData,
      testId: tests,
    });
  };

  const handlePatientSelectChange = (selectedOptions) => {
   // console.log("handleChange", selectedOptions);
    const{value} = selectedOptions;
   // console.log("value from patient",value);
    setSelectedPatient(value);
   
    setFormData({
      ...formData,
      patientId: value,
    });
  };


  const handlePriorityChange = (e) => {
    setPriority(e.target.checked);
    setFormData({
      ...formData,
      highPriority: priority,
    });
  };



  const options = tests.map((test) => ({
    value: test._id,
    label: test.name,
  }));

  const optionsPatient = patients.map((patient) => ({
    value: patient._id,
    label: patient.name,
  }));


   const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/labOrder/orderTest/${currentUser._id}`,{

        method: "POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({
          formData,
        }),
      });
  
      const data = await res.json();
  
      if(!res.ok){
        toast.error(data.message);
      }else{
        toast.success("Test order placed");
      }
      
      setFormData([]);
      
    } catch (error) {
      console.log(error);
    }
   }




  return (
    <div className=" p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="my-7 text-center font-semibold text-3xl">
        Lab Test Order
      </h1>

      <div>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <Label>Select Lab Tests:</Label>
            <Select
              isMulti
              id="labTests"
              value={selectedTests}
              options={options}
              onChange={handleTestSelectChange}
             
            />
          </div>

          <div>
            <Label>Select patient:</Label>
            <Select
              id="patient"
              value={selectedPatient}
              options={optionsPatient}
              onChange={handlePatientSelectChange}
             
            />
          </div>

          <div>
            <Label> Test prescribed by: </Label>
            <TextInput
              id="test order employe name"
              value={currentUser.username}
            />
          </div>

          <div>
            <Label value="High priority?  " />
            <Checkbox id="priority" checked={priority} onChange={handlePriorityChange} />
          </div>

          <div>
            <p className=" p-1 mb-4 border-solid border-2 border-sky-700 rounded-lg ">order completion time:</p>
            <p className="p-1 border-solid border-2 border-sky-700 rounded-lg">order total price:</p>
          </div>

          <Button gradientDuoTone="purpleToPink" outline type="submit">
            Create Order
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DashLabTestOrder;
