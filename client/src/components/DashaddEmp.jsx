import React, { useState } from 'react';
import { Button, TextInput } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const DashaddEmp = () => {
    const [formData, setFormData] = useState({
        username: '', // Used for both username and employee name
        email: '',
        password: '',
        role: '',
        dateOfBirth: '',
        salary: '',
        gender: 'not given',
        address: '',
        contactPhone: '',
        specialization: '',
        experience: '',
        qualifications: '',
        consultationFee: '',
        bio: '',
        employeeimg: "",
    });

    const [roleError, setRoleError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.role) {
            setRoleError(true);
            return; // Don't submit the form if role is not selected
        }
        try {
            const res = await fetch('/api/employee/addEMP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                console.log('User created successfully');
                toast.success("User created successfully");
            } else {
                const data = await res.json(); // Parse response body
                console.error('Error creating user:', data);
                if (data && data.message && data.message.includes('duplicate key error')) {
                    // Check if error message contains 'username' or 'email'
                    if (data.message.includes('username')) {
                        // Show error toast for duplicate username
                        toast.error('Username already exists. Please choose a different username.');
                    } else if (data.message.includes('email')) {
                        // Show error toast for duplicate email
                        toast.error('Email already exists. Please choose a different email.');
                    } else {
                        // Show generic error toast for other errors
                        toast.error('Error creating user: ' + data.message);
                    }
                } else {
                    // Show generic error toast for other errors
                    toast.error('Error creating user: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user. Please try again later.');
        }
    };

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value,
            // Update the 'Name' field whenever the 'username' field changes
            ...(id === 'username' && { Name: value })
        }));
        if (id === 'role') {
            setRoleError(false);
        }
    };
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setFormData(prevData => ({
            ...prevData,
            employeeimg: file,
        }));
    };

    return (
        <div className="max-w-lg mx-auto p-3 w-full">
            <ToastContainer />
            <h1 className="my-7 text-center font-semibold text-3xl">ADD EMPLOYEE</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <TextInput
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Employee Name"
                />
                <TextInput
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                />
                <TextInput
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                />
                <div className="flex flex-col">
                    <select
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="input-field dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Select Role</option>
                        <option value="isDoctor">Doctor</option>
                        <option value="isNurse">Nurse</option>
                        <option value="isPharmacist">Pharmacist</option>
                        <option value="isReceptionist">Receptionist</option>
                        <option value="isHeadNurse">Head Nurse</option>
                    </select>
                </div>
                {formData.role === "isDoctor" && (
                    <>
                        <TextInput
                            type="text"
                            id="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            placeholder="Specialization"
                        />
                        <TextInput
                            type="number" // Change to lowercase "number"
                            id="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Experience (years)"
                        />
                        <TextInput
                            type="text"
                            id="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            placeholder="Qualifications"
                        />
                        <TextInput
                            type="number" // Change to lowercase "number"
                            id="consultationFee"
                            value={formData.consultationFee}
                            onChange={handleChange}
                            placeholder="Consultation Fee"
                        />
                        <textarea
                            type="text"
                            id="bio"
                            style={{ width: "485px" }}
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Bio"
                            className="bg-gray-50 border-gray-300 text-gray-900 text-sm h-20 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />

                    </>
                )}

                <div className="flex items-center">

                    <TextInput
                        type="number"
                        id="salary"
                        //   value={formData.dateOfBirth}
                        onChange={handleChange}
                        placeholder="Salary"
                        className="w-full"
                    />
                </div>

                <div className="flex items-center">
                    <label htmlFor="dateOfBirth" className="text-sm font-semibold dark:text-gray-300 mr-2">Date of Birth</label>
                    <TextInput
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        placeholder="Date of Birth"
                        className="w-full"
                    />
                </div>


                <div className="flex flex-col">
                    <select
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="input-field dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <TextInput
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                />
                <TextInput
                    type="text"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Phone"
                />
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                    <input
                        type="file"
                        id="employeeimg"
                        onChange={handleImageChange}
                        accept="image/*" // Allow only image files
                    />
                </div>

                <br />
                <Button type="submit" gradientDuoTone="purpleToBlue" outline>
                    Add
                </Button>
            </form>
        </div>
    );
};
