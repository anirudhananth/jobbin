import React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Job from '../../components/job';

function Popup() {
  return (
    <div className='flex flex-col justify-center m-5 divide-y'>
      <p className='text-xl'>Add the Job</p>
      &nbsp;
      <Job />
    </div>
  );
}


export default Popup;
