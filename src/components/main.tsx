import { useEffect, useState } from "react";
import AddJob from "./add-job"
import JobApplicationData from "../types";
import { User } from "@supabase/supabase-js";
import Dropdown from "./dropdown";
import { MouseEvent } from "react";
import { useDisabledState } from "./useDisabledState";
import { RefreshCw } from "lucide-react";

export default function Main({ signOut }: { signOut: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [disabled, setDisabled] = useDisabledState();
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [apiProvider, setApiProvider] = useState<string>('openai');
    const [apiKeyValue, setApiKeyValue] = useState<string>('');
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

    const useApiKey = () => {
        if (apiProvider.toLowerCase() === 'openai') {
            chrome.storage.local.set({ openaiApiKey: apiKeyValue });
        } else {
            chrome.storage.local.set({ anthropicApiKey: apiKeyValue });
        }
        setApiKeyValue('');
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
                return;
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
                return;
            }
        })
    }

    const handleAddApplication = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setDisabled(true);
            chrome.tabs.sendMessage(tabs[0].id!, { action: "openAddJobModal", data: jobData });
        })
    }

    const handleUsageClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setDisabled(true);
            chrome.tabs.sendMessage(tabs[0].id!, { action: "openAboutModal", data: null });
        })
    }

    const handleRefresh = () => {
        chrome.tabs.query({
            url: [
                "*://*.indeed.com/*",
                "*://*.linkedin.com/*",
                "*://*.glassdoor.com/*",
                "*://*.monster.com/*",
                "*://*.careerbuilder.com/*",
                "*://*.simplyhired.com/*",
                "*://*.ziprecruiter.com/*",
                "*://*.usajobs.gov/*",
                "*://*.dice.com/*",
                "*://*.angel.co/*",
                "https://api.anthropic.com/*",
                "https://api.openai.com/*",
                "https://*.supabase.co/*"
            ]
        }, function (tabs) {
            //   chrome.tabs.sendMessage(tabs[0].id!, { action: "refreshModals" });
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: "refreshModals" }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.log(`Error sending message to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                        } else {
                            console.log(`Message sent successfully to tab ${tab.id}`);
                        }
                    });
                }
            })
        });
        chrome.storage.local.set({
            disabled: false,
            openaiApiKey: '',
            anthropicApiKey: '',
            apiProvider: ''
        });
        setDropdownIsOpen(false);
        setApiKeyValue('');
    }

    return (
        <>
            <div onClick={() => { if (dropdownIsOpen) setDropdownIsOpen(false) }} className="p-2 bg-white text-gray-900">
                <div className="grid grid-cols-1 px-4 pt-4 overflow-hidden sm:justify-center flex-wrap bg-gray-100">
                    {/* <a rel="noopener noreferrer" href="#" className={`cursor-default text-start text-2xl pl-2 font-bold flex-shrink-0 py-2 text-gray-900`}>Welcome {user ? ", " + user.firstName : ""}!</a> */}
                    <div className="flex items-center justify-between">
                        <a rel="noopener noreferrer" href="#" className={`cursor-default text-start text-2xl pl-2 font-bold flex-shrink-0 py-2 text-gray-900`}>Welcome{user ? ", " + user.firstName : ""}!</a>
                        {/* <button
                            onClick={handleRefresh}
                            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Refresh"
                        >
                            <RefreshCw size={20} />
                        </button> */}
                    </div>
                </div>
                <div className="bg-gray-100">
                    <div className='divide-y divide-gray-200 h-0.5 bg-gray-200 mx-6'></div>
                </div>
                <div className="pt-4 bg-gray-100 dark:bg-gray-100">
                    <div className="flex justify-between">
                        <button onClick={handleUsageClick} disabled={disabled} type="button" className={`px-2 ml-6 mr-1 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-full`}>USAGE</button>
                        <button onClick={handleRefresh} type="button" className={`px-2 mr-6 ml-1 py-3 inline-flex justify-center items-center self-center font-semibold rounded bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600 w-full`}>
                            <RefreshCw size={16} />
                            &nbsp;&nbsp;REFRESH
                        </button>
                    </div>
                    <div className={`col-span-full sm:col-span-3 w-64 mx-auto mt-4`}>
                        <label htmlFor="key" className={`text-sm text-left font-bold text-gray-800 dark:text-gray-800 overflow-auto`}>Enter API Key.</label>
                        <input onChange={(e) => setApiKeyValue(e.target.value)} id="key" value={apiKeyValue} type="text" placeholder="API Key" className={`!w-full text-sm h-10 px-3 mb-4 border-2 rounded-md focus:ring-opacity-75 text-gray-600 focus:ring-violet-500 focus:outline-violet-500 focus:border-violet-500 border-gray-600 `} />
                    </div>
                    <div className="flex flex-col justify-between gap-4 pb-4">
                        <Dropdown
                            options={['OpenAI', 'Anthropic']}
                            onSelect={handleApiProviderSelect}
                            isOpen={dropdownIsOpen}
                            setIsOpen={setDropdownIsOpen}
                            width="w-48"
                            marginBottom="mb-4"
                        />
                        <button onClick={useApiKey} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>USE KEY</button>
                        <button onClick={handleViewApplications} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>VIEW APPLICATIONS</button>
                        <button onClick={handleAddApplication} disabled={disabled} type="button" className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>ADD APPLICATION</button>
                        <button onClick={signOut} type="button" disabled={disabled} className={`px-8 py-3 font-semibold rounded ${disabled ? "bg-gray-400 text-gray-600 bg-opacity-50" : "bg-gray-800 text-gray-100 hover:bg-violet-500 focus:bg-violet-600"} w-48 mx-auto`}>SIGN OUT</button>
                    </div>
                </div>
            </div>
        </>
    )
}