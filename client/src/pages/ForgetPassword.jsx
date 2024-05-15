import { Alert, Button, Label, Spinner, TextInput, ToastToggle } from "flowbite-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInSuccess,
  signInStart,
  signInFailure,
} from "../redux/user/userSlice";
import { ToastContainer, toast } from "react-toastify";
import OAuth from "../components/OAuth";

export default function ForgetPassword() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    const [loading, setLoading] = useState(false);
    const handlePasswordReset = async (e) => {
        setLoading(true);
        e.preventDefault();
        if (!formData.email) {
          toast.error("Please fill in all fields");
          return;
        }
        try {
          const res = await fetch("api/auth/forget-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (data.success === false) {
            toast.error(data.message);
            setFormData({});
            setLoading(false);
          }
          if (res.ok) {
            setLoading(false);  
            toast.success(data.message);
          }
        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div className="min-h-screen mt-20">
      <ToastContainer />
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/*left*/}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Medi
            </span>
            Plus
          </Link>
          <p className="text-sm mt-5">
            Reset Your Password by receiving email notifications
          </p>
        </div>
        {/*right*/}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handlePasswordReset}>
            <div>
              <Label value="Your Email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
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
                "Reset Password"
              )}
            </Button>
          </form>
          <div className=" flex gap-2 text-sm mt-5">
            <span>Dont Have an account?</span>
            <Link to="/sign-up" className=" text-blue-500">
              Sign Up
            </Link>
          </div>
          <div className=" flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className=" text-blue-500">
              Sign In
            </Link>
            </div>
        </div>
      </div>
    </div>
  )
}
