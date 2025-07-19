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
import { motion } from 'framer-motion';

import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
 
import en from '../i18n/en';
import ja from '../i18n/ja';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

 

/**
 * The help center support.
 */
function SearchInput(props) {
 

	function onSubmit(data) {
		// eslint-disable-next-line no-console
		console.log(data);
	}
 
 
    const { t } = useTranslation('shared-components');
	 
    const [message, setMessage] = useState("SearchInput");
	const [searchText, setSearchText] = useState("");

    const readUploadFile = (e) => { e.preventDefault(); 
        try {
 
        }
        catch(err) {
            setMessage(t("No data found!"))
            console.log('errro',err)
        }
      }

	  //globalFilter
	  const handleSubmit = (event) => {
		event.preventDefault();
		let pre_t=searchText
		setSearchText(null)
		props.globalFilter(pre_t)
		
	  }

	return (
		<div className="flex flex-1 items-center mt-16  mb-24 pb-24 w-full border-b-1">
			
				<Box
					component={motion.div}
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					className={"flex flex-1 w-9/12 sm:w-9/12 items-center px-16 border-1 rounded-full" + (props.textUpload == 'Upload' ? " disabled " : " ")}
				>
					<FuseSvgIcon
						color="action"
						size={20}
					>
						heroicons-outline:search
					</FuseSvgIcon>
					<form onSubmit={handleSubmit}>
						<Input
							disabled={props.textUpload === 'Upload' ? true : false}
							placeholder={t(props.txt)}
							className=  {"flex flex-1 px-16 fullWidth " }
							disableUnderline
							 
							value={searchText}
							 
							inputProps={{
								'aria-label': 'Search'
							}}
							onChange={(ev) =>{setSearchText(ev.target.value)}}
						/>
					</form>
				</Box>
			
		<Button
			className="mx-8 md:ml-72"
			variant="contained"
			color="secondary"
			to="new/edit"
			onClick={() =>{
				props.enableUpload(1)
			}}
		>
			<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
			<span className="hidden sm:flex mx-8">{t(props.textUpload)}</span>
		</Button>
	</div>
	);
}

export default SearchInput;
