interface JobApplicationData {
    id: string
    title: string;
    company: string;
    location: string;
    position: string;
    url: string;
    timestamp: string;
    status: string;
}

interface JobApplicationRequest {
    action: 'jobDataCollected' | 'closeModal' | 'getJobApplications' | 'updateJobStatus';
    data: JobApplicationData | null | { jobId: string, status: string };
}

interface DeleteJobsRequest {
    action: 'deleteJobs';
    data: { jobsIds: string[] };
}

interface JobParsingRequest {
    action: 'parseJobPosting';
    postingText: string;
}

const JOBBIN_SERVER_URL = "https://jobbin-server.vercel.app";

async function getOpenAIApiKey() {
    return new Promise<string>((resolve) => {
        chrome.storage.local.get(['openaiApiKey'], (result) => {
            resolve(result.openaiApiKey || '');
        });
    });
}

async function getSupabaseApiKey() {
    return new Promise<string>((resolve) => {
        chrome.storage.local.get(['supabaseKey'], (result) => {
            console.log(result);
            resolve(result.supabaseKey || '');
        });
    });
}

async function getAnthropicApiKey() {
    return new Promise<string>((resolve) => {
        chrome.storage.local.get(['anthropicApiKey'], (result) => {
            resolve(result.anthropicApiKey || '');
        });
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed!');
    chrome.storage.local.set({ disabled: false });
    chrome.storage.local.set({
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrY2VjZnRuc3l5Y2xjaG9nc3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxODc5MTksImV4cCI6MjA0MTc2MzkxOX0.2qtrmzcwFucw-bqsVnpdGmAUdx0Z1wHlV6SI2GZbG_E'
    });
    chrome.storage.local.set({ apiProvider: 'OpenAI' });
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

async function addJobApplication(job: JobApplicationData) {
    const { user } = await chrome.storage.local.get(['user']);
    if (!user) {
        console.error("User not found in storage");
        return;
    }

    try {
        const response = await fetch(`${JOBBIN_SERVER_URL}/add_job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...job, user_id: user.id })
        });

        if (!response.ok) {
            console.log("Error adding job application:", response);
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            console.log("Job application added successfully!");
        }
    } catch (error) {
        console.error("Error during Supabase insert:", error);
    }
}

async function getJobApplications(): Promise<JobApplicationData[]> {
    const { user } = await chrome.storage.local.get(['user']);
    if (!user) {
        console.error("User not found in storage.");
        return [];
    }

    try {
        const response = await fetch(`${JOBBIN_SERVER_URL}/get_jobs?user_id=${user.id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Job applications fetched successfully:", data);
        return data;
    } catch (error) {
        console.error("Error during Supabase select:", error);
        return [];
    }
}

async function updateJobStatus(jobId: string, status: string) {
    try {
        console.log("Updating job status...", jobId, status);
        const response = await fetch(`${JOBBIN_SERVER_URL}/update_job`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobId, status })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Job status updated successfully!");
    } catch (error) {
        console.error("Error updating job status: ", error);
        throw error;
    }
}

async function deleteJobs(jobIds: string[]) {
    try {
        const response = await fetch(`${JOBBIN_SERVER_URL}/delete_jobs`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobIds })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Jobs deleted successfully!");
    } catch (error) {
        console.error("Error deleting jobs: ", error);
        throw error;
    }
}

function parseClaudeResponse(response: string): { title: string, company: string, location: string, position: string } {
    const lines = response.split('\n');
    console.log('Lines:\n', lines);
    const title = lines[0].replace('Job title:', '').trim() || '';
    const company = lines[1].replace('Company:', '').trim() || '';
    const location = lines[2].replace('Location:', '').trim() || '';
    const position = lines[3].replace('Position:', '').trim() || '';

    return { title, company, location, position };
}

function isValidJobPostingResponse(response: any): response is { title: string, company: string, location: string, position: string } {
    return typeof response === 'object' &&
        typeof response.title === 'string' &&
        typeof response.company === 'string' &&
        typeof response.location === 'string' &&
        typeof response.position === 'string';
}

async function callAnthropic(prompt: string): Promise<string> {
    const apiKey = await getAnthropicApiKey();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
        })
    });

    if (!response.ok) {
        throw new Error('Failed to parse job posting');
    }

    const data = await response.json();
    return data.content[0].text.trim();
}

async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = await getOpenAIApiKey();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function parseJobPostingWithAI(postingText: string): Promise<{ title: string; company: string; location: string; position: string; }> {
    const prompt: string = `Given the following job posting, extract the job title, company, location, and position (exactly ONE of "Full-time", "Part-time", "Internship", "Contract", or "Other"):]):

    ${postingText}

    Provide only the extracted information in the following format:
    Job title:
    Company:
    Location:
    Position:
    `;

    try {
        const result: { [key: string]: string } = await chrome.storage.local.get(['apiProvider']);
        let response = null;
        if (result.apiProvider.toLowerCase() === 'openai') {
            response = await callOpenAI(prompt);
            console.log("OPENAI RESPONSE: ", response);
        } else {
            response = await callAnthropic(prompt);
            console.log("ANTHROPIC RESPONSE: ", response);
        }
        const parsedResponse = parseClaudeResponse(response);
        console.log('Parsed response:', parsedResponse);
        return parsedResponse;
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ((request as JobParsingRequest).action === 'parseJobPosting') {
        console.log('Parsing job posting with AI');
        parseJobPostingWithAI(request.postingText)
            .then(result => {
                sendResponse(result);
            })
            .catch(error => sendResponse({ error: error.message }));
        return true;
    } else if ((request as JobApplicationRequest).action === 'closeModal') {
        console.log('Closing modal');
        return true;
    } else if ((request as JobApplicationRequest).action === 'jobDataCollected') {
        console.log('Job data collected:', request);
        const job: JobApplicationData = request.data;
        chrome.storage.local.get(['jobApplications'], (result) => {
            const jobApplications: JobApplicationData[] = result.jobApplications || [];
            jobApplications.push(job);
            chrome.storage.local.set({ jobApplications });
        });
        addJobApplication(job);
        return true;
    } else if (request.action === 'getJobApplications') {
        const fetchApplications = async () => {
            try {
                const applications = await getJobApplications();
                console.log("Fetched applications in background:", applications);
                chrome.storage.local.set({ jobApplications: applications });
                sendResponse(applications);
                // return true;
            } catch (error: any) {
                console.error("Error in getJobApplications:", error);
                sendResponse({ error: error.message });
                return false;
            }
        };

        fetchApplications();
        return true;
    } else if (request.action === 'updateJobStatus') {
        const updateStatus = async () => {
            try {
                await updateJobStatus(request.data.jobId, request.data.status);
                sendResponse({ success: true });
            } catch (error: any) {
                console.error("Error updating job status: ", error);
                sendResponse({ error: error.message });
            }
        };

        updateStatus();
        return true;
    } else if ((request as DeleteJobsRequest).action === 'deleteJobs') {
        const deleteJobsHandler = async () => {
            try {
                await deleteJobs(request.data.jobIds);
                sendResponse({ success: true });
            } catch (error: any) {
                console.error("Error deleting jobs: ", error);
                sendResponse({ error: error.message });
            }
        };

        deleteJobsHandler();
        return true;
    }
    return false;
})