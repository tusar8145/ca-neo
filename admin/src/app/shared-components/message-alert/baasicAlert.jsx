import React, { useState } from 'react';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';

const basicAlert = () => {
    const dispatch = useAppDispatch();
 
  // useState is a hook that allows you to have state variables in functional components
  const [count, setCount] = useState(0);

  // Function to handle button click
  const handleClick = () => {
    setCount(count + 1);
  };


  dispatch(showMessage({
    message: 'ok',
    autoHideDuration: 2000,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right'
    }
  }))

  return (
    <div>??????????????????????????????///
    </div>
  );
};

export default basicAlert;