import React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Job from '../../components/job';
import AddJob from '../../components/add-job';

function Popup() {
  const jobData = {
    title: 'Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    position: 'Full-time',
    url: window.location.href,
    timestamp: new Date().toISOString(),
  }
  console.log("Hi")
  return (
    <div className='flex flex-col justify-center m-5 divide-y'>
      <p className='text-xl'>Add the Job</p>
      &nbsp;
      {/* <Job /> */}
      <AddJob
        jobData={jobData}
        onClose={() => {
        }}
        onAdd={() => {
        }}
      />

    </div>
  );
}


export default Popup;
