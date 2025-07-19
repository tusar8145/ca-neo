// src/components/FileUpload.js
import React, {  useRef, useState } from 'react';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import i18next from 'i18next';
import en from '../i18n/en';
import ja from '../i18n/ja';
import { useTranslation } from 'react-i18next';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

const FileUpload = (props) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const [loading_pod,setloading_pod]  = useState(0);
  const [img_col, setimg_col] = useState(null);

  const onFileChange = function (e) {
    e.preventDefault();
    console.log(55555)
    setimg_col(e.target.files)
  }

  const fileInputRef = useRef(null);
  const { t } = useTranslation('shared-components');

  const doSomething = function (e) {
      
    e.preventDefault();
  
  console.log(11111111)
  
    var formData = new FormData();
  
    const fileInput = document.querySelector('input[type="file"]'); 
   
  
  for (let y=0; y<fileInput.files.length; y++){
    //console.log(fileInput.files[y],'okk')
    formData.append(`file-${y}`, fileInput.files[y], fileInput.files[y].name);
    //console.log(formData,'formData')
  }
  
  
  
   
  
  setloading_pod(1)
        fetch(apiConfig.base_url+props.api+'?id='+props.id+'&&counts='+fileInput.files.length, {
            method: 'POST',
            body: formData,
        })
  
        .then((res) => res.json())
        .then((data) => {
            setloading_pod(0)
            console.log(data, '1')
            props.complete(true)
        })
        .catch((err) => console.error(err, '2'));  

        fileInputRef.current.value = '';
  }

  




  return (
    <div> 
      <form onSubmit={doSomething} style={{ marginTop: " 10px" }}>
        {/*loading_pod == 1 && <ReactLoading type="bubbles" color="blue" />*/}

        <div className=" "style={{"margin-bottom": "30px", "margin-top": "30px", "padding": "40px", "border": "1px dashed gray" }}>
          <input  ref={fileInputRef}  accept=".png,.jpg,.jpeg" onChange={onFileChange} type="file" name="imgCollection" multiple />
        </div>

        <div className=" " style={{ marginLeft: "15%" }}>
          {loading_pod == 1 ?
            <>
              <Button disabled color="primary" type="submit" tabIndex={-1} data-id={1} variant="contained" > <Icon>upload</Icon> <p sx={{ pl: 1, textTransform: "capitalize" }}>{t('Upload')} </p> </Button>
            </>
            : <>
              <Button color="primary" type="submit" tabIndex={-1} data-id={1} variant="contained" > <Icon>upload</Icon> <p sx={{ pl: 1, textTransform: "capitalize" }}>{t('Upload')} </p> </Button>
            </>
          }
        </div>
      </form>
    </div>
  );
};

export default FileUpload;
