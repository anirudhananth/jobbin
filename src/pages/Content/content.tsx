import { unmountComponentAtNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import JobApplicationData from '../../types';
import AddJob from '../../components/add-job';
import '../../index.css'
interface JobApplicationMessage {
    action: 'jobApplicationDetected' | 'jobDataCollected' | 'parseJobPosting' | 'closeModal';
    data: Partial<JobApplicationData> | null;
}

let isLoadingContent = false;
let modalRoot: HTMLDivElement | null = null;

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

    // Function to check if the current page is a job application page
    function isJobApplicationPage(): boolean {
        const url = window.location.href.toLowerCase();
        return url.includes('apply') || url.includes('job-application') || url.includes('careers') || url.includes('job');
    }

    // Function to safely send a message to the background script
    function safeSendMessage(message: JobApplicationMessage): void {
        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(message, (response) => {
                console.log("Response from background script:", response);
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

    function extractJobDataWithAI(): Promise<Partial<JobApplicationData>> {
        const postingText = document.body.innerText;

        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "parseJobPosting", postingText }, (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve({
                        title: response.title,
                        company: response.company,
                        location: response.location,
                        position: response.position,
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                    })
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
            addJob(request.data);
        }
    });

    async function addJob(jobData: Partial<JobApplicationData>) {
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
                background-color: transparent !important;
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
        root.render(
            <AddJob
                jobData={jobData}
                onClose={() => {
                    root.unmount();
                    document.body.removeChild(modalRoot);
                }}
                onAdd={(updatedJobData: JobApplicationData) => {
                    safeSendMessage({
                        action: "jobDataCollected",
                        data: updatedJobData
                    });
                    root.unmount();
                    document.body.removeChild(modalRoot);
                }}
            />
        );
    }

    async function handlePotentialSubmission(event: Event): Promise<void> {
        if (isProcessing) return;
        // isProcessing = true;
        // const jobData = {
        //     title: 'Software Engineer',
        //     company: 'Google',
        //     location: 'Mountain View, CA',
        //     position: 'Full-time',
        //     url: window.location.href,
        //     timestamp: new Date().toISOString(),
        // }
        // addJob(jobData);

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
                (buttonText.includes('apply') && target instanceof HTMLButtonElement && target.type === 'submit')
            ) {

                if (isJobApplicationPage()) {
                    isProcessing = true;

                    event.preventDefault();

                    try {
                        const jobData = await extractJobDataWithAI();
                        // const jobData = {
                        //     title: 'Software Engineer',
                        //     company: 'Google',
                        //     location: 'Mountain View, CA',
                        //     position: 'Full-time',
                        //     url: window.location.href,
                        //     timestamp: new Date().toISOString(),
                        // }
                        console.log("Job data extracted:", jobData);
                        // safeSendMessage({
                        //     action: "jobApplicationDetected",
                        //     data: jobData
                        // });

                        addJob(jobData);
                    } catch (error) {
                        console.error("Error extracting job data:", error);
                    }

                    if (form) processedForms.add(form);

                    isProcessing = false;
                }
            }
        }
    }

    // if (isJobApplicationPage()) {
    //     if (jobDataExtracted) {
    //         return
    //     }
    // }
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