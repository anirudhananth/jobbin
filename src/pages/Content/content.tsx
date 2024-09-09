import JobApplicationData from '../../types';

interface JobApplicationMessage {
    action: 'jobApplicationDetected' | 'jobDataCollected' | 'parseJobPosting';
    data: Partial<JobApplicationData> | null;
}

let isLoadingContent = false;

function Content() {
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
                if (chrome.runtime.lastError) {
                    console.log("Failed to send message:", chrome.runtime.lastError.message);
                } else {
                    console.log("Message sent successfully");
                }
            });
        } else {
            console.log("Chrome runtime not available");
        }
    }

    function extractJobDataFromAnthropic(): Promise<Partial<JobApplicationData>> {
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

            if (buttonText.includes('submit') || buttonValue.includes('submit')) {

                if (isJobApplicationPage()) {
                    isProcessing = true;

                    event.preventDefault();

                    try {
                        const jobData = await extractJobDataFromAnthropic();
                        console.log("Job data extracted:", jobData);
                        safeSendMessage({
                            action: "jobApplicationDetected",
                            data: jobData
                        });
                    } catch (error) {
                        console.error("Error extracting job data:", error);
                    }

                    if (form) processedForms.add(form);

                    setTimeout(() => {
                        if (target instanceof HTMLInputElement && target.form) {
                            target.form.submit();
                        } else if (target instanceof HTMLButtonElement) {
                            target.click();
                        }
                        isProcessing = false;
                    }, 100);
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