import React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

function InputBox(
    {
        id,
        value,
        setValue,
        labelText,
        placeholder,
        required = false
    }: {
        id: string,
        value: string,
        setValue: (value: string) => void,
        labelText: string,
        placeholder: string,
        required?: boolean
    }
) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{labelText}</label>
            <input
                type="text"
                id={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={placeholder}
                required
            />
        </div>
    )
}

function Job() {
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const jobDetails = { jobTitle, company, location };

        chrome.storage.sync.get({ jobs: [] }, (result: any) => {
            const updatedJobs = [...result.jobs, jobDetails];
            chrome.storage.sync.set({ jobs: updatedJobs }, () => {
                console.log('Job details saved to chrome storage.');
                setJobTitle('');
                setCompany('');
                setLocation('');
            });
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-5">
            <InputBox
                id='jobTitle'
                value={jobTitle}
                setValue={setJobTitle}
                labelText='Job Title'
                placeholder='Software Engineer'
                required={true}
            />
            <InputBox
                id='company'
                value={company}
                setValue={setCompany}
                labelText='Company'
                placeholder='Google'
                required={true}
            />
            <InputBox
                id='location'
                value={location}
                setValue={setLocation}
                labelText='Location'
                placeholder='Mountain View, CA'
                required={true}
            />
            <div className='text-center'>
                <Button type="submit" variant="contained" className='w-full'>ADD JOB</Button>
            </div>
        </form>
    );
}

export default Job;