import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
  Toast,
} from "flowbite-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function ContactUs() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setErrorMessage("Please fill out all the fileds");
      return;
    }
    console.log(formData);
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("api/inquiry/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      if(res.ok){
        setSuccess("Inquiry submitted Successfully.Memebr of our team will contact you soon.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later");
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="min-h-screen mt-20">
        <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
          {/*left*/}
          <div className="flex-1">
            <Link to="/" className="font-bold dark:text-white text-4xl">
              <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                Medi
              </span>
              Plus Support
            </Link>
            <p className="text-sm mt-5">
              Please Submit your Inquiry and we will get back to you as soon as
              possible.
            </p>
          </div>
          {/*right*/}
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="Your Name" />
                <TextInput
                  type="text"
                  placeholder="Name"
                  id="name"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label value="Your Email" />
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label value="Your Phone Number" />
                <TextInput
                  type="number"
                  placeholder="+94 70 100 0000"
                  id="phone"
                  onChange={handleChange}
                />
                <Label value="Your Message" />
                <Textarea
                  placeholder="Your Message"
                  id="message"
                  onChange={handleChange}/>
              </div>
              <Button
                gradientDuoTone="purpleToPink"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading....</span>
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </Button>
            </form>
            <div className=" flex gap-2 text-sm mt-5">
              <span>More Questions?</span>
              <Link to="#" className=" text-blue-500">
                FAQ
              </Link>
            </div>
            {errorMessage && (
              <Alert color="failure" className="mt-5">
                {errorMessage}
              </Alert>
            )}
            {success && (
              <Alert color="success" className="mt-5">
                {success}
              </Alert>
            
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
