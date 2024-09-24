import React, { useState, useRef, useEffect } from 'react';
import JobApplicationData from '../types';
import '../index.css';
import { X, ChevronDown } from 'lucide-react';

interface JobDataProps {
    jobData: Partial<JobApplicationData> | null;
    onClose: () => void;
    onAdd: (jobData: JobApplicationData) => void;
}

const AddJob: React.FC<JobDataProps> = ({ jobData, onClose, onAdd }) => {
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);
    const [formData, setFormData] = useState<Partial<JobApplicationData>>(jobData || {});
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const positionOptions = ["Full-time", "Part-time", "Internship", "Contract", "Other"];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handlePositionSelect = (option: string) => {
        console.log(formData);
        setFormData((prev) => {
            const newData = { ...prev, position: option };
            console.log("Position selected:", option);
            console.log("New form data:", newData);
            return newData;
        });
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAdd(formData as JobApplicationData);
    };

    const url = window.location.href;

    return (
        <dialog open className={`bg-transparent ${url.includes("linkedin") ? "w-2/5" : ""}`}>
            <div onClick={() => { if (isOpen) setIsOpen(false) }} id="add-job-modal-component" className={`inset-0 ${url.includes("linkedin") ? "w-full" : "w-fit"} gap-2 p-6 rounded-md shadow-md bg-white dark:bg-white`}>
                <button
                    onClick={onClose}
                    className="absolute top-[4px] right-[3px] rounded-full p-1 border-white outline-white ring-white border-2 outline-2 ring-2 bg-violet-300 hover:bg-violet-400 focus:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-white focus:outline-white focus:border-white"
                    aria-label="Close"
                >
                    <X className="text-white font-bold" size={24} />
                </button>
                <div className="bg-gray-50 text-gray-900 dark:bg-gray-50 dark:text-gray-900">
                    <form onSubmit={handleSubmit} className="flex flex-col mx-auto space-y-12">
                        <fieldset className="grid grid-cols-2 gap-6 p-6 rounded-md shadow-sm dark:bg-gray-100 bg-gray-100">
                            <div className="flex flex-col justify-between space-y-2 col-span-full lg:col-span-1">
                                <h1 className={`${url.includes("linkedin") ? "text-[24px]" : "text-3xl"} font-medium`}>Add your application<br></br> to the list!</h1>
                                <div className="flex flex-row justify-between">
                                    <button onClick={onClose} type="button" className="w-1/2 px-8 py-3 mr-2 font-semibold rounded bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-300">Cancel</button>
                                    <button type="submit" className="w-1/2 px-8 py-3 ml-2 font-semibold rounded text-gray-50 bg-violet-500 hover:bg-violet-600 focus:bg-violet-700 dark:text-gray-50 dark:bg-violet-500 dark:hover:bg-violet-600">Add</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 col-span-full lg:col-span-1">
                                <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                    <label htmlFor="Job Title" className={`${url.includes("linkedin") ? "text-[13px]" : "text-sm"} italic px-1 font-bold text-gray-800`}>Job Title</label>
                                    <input ref={firstInputRef} onChange={handleInputChange} id="title" type="title" defaultValue={jobData && jobData.title ? jobData.title : ""} placeholder="Title of the role" className={`!w-full ${url.includes("linkedin") ? "h-14" : "h-10"} px-4 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                </div>
                                <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                    <label htmlFor="Company" className={`${url.includes("linkedin") ? "text-[13px]" : "text-sm"} italic px-1 font-bold text-gray-800`}>Company</label>
                                    <input onChange={handleInputChange} id="company" type="company" defaultValue={jobData && jobData.company ? jobData.company : ""} placeholder="Company's name" className={`!w-full ${url.includes("linkedin") ? "h-14" : "h-10"} px-4 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                </div>
                                <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                    <label htmlFor="Location" className={`${url.includes("linkedin") ? "text-[13px]" : "text-sm"} italic px-1 font-bold text-gray-800`}>Location</label>
                                    <input onChange={handleInputChange} id="location" type="location" defaultValue={jobData && jobData.location ? jobData.location : ""} placeholder="Role location" className={`!w-full ${url.includes("linkedin") ? "h-14" : "h-10"} px-4 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`} required />
                                </div>
                                <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`} ref={dropdownRef}>
                                    <label htmlFor="Position" className={`${url.includes("linkedin") ? "text-[13px]" : "text-sm"} italic px-1 font-bold text-gray-800`}>Position</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            id="position"
                                            aria-haspopup="listbox"
                                            aria-expanded={isOpen}
                                            onClick={() => setIsOpen(!isOpen)}
                                            className={`!w-full ${url.includes("linkedin") ? "h-14" : "h-10"} px-4 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 focus:text-violet-600 hover:text-violet-500 border-gray-300 focus:border-none focus:outline-none bg-white flex items-center justify-between`}
                                        >
                                            {formData.position || "Select position type"}
                                            <ChevronDown size={20} />
                                        </button>
                                        {isOpen && (
                                            <ul id="position-dropdown" role="listbox" className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                                {positionOptions.map((option) => (
                                                    <li key={option} role="option" aria-selected={formData.position === option}>
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-4 py-2 hover:bg-violet-500 hover:text-gray-100 hover:font-semibold cursor-pointer"
                                                            onClick={() => handlePositionSelect(option)}
                                                        >
                                                            {option}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default AddJob;