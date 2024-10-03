import { unmountComponentAtNode } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import JobApplicationData from '../../types';
import AddJob from '../../components/add-job';
import '../../index.css'
import ViewApplications from '../../components/view-applications';
import Usage from "../../components/usage";
import Loader from '../../components/loader';

interface JobApplicationMessage {
    action: 'jobApplicationDetected' | 'jobDataCollected' | 'parseJobPosting' | 'closeModal' | 'enableButton';
    data: Partial<JobApplicationData> | null;
}

let isLoadingContent = false;
let addJobModalRoot: HTMLDivElement | null = null;
let viewJobsModalRoot: HTMLDivElement | null = null;
let usageModalRoot: HTMLDivElement | null = null;
let loaderRoot: HTMLDivElement | null = null;
let addJobRoot: Root | null = null;
let viewApplicationsRoot: Root | null = null;
let usageRoot: Root | null = null;
let isCreatingViewJobs = false;
let isOpeningUsage = false;

function Content() {
    console.log("Job application detection script loaded");
    if (isLoadingContent) {
        return null;
    }
    isLoadingContent = true;
    console.log("Job application detection script loaded");

    let isListenerSetup = false;
    let isProcessing = false;
    const processedForms = new WeakSet();

    function isJobApplicationPage(): boolean {
        const url = window.location.href.toLowerCase();
        return url.includes('apply') || url.includes('job-application') || url.includes('careers') || url.includes('job');
    }

    function safeSendMessage(message: JobApplicationMessage): void {
        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Failed to send message:", chrome.runtime.lastError.message);
                } else {
                    console.log("Message sent successfully: ", response);
                }
            });
        } else {
            console.log("Chrome runtime not available");
        }
    }

    function convertToEST(date: string): string {
        const estOffset = -5;
        const utcDate = new Date(date);
        const utcTimestamp = utcDate.getTime();
        const estTimestamp = utcTimestamp + (estOffset * 60 * 60 * 1000);
        const estDate = new Date(estTimestamp);
        return estDate.toISOString();
    }

    function extractJobDataWithAI(): Promise<Partial<JobApplicationData>> {
        const postingText = document.body.innerText;

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "parseJobPosting", postingText }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve({
                        title: response.title,
                        company: response.company,
                        location: response.location,
                        position: response.position,
                        status: 'Applied',
                        url: window.location.href,
                        timestamp: convertToEST(new Date().toISOString()),
                    });
                }
            })
        })
    }

    function extractJobData(): Partial<JobApplicationData> {
        console.log("Extracting job data");
        const data: Partial<JobApplicationData> = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
        };

        const titleSelectors = ['h1', '.job-title', '.job-header', '[data-test="job-title"]'];
        const companySelectors = ['.company', '.company-name', '.company-header', '[data-test="company-name"]', 'meta[property="og:site_name"]'];
        const locationSelectors = ['.job-location', '[data-test="job-location"]', '[data-test="location"]'];
        const positionSelectors = ['.job-position', '[data-test="job-position"]', '[data-test="position"]'];

        data.title = findContent(titleSelectors);
        data.company = findContent(companySelectors);
        data.location = findContent(locationSelectors);
        data.position = findContent(positionSelectors);

        return data;
    }

    function findContent(selectors: string[]): string {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                if (selector.startsWith('meta')) {
                    return (element as HTMLMetaElement).content;
                }
                return element.textContent?.trim() || '';
            }
        }
        return '';
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "openAddJobModal") {
            console.log("Opening add job modal with data:", request.data);
            showLoader();
            setTimeout(() => {
                document.body.removeChild(loaderRoot!);
                addJob(request.data);
            }, 250);
            sendResponse({ success: true, message: "Add job modal opened" });
        } else if (request.action === "openViewApplicationsModal") {
            console.log("Opening view applications modal with data:", request.data);
            showLoader();
            setTimeout(() => {
                document.body.removeChild(loaderRoot!);
                viewApplications(request.data);
            }, 250);
            sendResponse({ success: true, message: "View applications modal opened" });
        } else if (request.action === "refreshModals") {
            unMountAddJobApplications();
            unMountViewApplications();
            unMountUsageModal();
            chrome.storage.local.set({ disabled: false });
            sendResponse({ success: true, message: "Modals refreshed" });
        } else if (request.action === "openAboutModal") {
            openUsage();
            sendResponse({ success: true, message: "Usage modal opened" });
        } else {
            console.log("Unknown action received:", request.action);
            sendResponse({ success: false, message: "Unknown action" });
        }
        return true;
    });

    async function addJob(jobData: Partial<JobApplicationData>) {
        const linkedInModal: HTMLDivElement | null = document.querySelector('#artdeco-modal-outlet');
        if (linkedInModal) {
            linkedInModal.style.display = 'none';
            linkedInModal.style.pointerEvents = 'none';
        }

        console.log("Adding job:", jobData);
        const modalRoot = document.createElement('div');
        modalRoot.id = 'add-job-popup';
        modalRoot.style.position = 'absolute';
        modalRoot.style.top = '0';
        modalRoot.style.left = '0';
        modalRoot.style.width = '0px';
        modalRoot.style.height = '0px';
        modalRoot.style.overflow = 'visible';
        modalRoot.style.zIndex = '2147483647';

        document.body.appendChild(modalRoot);
        const shadowRoot = modalRoot.attachShadow({ mode: 'closed' });

        const container = document.createElement('div');
        container.id = 'react-root';


        const tailwindLink = document.createElement('link');
        tailwindLink.rel = 'stylesheet';
        tailwindLink.href = chrome.runtime.getURL('tailwind.min.css');
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :host {
                all: initial;
                line-height: 1.5;
                -webkit-text-size-adjust: 100%;
                -moz-tab-size: 4;
                -o-tab-size: 4;
                tab-size: 4;
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }
            * {
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                scrollbar-width: thin;
                scrollbar-color: rgba(203, 213, 225, 1) transparent;
            }
            *::-webkit-scrollbar {
                width: 6px;
            }
            *::-webkit-scrollbar-track {
                background: transparent;
            }
            *::-webkit-scrollbar-thumb {
                background-color: rgba(203, 213, 225, 1);
                border-radius: 3px;
                border: 0;
            }

            #react-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgb(0, 0, 0, 0.4) !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                color: initial !important;
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            #react-root * {
                box-sizing: border-box !important;
            }
        `;

        shadowRoot.appendChild(tailwindLink);
        shadowRoot.appendChild(styleElement);
        shadowRoot.appendChild(container);

        await new Promise((resolve) => {
            tailwindLink.onload = resolve;
        });

        const root = createRoot(container);
        addJobModalRoot = modalRoot;
        addJobRoot = root;
        document.body.style.overflow = 'hidden';
        root.render(
            <AddJob
                jobData={jobData}
                onClose={() => {
                    unMountAddJobApplications();
                    if (linkedInModal) {
                        linkedInModal.style.display = 'block';
                        linkedInModal.style.pointerEvents = 'auto';
                    }
                }}
                onAdd={(updatedJobData: JobApplicationData) => {
                    updatedJobData.url = window.location.href;
                    safeSendMessage({
                        action: "jobDataCollected",
                        data: updatedJobData
                    });
                    unMountAddJobApplications();
                    if (linkedInModal) {
                        linkedInModal.style.display = 'block';
                        linkedInModal.style.pointerEvents = 'auto';
                    }
                }}
            />
        );
    }

    function unMountAddJobApplications() {
        if (!addJobModalRoot || !addJobRoot) {
            return;
        }
        addJobRoot.unmount();
        document.body.style.overflow = 'auto';
        document.body.removeChild(addJobModalRoot);
        chrome.storage.local.set({ disabled: false });
    }

    async function viewApplications(applications: JobApplicationData[]) {
        if (document.getElementById('view-applications-popup')) {
            console.log('Modal already exists, not creating a new one');
            return;
        }
        if (isCreatingViewJobs) {
            return;
        }
        isCreatingViewJobs = true;

        console.log("Viewing applications:", applications);
        const modalRoot = document.createElement('div');
        modalRoot.id = 'view-applications-popup';
        modalRoot.style.position = 'absolute';
        modalRoot.style.top = '0';
        modalRoot.style.left = '0';
        modalRoot.style.width = '0px';
        modalRoot.style.height = '0px';
        modalRoot.style.overflow = 'visible';
        modalRoot.style.zIndex = '2147483647';

        document.body.appendChild(modalRoot);
        const shadowRoot = modalRoot.attachShadow({ mode: 'closed' });

        const container = document.createElement('div');
        container.id = 'react-root';

        const tailwindLink = document.createElement('link');
        tailwindLink.rel = 'stylesheet';
        tailwindLink.href = chrome.runtime.getURL('tailwind.min.css');
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :host {
                all: initial;
                line-height: 1.5;
                -webkit-text-size-adjust: 100%;
                -moz-tab-size: 4;
                -o-tab-size: 4;
                tab-size: 4;
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }
            * {
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                scrollbar-width: thin;
                scrollbar-color: rgba(203, 213, 225, 1) transparent;
            }
            *::-webkit-scrollbar {
                width: 6px;
            }
            *::-webkit-scrollbar-track {
                background: transparent;
            }
            *::-webkit-scrollbar-thumb {
                background-color: rgba(203, 213, 225, 1);
                border-radius: 3px;
                border: 0;
            }

            #react-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgb(0, 0, 0, 0.4) !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                color: initial !important;
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            #react-root * {
                box-sizing: border-box !important;
            }
        `;

        shadowRoot.appendChild(tailwindLink);
        shadowRoot.appendChild(styleElement);
        shadowRoot.appendChild(container);

        await new Promise((resolve) => {
            tailwindLink.onload = resolve;
        });

        const root = createRoot(container);
        viewJobsModalRoot = modalRoot;
        viewApplicationsRoot = root;
        document.body.style.overflow = 'hidden';
        root.render(
            <ViewApplications
                applications={applications}
                onClose={() => {
                    unMountViewApplications();
                    isCreatingViewJobs = false;
                }}
            />
        );
    }

    function unMountViewApplications() {
        if (!viewJobsModalRoot || !viewApplicationsRoot) {
            return;
        }
        viewApplicationsRoot.unmount();
        document.body.style.overflow = 'auto';
        document.body.removeChild(viewJobsModalRoot);
        chrome.storage.local.set({ disabled: false });
        isCreatingViewJobs = false;
    }

    async function openUsage() {
        if (document.getElementById('usage-popup')) {
            console.log('Modal already exists, not creating a new one');
            return;
        }
        if (isOpeningUsage) {
            return;
        }
        isOpeningUsage = true;

        const modalRoot = document.createElement('div');
        modalRoot.id = 'view-applications-popup';
        modalRoot.style.position = 'absolute';
        modalRoot.style.top = '0';
        modalRoot.style.left = '0';
        modalRoot.style.width = '0px';
        modalRoot.style.height = '0px';
        modalRoot.style.overflow = 'visible';
        modalRoot.style.zIndex = '2147483647';

        document.body.appendChild(modalRoot);
        const shadowRoot = modalRoot.attachShadow({ mode: 'closed' });

        const container = document.createElement('div');
        container.id = 'react-root';

        const tailwindLink = document.createElement('link');
        tailwindLink.rel = 'stylesheet';
        tailwindLink.href = chrome.runtime.getURL('tailwind.min.css');
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :host {
                all: initial;
                line-height: 1.5;
                -webkit-text-size-adjust: 100%;
                -moz-tab-size: 4;
                -o-tab-size: 4;
                tab-size: 4;
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }
            * {
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                scrollbar-width: thin;
                scrollbar-color: rgba(203, 213, 225, 1) transparent;
            }
            *::-webkit-scrollbar {
                width: 6px;
            }
            *::-webkit-scrollbar-track {
                background: transparent;
            }
            *::-webkit-scrollbar-thumb {
                background-color: rgba(203, 213, 225, 1);
                border-radius: 3px;
                border: 0;
            }

            #react-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgb(1, 1, 1, 0.5) !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                color: initial !important;
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            #react-root * {
                box-sizing: border-box !important;
            }
        `;

        shadowRoot.appendChild(tailwindLink);
        shadowRoot.appendChild(styleElement);
        shadowRoot.appendChild(container);

        await new Promise((resolve) => {
            tailwindLink.onload = resolve;
        });

        const root = createRoot(container);
        usageModalRoot = modalRoot;
        usageRoot = root;
        document.body.style.overflow = 'hidden';
        root.render(
            <Usage
                onClose={() => {
                    unMountUsageModal();
                    isOpeningUsage = false;
                }}
            />
        );
    }

    function unMountUsageModal() {
        if (!usageModalRoot || !usageRoot) {
            return;
        }
        usageRoot.unmount();
        document.body.style.overflow = 'auto';
        document.body.removeChild(usageModalRoot);
        chrome.storage.local.set({ disabled: false });
        isOpeningUsage = false;
    }

    async function showLoader() {
        const modalRoot = document.createElement('div');
        modalRoot.id = 'view-applications-popup';
        modalRoot.style.position = 'absolute';
        modalRoot.style.top = '0';
        modalRoot.style.left = '0';
        modalRoot.style.width = '0px';
        modalRoot.style.height = '0px';
        modalRoot.style.overflow = 'visible';
        modalRoot.style.zIndex = '2147483647';

        document.body.appendChild(modalRoot);
        const shadowRoot = modalRoot.attachShadow({ mode: 'closed' });

        const container = document.createElement('div');
        container.id = 'react-root';

        const tailwindLink = document.createElement('link');
        tailwindLink.rel = 'stylesheet';
        tailwindLink.href = chrome.runtime.getURL('tailwind.min.css');
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :host {
                all: initial;
                line-height: 1.5;
                -webkit-text-size-adjust: 100%;
                -moz-tab-size: 4;
                -o-tab-size: 4;
                tab-size: 4;
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }
            * {
                font-family: Palanquin, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                scrollbar-width: thin;
                scrollbar-color: rgba(203, 213, 225, 1) transparent;
            }
            *::-webkit-scrollbar {
                width: 6px;
            }
            *::-webkit-scrollbar-track {
                background: transparent;
            }
            *::-webkit-scrollbar-thumb {
                background-color: rgba(203, 213, 225, 1);
                border-radius: 3px;
                border: 0;
            }

            #react-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgb(0, 0, 0, 0.4) !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                color: initial !important;
                font-size: 16px !important;
                line-height: 1.5 !important;
            }
            #react-root * {
                box-sizing: border-box !important;
            }
        `;

        shadowRoot.appendChild(tailwindLink);
        shadowRoot.appendChild(styleElement);
        shadowRoot.appendChild(container);

        await new Promise((resolve) => {
            tailwindLink.onload = resolve;
        });

        const root = createRoot(container);
        usageModalRoot = modalRoot;
        usageRoot = root;
        document.body.style.overflow = 'hidden';
        loaderRoot = modalRoot;
        root.render(<Loader />);
    }

    async function handlePotentialSubmission(event: Event): Promise<void> {
        if (isProcessing) return;

        const target = event.target as HTMLElement;
        const form = target.closest('form');

        if (form && processedForms.has(form)) return;

        if (target instanceof HTMLButtonElement ||
            (target instanceof HTMLInputElement && target.type === 'submit') ||
            (target instanceof HTMLInputElement && target.type === 'button') ||
            (target instanceof HTMLSpanElement && target.parentElement instanceof HTMLButtonElement)) {
            const buttonText = target.textContent?.trim().toLowerCase() || '';
            const buttonValue = (target instanceof HTMLInputElement ? target.value : '').toLowerCase();

            if (
                buttonText.includes('submit') ||
                buttonValue.includes('submit') ||
                (buttonText.includes('apply') && !buttonText.includes('easy apply') && target instanceof HTMLButtonElement && target.type === 'submit')
            ) {
                if (isJobApplicationPage()) {
                    isProcessing = true;

                    if (form) {
                        form.addEventListener('submit', (event) => {
                            onSubmit(form);
                        }, true);
                        return;
                    }

                    try {
                        const result = await chrome.storage.local.get(['openaiApiKey', 'anthropicApiKey']);
                        if (!result.openaiApiKey && !result.anthropicApiKey) {
                            setTimeout(() => {
                                addJob({
                                    title: '',
                                    company: '',
                                    location: '',
                                    position: '',
                                    status: 'Applied',
                                    url: window.location.href,
                                    timestamp: convertToEST(new Date().toISOString()),
                                });
                            }, 1000);
                        } else {
                            const jobData = await extractJobDataWithAI();
                            console.log("Job data extracted:", jobData);
                            showLoader();
                            setTimeout(() => {
                                document.body.removeChild(loaderRoot!);
                                addJob(jobData);
                            }, 1000);
                        }
                    } catch (error) {
                        console.log("Error extracting job data:", error);
                    }

                    if (form) processedForms.add(form);

                    isProcessing = false;
                }
            }
        }
    }

    async function onSubmit(form: HTMLFormElement) {
        try {
            const result = await chrome.storage.local.get(['openaiApiKey', 'anthropicApiKey']);
            if (!result.openaiApiKey && !result.anthropicApiKey) {
                setTimeout(() => {
                    addJob({
                        title: '',
                        company: '',
                        location: '',
                        position: '',
                        status: 'Applied',
                        url: window.location.href,
                        timestamp: convertToEST(new Date().toISOString()),
                    });
                }, 1000);
            } else {
                const jobData = await extractJobDataWithAI();
                console.log("Job data extracted:", jobData);
                showLoader();
                setTimeout(() => {
                    document.body.removeChild(loaderRoot!);
                    addJob(jobData);
                }, 1000);
            }
        } catch (error) {
            console.log("Error extracting job data:", error);
        }

        if (form) processedForms.add(form);

        isProcessing = false;
    }

    const observer = new MutationObserver(async (mutations: MutationRecord[]) => {
        if (isListenerSetup) {
            return;
        }
        document.addEventListener('click', handlePotentialSubmission, true);
        isListenerSetup = true;
        observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Job application detection setup complete");

    return null;
}

export default Content;