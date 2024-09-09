interface JobApplicationData {
    url: string;
    timestamp: string;
    title: string;
    company: string;
    location: string;
    position: string;
};

let currentJobApplication: JobApplicationData = {
    url: '',
    timestamp: '',
    title: '',
    company: '',
    location: '',
    position: '',
};

export default JobApplicationData;
export { currentJobApplication };