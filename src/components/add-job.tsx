import React, { useState } from 'react';
import JobApplicationData from '../types';
import '../index.css';

interface JobDataProps {
    jobData: Partial<JobApplicationData>;
    onClose: () => void;
    onAdd: () => void;
}

const AddJob: React.FC<JobDataProps> = ({ jobData, onClose, onAdd }) => {
    const container = document.getElementById("add-job-modal-component")
    container?.addEventListener("click", (e) => {
        chrome.runtime.sendMessage({ action: "closeModal" });
    });
    const url = window.location.href;
    console.log(url);
    return (
        <div id="add-job-modal-component" className={`inset-0 ${url.includes("linkedin") ? "w-2/5 h-max-content" : "w-fit"} gap-2 p-6 rounded-md shadow-md bg-white dark:bg-white`}>
            <div className="bg-gray-50 text-gray-900 dark:bg-gray-50 dark:text-gray-900">
                <form action="submit" className="flex flex-col mx-auto space-y-12">
                    <fieldset className="grid grid-cols-2 gap-6 p-6 rounded-md shadow-sm dark:bg-gray-100 bg-gray-100">
                        <div className="flex flex-col justify-between space-y-2 col-span-full lg:col-span-1">
                            <h1 className={`${url.includes("linkedin") ? "text-[24px]" : "text-3xl"} font-medium`}>Add your application<br></br> to the list!</h1>
                            <div className="flex flex-row justify-between">
                                <button onClick={onClose} type="button" className="w-1/2 px-8 py-3 mr-2 font-semibold rounded bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-gray-200">Cancel</button>
                                <button onClick={onAdd} type="button" className="w-1/2 px-8 py-3 ml-2 font-semibold rounded text-gray-50 bg-violet-500 hover:bg-violet-600 dark:text-gray-50 dark:bg-violet-500 dark:hover:bg-violet-600">Add</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 col-span-full lg:col-span-1">
                            <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                <label htmlFor="Job Title" className={`${url.includes("linkedin") ? "text-[14px]" : "text-sm"} italic px-1 font-bold text-violet-500 dark:text-violet-500`}>Job Title</label>
                                <input id="job-title" type="job-title" defaultValue={jobData.title} placeholder="Title of the role" className={`!w-full ${url.includes("linkedin") ? "h-14" : ""} h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-300`} />
                            </div>
                            <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                <label htmlFor="Company" className={`${url.includes("linkedin") ? "text-[14px]" : "text-sm"} italic px-1 font-bold text-violet-500 dark:text-violet-500`}>Company</label>
                                <input id="company" type="company" defaultValue={jobData.company} placeholder="Company's name" className={`!w-full ${url.includes("linkedin") ? "h-14" : ""} h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-300`} />
                            </div>
                            <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                <label htmlFor="Location" className={`${url.includes("linkedin") ? "text-[14px]" : "text-sm"} italic px-1 font-bold text-violet-500 dark:text-violet-500`}>Location</label>
                                <input id="location" type="location" defaultValue={jobData.location} placeholder="Role location" className={`!w-full ${url.includes("linkedin") ? "h-14" : ""} h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-300`} />
                            </div>
                            <div className={`col-span-full sm:col-span-3 ${url.includes("linkedin") ? "w-full" : "w-96"}`}>
                                <label htmlFor="Position" className={`${url.includes("linkedin") ? "text-[14px]" : "text-sm"} italic px-1 font-bold text-violet-500 dark:text-violet-500`}>Position</label>
                                <input id="position" type="position" defaultValue={jobData.position} placeholder="Full-time / Internship" className={`!w-full ${url.includes("linkedin") ? "h-14" : ""} h-10 px-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-300`} />
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
            {/* <h2 className="flex items-center gap-2 !text-xl font-semibold leading-tight tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-current shrink-0 text-violet-400 dark:text-violet-600">
                    <path d="M451.671,348.569,408,267.945V184c0-83.813-68.187-152-152-152S104,100.187,104,184v83.945L60.329,348.568A24,24,0,0,0,81.432,384h86.944c-.241,2.636-.376,5.3-.376,8a88,88,0,0,0,176,0c0-2.7-.135-5.364-.376-8h86.944a24,24,0,0,0,21.1-35.431ZM312,392a56,56,0,1,1-111.418-8H311.418A55.85,55.85,0,0,1,312,392ZM94.863,352,136,276.055V184a120,120,0,0,1,240,0v92.055L417.137,352Z"></path>
                    <rect width="32" height="136" x="240" y="112"></rect>
                    <rect width="32" height="32" x="240" y="280"></rect>
                </svg>Necessitatibus dolores quasi quae?
            </h2>
            <p className="flex-1 text-gray-400 dark:text-gray-600">Mauris et lorem at elit tristique dignissim et ullamcorper elit. In sed feugiat mi. Etiam ut lacinia dui.</p>
            <div className="flex flex-col justify-end gap-3 mt-6 sm:flex-row">
                <button className="px-6 py-2 rounded-sm">No</button>
                <button className="px-6 py-2 rounded-sm shadow-sm bg-violet-400 dark:bg-violet-600 text-gray-900 dark:text-gray-50">Yes</button>
            </div> */}
        </div>
    )
}

export default AddJob;