import React, { useState, useEffect, useCallback } from 'react';
import JobApplicationData from '../types';
import { Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';

interface ViewApplicationsProps {
    applications: JobApplicationData[];
    onClose: () => void;
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({ applications, onClose }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredApplications, setFilteredApplications] = useState(applications);

    const url = window.location.href;

    const filterApplications = useCallback(
        debounce((term: string) => {
            const filtered = applications.filter(app =>
                app.title.toLowerCase().includes(term.toLowerCase()) ||
                app.company.toLowerCase().includes(term.toLowerCase()) ||
                app.position.toLowerCase().includes(term.toLowerCase()) ||
                app.location.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredApplications(filtered);
        }, 400),
        [applications]
    );

    useEffect(() => {
        filterApplications(searchTerm);
    }, [searchTerm, filterApplications]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            <style>
                {`
                    .custom-scrollbar {
                        --scrollbar-color: rgb(167, 139, 250, 0.9);
                        --scrollbar-bg-color: #FFFFFF;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: var(--scrollbar-bg-color);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: var(--scrollbar-color);
                        border: 3px solid var(--scrollbar-bg-color);
                    }
                    .custom-scrollbar {
                        scrollbar-color: var(--scrollbar-color) var(--scrollbar-bg-color);
                    }
                `}
            </style>
            <dialog open className={`bg-transparent ${url.includes("linkedin") ? "w-1/2" : "w-4/5 max-w-4xl"} z-99`}>
                <div className="container p-6 mx-auto bg-white rounded-lg shadow-lg text-gray-800">
                    <button
                        onClick={onClose}
                        className="absolute top-[4px] right-[3px] rounded-full p-1 border-white outline-white ring-white border-2 outline-2 ring-2 bg-violet-300 hover:bg-violet-400 focus:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-white focus:outline-white focus:border-white"
                        aria-label="Close"
                    >
                        <X className="text-white font-bold" size={24} />
                    </button>
                    <div className="flex justify-between items-center mb-4 pr-4 pl-1">
                        <h2 className="text-4xl font-semibold leading-tight">Job Applications</h2>
                        <div className="relative w-2/5">
                            <Search id="search-icon" className={`absolute font-bold ${isFocused ? "text-violet-500" : "text-gray-400"} left-3 top-1/2 transform -translate-y-1/2`} size={20} />
                            <input
                                id="search"
                                type="input"
                                placeholder="Search..."
                                className={`!w-full ${url.includes("linkedin") ? "h-14" : "h-10"} font-semibold pr-4 pl-14 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 border-gray-300 focus:border-none focus:outline-none`}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className={`min-w-full ${url.includes("linkedin") ? "text-[14px]" : "text-sm"}`}>
                            <thead className="bg-violet-500 text-white">
                                <tr className="text-left">
                                    <th className="p-3 rounded-tl-lg w-1/3">Job Title</th>
                                    <th className="p-3 w-[20%]">Company</th>
                                    <th className="p-3 w-[20%]">Location</th>
                                    <th className="p-3 w-[13%]">Position</th>
                                    <th className="p-3 rounded-tr-lg w-1/6">Applied<br /> Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((app, index) => (
                                    <tr key={index} className="border-b border-opacity-20 border-gray-300 bg-gray-50">
                                        <td className="p-3">{app.title}</td>
                                        <td className="p-3">{app.company}</td>
                                        <td className="p-3">{app.location}</td>
                                        <td className="p-3">{app.position}</td>
                                        <td className="p-3">
                                            <p>{new Date(app.timestamp).toLocaleDateString()}</p>
                                            <p className="text-gray-600">{new Date(app.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default ViewApplications;