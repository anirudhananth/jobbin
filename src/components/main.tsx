import { useEffect, useState } from "react";
import AddJob from "./add-job"
import JobApplicationData from "../types";
import { User } from "@supabase/supabase-js";
import Dropdown from "./dropdown";
import { MouseEvent } from "react";
import { useDisabledState } from "./useDisabledState";

export default function Main() {
    const [user, setUser] = useState<any>(null);
    const [disabled, setDisabled] = useDisabledState();
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [apiProvider, setApiProvider] = useState<string>('openai');
    const [jobApplications, setJobApplications] = useState<JobApplicationData[]>([]);
    const [showApplications, setShowApplications] = useState<boolean>(false);
    const [jobData, setJobData] = useState<JobApplicationData>({
        url: window.location.href,
        timestamp: new Date().toISOString(),
        title: '',
        company: '',
        location: '',
        position: '',
    });

    const initUser = async () => {
        const { user } = await chrome.storage.local.get(['user']);
        setUser(user);
    }

    useEffect(() => {
        initUser();
    }, []);

    const useApiKey = (e: MouseEvent) => {
        chrome.storage.local.set({ openaiApiKey: (e.target as HTMLInputElement).value });
    }

    const handleApiProviderSelect = (option: string) => {
        setApiProvider(option);
        chrome.storage.local.set({ apiProvider: option });
    }

    const handleViewApplications = async () => {
        chrome.runtime.sendMessage({ action: "getJobApplications" }, async (response) => {
            if (chrome.runtime.lastError) {
                console.log("Error fetching job applications: ", chrome.runtime.lastError);
            } else {
                setJobApplications(response);
                setShowApplications(true);
                setDisabled(true);
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id!, { action: "openViewApplicationsModal", data: response });
                })
            }

            const local: { [key: string]: JobApplicationData[] } = await chrome.storage.local.get(['jobApplications']);
            if (local.jobApplications) {
                const jobApplications = local.jobApplications;
                console.log("LMFAO: ", jobApplications);
                setJobApplications(jobApplications);
                setShowApplications(true);
                setDisabled(true);
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id!, { action: "openViewApplicationsModal", data: jobApplications });
                })
            }
        })
    }

    const handleAddApplication = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setDisabled(true);
            chrome.tabs.sendMessage(tabs[0].id!, { action: "openAddJobModal", data: jobData });
        })
    }

    return (
        <>
            <div onClick={() => { if (dropdownIsOpen) setDropdownIsOpen(false) }} className="p-2 bg-white text-gray-900">
                <div className="grid grid-cols-1 px-4 pt-4 overflow-hidden sm:justify-center flex-wrap bg-gray-100">
                    <a rel="noopener noreferrer" href="#" className={`cursor-default text-start text-2xl pl-2 font-bold flex-shrink-0 py-2 text-gray-900`}>Welcome {user ? ", " + user.firstName : ""}!</a>
                </div>
                <div className="pt-4 bg-gray-100 dark:bg-gray-100">
                    <div className={`col-span-full sm:col-span-3 w-64 mx-auto`}>
                        <label htmlFor="key" className={`text-sm text-left font-bold text-gray-800 dark:text-gray-800 overflow-auto`}>Enter your OpenAI / Anthropic API Key if your have one. AI will extract the job details to add to your application list.</label>
                        <input id="key" type="text" placeholder="API Key" className={`!w-full text-sm h-10 px-3 my-4 border-2 rounded-md focus:ring focus:ring-opacity-75 text-gray-600 focus:ring-violet-600 focus:outline-none focus:border-none border-gray-600 dark:text-gray-600 dark:focus:ring-violet-600 dark:border-gray-600`} />
                    </div>
                    <div className="flex flex-col justify-between gap-4 pb-4">
                        <Dropdown
                            options={['OpenAI', 'Anthropic']}
                            onSelect={handleApiProviderSelect}
                            isOpen={dropdownIsOpen}
                            setIsOpen={setDropdownIsOpen}
                        />
                        <button onClick={(e: MouseEvent<HTMLButtonElement>) => useApiKey(e)} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>USE KEY</button>
                        <button onClick={handleViewApplications} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>VIEW APPLICATIONS</button>
                        <button onClick={handleAddApplication} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>ADD APPLICATION</button>
                        <button type="button" disabled={disabled} className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>SIGN OUT</button>
                    </div>
                </div>
            </div>
        </>
    )
}