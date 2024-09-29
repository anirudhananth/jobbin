import React, { useState, useEffect, useCallback } from 'react';
import JobApplicationData from '../types';
import { AlertTriangle, ChevronDown, ExternalLink, Search, Trash2, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import Loader from './loader';

interface ViewApplicationsProps {
    applications: JobApplicationData[];
    onClose: () => void;
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({ applications, onClose }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredApplications, setFilteredApplications] = useState(applications);
    const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const statusOptions: {
        [key: string]: string;
    } = {
        'Applied': 'bg-violet-600 text-gray-50 hover:bg-violet-700 focus:bg-violet-800',
        'Screening': 'bg-yellow-500 text-gray-50 hover:bg-yellow-600 focus:bg-yellow-700',
        'Rejected': 'bg-red-600 text-gray-50 hover:bg-red-700 focus:bg-red-800',
        'Interview': 'bg-orange-500 text-gray-50 hover:bg-orange-600 focus:bg-orange-700',
        'Offer': 'bg-green-600 text-gray-50 hover:bg-green-700 focus:bg-green-800'
    };

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

    const handleStatusChange = async (jobId: string, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            await chrome.runtime.sendMessage({
                action: 'updateJobStatus',
                data: { jobId, status: newStatus }
            });
            setFilteredApplications(prev =>
                prev.map(app => app.id === jobId ? { ...app, status: newStatus } : app)
            );
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const toggleDropdown = (jobId: string) => {
        if (openDropdown === jobId) {
            setOpenDropdown(null);
            return;
        }
        setOpenDropdown(openDropdown === jobId ? null : jobId);
    };

    const handleCheckboChange = (jobId: string) => {
        setSelectedJobs(prev =>
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    const handleDeleteSelected = async () => {
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (selectedJobs.length === 0) return;
        setIsDeleting(true);
        setShowConfirmModal(false);
        try {
            await chrome.runtime.sendMessage({
                action: 'deleteJobs',
                data: { jobIds: selectedJobs }
            });

            setFilteredApplications(prev =>
                prev.filter(app => !selectedJobs.includes(app.id!))
            );
            setSelectedJobs([]);
        } catch (error) {
            console.error('Failed to delete jobs:', error);
        } finally {
            setIsDeleting(false);
        }
    }

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
                        
                    .status-dropdown {
                        position: relative;
                    }

                    .status-dropdown-content {
                        position: absolute;
                        width: max-content;
                        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                        z-index: 1000;
                        top: 102%;
                        right: 0;
                    }

                    .status-option {
                        padding: 12px 12px;
                        text-decoration: none;
                        display: block;
                        cursor: pointer;
                    }

                    .status-option:hover {
                        background-color: #f1f1f1;
                    }

                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }

                    .checkbox-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        cursor: pointer;
                        user-select: none;
                        width: 100%;
                        height: 100%;
                    }

                    .checkbox-container input {
                        position: absolute;
                        opacity: 0;
                        cursor: pointer;
                        height: 0;
                        width: 0;
                    }

                    .checkmark {
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 17px;
                        width: 17px;
                        background-color: #ffffff;
                        border: 2px solid #8b5cf6;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                    }

                    .checkbox-container:hover input ~ .checkmark {
                        background-color: #f3f4f6;
                    }

                    .checkbox-container input:checked ~ .checkmark {
                        background-color: #8b5cf6;
                        border-color: #8b5cf6;
                    }

                    .checkmark:after {
                        content: "";
                        position: absolute;
                        display: none;
                        width: 5px;
                        height: 10px;
                        border: solid white;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
                    }

                    .checkbox-container input:checked ~ .checkmark:after {
                        display: block;
                    }
                `}
            </style>
            <dialog open className={`bg-transparent ${url.includes("linkedin") ? "w-7/12" : "w-3/5"}`}>
                <div onClick={() => { if (openDropdown) setOpenDropdown(null) }} className="container p-6 mx-auto bg-white rounded-lg shadow-lg text-gray-800">
                    {(updatingStatus || isDeleting) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[1000000]">
                            <Loader />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-[4px] right-[3px] rounded-full p-1 border-white outline-white ring-white border-2 outline-2 ring-2 bg-violet-300 hover:bg-violet-400 focus:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-white focus:outline-white focus:border-white"
                        aria-label="Close"
                    >
                        <X className="text-white font-bold" size={24} />
                    </button>
                    <div className="flex justify-between items-center mb-4 pr-4 pl-1">
                        <h2 className={`${url.includes("linkedin") ? "text-4xl" : "text-2xl"} font-semibold leading-tight pl-4`}>Job Applications</h2>
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

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar pr-[4px]">
                        <table className={`min-w-full ${url.includes("linkedin") ? "text-[14px]" : "text-sm"}`}>
                            <thead className={`bg-violet-500 text-white ${url.includes("linkedin") ? "h-24" : "h-14"}`}>
                                <tr className="text-left">
                                    <th className="p-3 rounded-tl-lg w-[5%] !text-center">
                                        <button
                                            onClick={handleDeleteSelected}
                                            disabled={selectedJobs.length === 0}
                                            className={`p-3 rounded-full ${selectedJobs.length === 0 ? "text-gray-200 cursor-not-allowed" : "text-white hover:text-violet-500 hover:bg-gray-50"}`}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </th>
                                    <th className="p-3 w-1/3">Job Title</th>
                                    <th className="p-3 w-[20%]">Company</th>
                                    <th className="p-3 w-[20%]">Location</th>
                                    <th className="p-3 w-[13%]">Position</th>
                                    <th className="p-3 w-4/12">Time (EST) </th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 rounded-tr-lg"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((app, index) => (
                                    <tr key={index} className="border-b border-opacity-20 border-gray-300 bg-gray-50 font-semibold text-gray-800">
                                        <td className="p-3 text-center">
                                            <label className="checkbox-container !text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedJobs.includes(app.id!)}
                                                    className="form-checkbox h-5 w-5 text-violet-600 focus:ring-violet-600 focus:bg-violet-600"
                                                    onChange={() => handleCheckboChange(app.id!)}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </td>
                                        <td className="p-3">{app.title}</td>
                                        <td className="p-3">{app.company}</td>
                                        <td className="p-3">{app.location}</td>
                                        <td className="p-3">{app.position}</td>
                                        <td className="p-3">
                                            <p>{new Date(app.timestamp).toLocaleDateString()}</p>
                                            <p className="text-gray-600">{new Date(app.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="status-dropdown">
                                                <span
                                                    className={`px-3 py-1 font-semibold rounded-md cursor-pointer flex items-center justify-between ${statusOptions[app.status]}`}
                                                    onClick={() => toggleDropdown(app.id!)}
                                                >
                                                    <span>{app.status}</span>
                                                    <ChevronDown size={16} className="ml-2" />
                                                </span>
                                                {openDropdown === app.id &&
                                                    (
                                                        <div className="absolute w-max z-10 top-[100%] right-0">
                                                            {Object.keys(statusOptions).map((status, index) => (
                                                                <div
                                                                    key={status}
                                                                    className={`${url.includes("linkedin") ? "p-4" : "p-3"} block cursor-pointer text-center bg-white text-gray-800 hover:bg-violet-500 hover:text-gray-100 ${index === 0 ? "rounded-t-md" : index === Object.keys(statusOptions).length - 1 ? "rounded-b-md" : ""}`}
                                                                    onClick={() => handleStatusChange(app.id!, status)}
                                                                >
                                                                    {status}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {
                                                app.url !== "" ?
                                                    <div className='cursor-pointer !text-violet-600 rounded-full hover:bg-gray-100 focus:text-violet-700'>
                                                        <a className="" target="_blank" rel="noopener noreferrer" href={app.url}>
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    </div> : ""
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </dialog>
            {showConfirmModal && (
                <div className={`modal-overlay z-9999`}>
                    <div className={`flex flex-col gap-2 ${url.includes("linkedin") ? "p-10 max-w-xl" : "p-6 max-w-md"} rounded-md shadow-md bg-gray-50 text-gray-800`}>
                        <h2 className={`flex items-center gap-2 ${url.includes("linkedin") ? "text-3xl" : "text-xl"} font-semibold leading-tight tracking-wide`}>
                            <AlertTriangle className={`${url.includes("linkedin") ? "w-8 h-8" : "w-6 h-6"} text-violet-600`} />
                            Confirm Deletion
                        </h2>
                        <p className="flex-1 text-gray-600">
                            Are you sure you want to delete {selectedJobs.length} selected job application{selectedJobs.length > 1 ? 's' : ''}? This action cannot be undone.
                        </p>
                        <div className="flex flex-col justify-end gap-3 mt-6 sm:flex-row">
                            <button
                                className="px-6 py-2 rounded-md border bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-300"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2 rounded-md shadow-sm bg-violet-500 hover:bg-violet-600 focus:bg-violet-700 dark:text-gray-50 dark:bg-violet-500 dark:hover:bg-violet-600"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewApplications;