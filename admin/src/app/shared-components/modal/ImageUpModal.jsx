import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import   { useRef } from 'react';
import apiConfig from '../../configs/apiConfig';
import axios from 'axios';
import FileUpload from '../file-upload/FileUpload'; 
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import en from '../i18n/en';
import ja from '../i18n/ja';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


export default function ImageUpModal(props) {
    const [open, setOpen] = React.useState(false);
    const [id, setId] = React.useState(props.data.original.id);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    
    function UploadComplete(para) {
      props.complete(true)
      handleClose()
    }

    const { t } = useTranslation('shared-components');

    return (<div>
 
      <Button component="label" onClick={handleOpen} style={{alignItems:"center", textAlign:"center"}} size="small" variant="text" startIcon={<CloudUploadIcon />}> {t('Change')} </Button>

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
   

          <div className="w-full mt-16 sm:col-span-3">
						<Typography className="text-2xl font-semibold tracking-tight leading-6">
            {t('Upload Logo')}  
						</Typography>
						<Typography
							className="font-medium tracking-tight mt-10"
							color="text.secondary"
						>
						 <i>{props.data.original.name}</i>
						</Typography>
					</div>
 

          <Typography id="modal-modal-description" className='text-center' sx={{ mt: 2 }}>
            
          
          <FileUpload id={id} complete={UploadComplete} api={props.api}/>

          {/*<Button component="label"  variant="contained" startIcon={<CloudUploadIcon />}>
              Choose file
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
    </Button>*/}


          </Typography>
        </Box>
      </Modal>
    </div>);
}