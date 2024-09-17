import { useState } from "react";
import AddJob from "./add-job"
import JobApplicationData from "../types";

export default function Main() {
    const [jobData, setJobData] = useState<JobApplicationData>({
        url: window.location.href,
        timestamp: new Date().toISOString(),
        title: '',
        company: '',
        location: '',
        position: '',
    });

    const handleAddApplication = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id!, { action: "openAddJobModal", data: jobData });
        })
    }

    return (
        <>
            <div className="p-2 bg-white text-gray-900">
                <div className="grid grid-cols-1 px-4 overflow-hidden sm:justify-center flex-wrap bg-gray-50 dark:bg-gray-50">
                    <a rel="noopener noreferrer" href="#" className={`cursor-default text-center text-lg font-bold flex-shrink-0 px-5 py-2 border-b-4 border-violet-600 text-gray-900`}>Welcome!</a>
                </div>
                <div className="pt-4 bg-gray-100 dark:bg-gray-100">
                    <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                        <label htmlFor="key" className={`text-sm text-left font-bold text-gray-800 dark:text-gray-800 overflow-auto`}>Enter your OpenAI / Anthropic API Key if your have one. AI will extract the job details to add to your application list.</label>
                        <input id="key" type="text" placeholder="API Key" className={`!w-full text-sm h-10 px-2 my-4 border-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 focus:outline-none focus:border-none border-gray-600 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-600`} />
                    </div>
                    <div className="flex flex-col justify-between gap-4 pb-4">
                        <button type="button" className="px-8 py-3 font-semibold rounded bg-gray-800 text-gray-100 w-48 mx-auto hover:bg-violet-400 focus:bg-violet-600">VIEW APPLICATIONS</button>
                        <button onClick={handleAddApplication} type="button" className="px-8 py-3 font-semibold rounded bg-gray-800 text-gray-100 w-48 mx-auto hover:bg-violet-400 focus:bg-violet-600">ADD APPLICATION</button>
                        <button type="button" className="px-8 py-3 font-semibold rounded bg-gray-800 text-gray-100 w-48 mx-auto hover:bg-violet-400 focus:bg-violet-600">SIGN OUT</button>
                    </div>
                </div>
            </div>
        </>
    )
}