import React, { useState, useEffect } from 'react';
import '../../styles/custom-basic.css';


const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div  className="dmnone" style={styles.clockContainer}>
      <div style={styles.date}>{formatDate(currentTime)}</div>
      <div style={styles.time}>{formatTime(currentTime)}</div>
    </div>
  );
};

const styles = {
  clockContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
 
    backgroundColor: '#f0f0f0',
    padding: '0px 10px 0px 10px',
    marginRight: '30px',
    borderRadius: '10px',
  },
  date: {
    fontSize: '1em',
    marginBottom: '2px',
  },
  time: {
    fontSize: '1.5em',
  },
};

export default Clock;