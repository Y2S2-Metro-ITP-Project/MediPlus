import React, { useState } from 'react';
import { Button, TextInput } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const DashaddEmp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
        doctortype: '',
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
        employeeImage: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imageFileUploadingProgress, setImageFileUploadingProgress] = useState(null);
    const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
    const [fileUploadSuccess, setFileUploadSuccess] = useState(false);


    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        setImageFile(file);

        const storage = getStorage();
        const filename = new Date().getTime() + file.name;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, file);

        try {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setImageFileUploadingProgress(progress.toFixed(0));
                },
                (error) => {
                    setImageFileUploadingError("Could not upload image(File must be less than 2MB)");
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setFormData(prevData => ({
                            ...prevData,
                            employeeImage: downloadURL
                        }));
                        setFileUploadSuccess("File Uploaded Successfully");
                        setImageFileUploadingProgress(null);
                    });
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormData({ ...formData, Name: formData.username });
        const { username, email, password, role, dateOfBirth, salary, gender, address, contactPhone,
            specialization, experience, qualifications, consultationFee, bio, doctortype } = formData;

        if (!username || !email || !password || !role || !dateOfBirth || !gender || !address || !contactPhone) {
            toast.error("All fields are required");
            return;
        }
        // Example of validating date of birth format
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dateOfBirth)) {
            toast.error("Invalid date of birth format. Please use YYYY-MM-DD format.");
            return;
        }

        // Example of validating phone number format
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(contactPhone)) {
            toast.error("Invalid contact phone number. Please enter a 10-digit phone number.");
            return;
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
                toast.success('Employee added successfully');
            } else {
                const data = await res.json();
                toast.error(`Error adding employee: ${data.message}`);
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            toast.error('Failed to add employee');
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
    };

    return (
        <div className=" max-w-3xl mx-auto p-3 w-full">
            <ToastContainer />
            <h1 className="my-7 text-center font-semibold text-3xl">ADD EMPLOYEE</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
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
                            <option value="isCashier">Cashier</option>
                            <option value="isLabTech">Lab Technician</option>
                        </select>
                    </div>
                    {formData.role === "isDoctor" && (
                        <>
                            <div className="flex flex-col">
                                <select
                                    id="doctortype"
                                    value={formData.doctortype}
                                    onChange={handleChange}
                                    className="input-field dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Select Doctor Type</option>
                                    <option value="Permenent">Permanent Doctor</option>
                                    <option value="Visiting">Visiting Doctor</option>
                                </select>
                            </div>
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
                            <TextInput
                                type="text"
                                id="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Bio"
                            />
                        </>
                    )}
                    <TextInput
                        type="number"
                        id="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="Salary"
                        disabled={formData.role === "isDoctor" && formData.doctortype === "Visiting"}
                    />


                    <div className="flex items-center">
                        <label htmlFor="dateOfBirth" className="text-sm font-semibold dark:text-gray-300 mr-2">Date of Birth</label>
                        <TextInput
                            type="date"
                            id="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            placeholder="Date of Birth"
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
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-4"
                />
                {imageFileUploadingProgress && (
                    <div className="mt-2">
                        <progress value={imageFileUploadingProgress} max="100" />
                    </div>
                )}
                {imageFileUploadingError && (
                    <div className="mt-2">
                        <p className="text-red-500">{imageFileUploadingError}</p>
                    </div>
                )}
                {fileUploadSuccess && (
                    <div className="mt-2">
                        <p className="text-green-500">{fileUploadSuccess}</p>
                    </div>
                )}
                <Button type="submit" gradientDuoTone="purpleToBlue" outline>
                    Add
                </Button>
            </form>
        </div>
    );
}; 