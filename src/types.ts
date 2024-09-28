interface JobApplicationData {
    id?: string;
    url: string;
    timestamp: string;
    title: string;
    company: string;
    location: string;
    position: string;
    status: string;
};

let currentJobApplication: JobApplicationData = {
    url: '',
    timestamp: '',
    title: '',
    company: '',
    location: '',
    position: '',
    status: ''
};

export default JobApplicationData;
export { currentJobApplication };