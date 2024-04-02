import { Button, Label, Select, TextInput } from "flowbite-react";
import React from "react";
import { useState } from "react";

export default function CollectionCentre() {

  const [formData, setFormData] = useState({});

  const handleData = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async(e)=> {

    e.preventDefault();

    try {
      const res = await fetch("/api/sample/registerSample", {
        method: "POST",
        headers: {"content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      const data = await res.json();
    } catch (error) {
      
    }
  }

  console.log(formData);
  
  return (
    <div className="min-h-screen mt-20">
      <div className=" flex flex-col items-center justify-center">
        <div className=" font-bold dark:text-white  text-4xl p-10 ">
          Sample Collection
        </div>
        <div className=" bg-gray-200 ">
          <form className="flex flex-col items-center justify-center gap-8" onSubmit={handleSubmit}>
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
              <TextInput type="text" placeholder="Lab Test" id="testsOrderedOnSample" onChange={handleData}/>
            </div>


            <div className=" mb-3 block">
              <Label className="" value="Patient ID:" />
              <TextInput type="text" placeholder="Patient ID" id="patientId" onChange={handleData}/>
            </div>

            <div className=" mb-3 block">
              <Label className="" value="Patient Name:" />
              <p id="patient_name">patient name placeholder</p>
            </div>

            

            


            <div className=" mb-3 block">
              <Label className="" value="Collection employee ID:" />
              <TextInput type="text" placeholder="Employee ID" id="collectionEmployeeId" onChange={handleData}/>
            </div>
            </div>
            <Button className=" bg-gray-600 " type="submit" >
              Register Sample
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
