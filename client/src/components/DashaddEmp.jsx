// DashaddEmp.js

import React, { useState } from 'react';
import { Button, TextInput } from "flowbite-react"; // Import your UI components

export const DashaddEmp = () => {
    // State to track form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: '', // Role state to store selected role
    });

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch('/api/user/addEMP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                // Handle successful form submission (e.g., redirect or show success message)
                console.log('User created successfully');
            } else {
                // Handle error response from the server
                console.error('Error creating user:', await res.text());
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    // Function to handle input changes
    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    return (
        <div className="max-w-lg mx-auto p-3 w-full">
            <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <TextInput
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
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
                {/* Dropdown selection for user roles */}
                <label>
                    Select Role:
                    <select id="role" value={formData.role} onChange={handleChange}>
                        <option value="">Select Role</option>
                        <option value="isAdmin">Admin</option>
                        <option value="isDoctor">Doctor</option>
                        <option value="isNurse">Nurse</option>
                        <option value="isPharmacist">Pharmacist</option>
                        <option value="isReceptionist">Receptionist</option>
                        <option value="isHeadNurse">Head Nurse</option>
                        <option value="isHRM">HRM</option>
                    </select>
                </label>
                <Button type="submit" gradientDuoTone="purpleToBlue" outline>
                    Add
                </Button>
            </form>
        </div>
    );
};
