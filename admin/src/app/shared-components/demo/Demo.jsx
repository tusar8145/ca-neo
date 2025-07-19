import { Icon, IconButton} from "@mui/material";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from 'react';
import '../../../styles/custom-basic.css';
import i18next from 'i18next';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';


import en from '../i18n/en';
import ja from '../i18n/ja';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

 

/**
 * The help center support.
 */
function Demo({ sendDataToParent }) {
 
	function onSubmit(data) {
		// eslint-disable-next-line no-console
		console.log(data);
	}
 
 
    const { t } = useTranslation('shared-components');
 
    const [message, setMessage] = useState("Demo");

    const readUploadFile = (e) => { e.preventDefault(); 
        try {
 
        }
        catch(err) {
            setMessage(t("No data found!"))
            console.log('errro',err)
        }
      }

	return (
		<div className="">
			<div className="flex flex-col">
				<div className="mt-32 sm:mt-48 p-24 pb-28 sm:p-40 sm:pb-28 ">
					<form
						 
						className="px-0 sm:px-24 items-center flex flex-col items-center"
					>
 
                        

           <Typography display={message} color="text.secondary" className=' text-center'>
								{message} 
						</Typography>
 
					</form>
				</div>
			</div>
		</div>
	);
}

export default Demo;
