// import { Anthropic } from '@anthropic-ai/sdk';
import { generateText } from 'ai';
// import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

interface JobApplicationData {
    title: string;
    company: string;
    location: string;
    position: string;
    url: string;
    timestamp: string;
    // user_id: string;
}

interface JobApplicationRequest {
    action: 'jobDataCollected' | 'closeModal';
    data: JobApplicationData | null;
}

interface JobParsingRequest {
    action: 'parseJobPosting';
    postingText: string;
}

// let supabase: any = null;
const supabaseUrl = 'https://ykcecftnsyyclchogssh.supabase.co';
// const clerk = new ClerkProvider({});

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

async function getAIProvider(provider: string) {
    return new Promise<OpenAI>((resolve) => {
        chrome.storage.local.get(['openai'], (result) => {
            resolve(result.openaiApiKey || '');
        });
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed!');
    // chrome.storage.local.set({ jobApplications: [] as JobApplicationData[] });
    chrome.storage.local.set({
        supabaseKey: 'KEY'
    });

    // addJobApplication({
    //     title: 'Software Engineer',
    //     company: 'Google',
    //     location: 'Mountain View, CA',
    //     position: 'Full-time',
    //     url: 'https://google.com',
    //     timestamp: new Date().toISOString()
    // });
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
        const supabaseKey = await getSupabaseApiKey();
        console.log(supabaseKey);
        const response = await fetch(`${supabaseUrl}/rest/v1/job_applications`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                // 'Authorization': `Bearer ${supabaseKey}`,
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

async function getJobApplications() {
    const { user } = await chrome.storage.local.get(['user']);
    if (!user) {
        console.error("User not found in storage.");
        return [];
    }

    try {
        const supabaseKey = await getSupabaseApiKey();
        const response = await fetch(`${supabaseUrl}/rest/v1/jobApplications?user_id=eq.${user.id}`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

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

async function callAnthropic(prmopt: string): Promise<string> {
    const apiKey = 'KEY';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "Human",
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
    return data.choices[0].message.content.trim();
}

async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = 'API_KEY';

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
    const prompt: string = `Given the following job posting, extract the job title, company, location, and position (the position field is only whether it's full-time, part-time, internship, etc.):

    ${postingText}

    Provide only the extracted information in the following format:
    Job title:
    Company:
    Location:
    Position:
    `;

    try {
        const response = await callOpenAI(prompt);
        console.log("OPENAI RESPONSE: ", response);
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
        parseJobPostingWithAI(request.postingText)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true;
    } else if ((request as JobApplicationRequest).action === 'closeModal') {
        console.log('Closing modal');
        return true;
    } else if ((request as JobApplicationRequest).action === 'jobDataCollected') {
        console.log('Job data collected:', request);
        const job: JobApplicationData = request.data;
        chrome.storage.local.get(['jobApplications'], (result) => {
            const jobApplications: JobApplicationData[] = result.data || [];
            jobApplications.push(job);
            chrome.storage.local.set({ jobApplications });
        });
        addJobApplication(job);
        return true;
    } else if (request.action === 'getJobApplications') {
        getJobApplications()
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
    return false;
})