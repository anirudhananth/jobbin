import React from 'react';
import JobApplicationData from '../types';

interface ViewApplicationsProps {
    applications: JobApplicationData[];
    onClose: () => void;
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({ applications, onClose }) => {
    const url = window.location.href;
    return (
        <>
            <dialog open className={`bg-transparent ${url.includes("linkedin") ? "w-1/2" : "w-4/5 max-w-4xl"} z-99`}>
                <div className="container p-6 mx-auto bg-white rounded-lg shadow-lg text-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-4xl font-semibold leading-tight">Job Applications</h2>
                        <button onClick={onClose} className={`px-4 py-2 ${url.includes("linkedin") ? "w-28 h-16" : ""} bg-gray-200 rounded-md hover:bg-gray-300`}>Close</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full ${url.includes("linkedin") ? "text-[14px]" : "text-sm"}`}>
                            <thead className="bg-gray-300">
                                <tr className="text-left">
                                    <th className="p-3">Job Title</th>
                                    <th className="p-3">Company</th>
                                    <th className="p-3">Location</th>
                                    <th className="p-3">Position</th>
                                    <th className="p-3">Applied Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => (
                                    <tr key={index} className="border-b border-opacity-20 border-gray-300 bg-gray-50">
                                        <td className="p-3">{app.title}</td>
                                        <td className="p-3">{app.company}</td>
                                        <td className="p-3">{app.location}</td>
                                        <td className="p-3">{app.position}</td>
                                        <td className="p-3">
                                            <p>{new Date(app.timestamp).toLocaleDateString()}</p>
                                            <p className="text-gray-600">{new Date(app.timestamp).toLocaleTimeString()}</p>
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