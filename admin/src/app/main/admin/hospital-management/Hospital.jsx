import Button from '@mui/material/Button';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import axios from 'axios';
import apiConfig from '../../../configs/apiConfig';
import Alert from '@mui/material/Alert';
import {createdAt} from '../../../helpers/timeHelpers';
import {filterItemsEqual} from '../../../helpers/commonHelpers';
import { motion } from 'framer-motion';
import  User  from '../../../auth/user/user';
 
   
const Table = lazy(() => import('../../../shared-components/table/TableHospital'));

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));


 
 
function Hospital() {

 
	let user=User()
 
	let tableName='hospitals'
	let headingTitle='Client Management'
 
	let keyConfig=[
		{name:'logo', type:'String', header:'Logo',edit:0, validate:{required:0}, globalF:0},
		{name:'name', type:'String', header:'Name', edit:1, validate:{required:1}, globalF:1},
		{name:'address', type:'String', header:'Address',edit:1, validate:{required:1}, globalF:1},
		{name:'admin_name', type:'String', header:'Assistant Name',edit:1, validate:{required:1}, globalF:0},
		{name:'admin_phone', type:'String', header:'Assistant Phone',edit:1, validate:{required:0}, globalF:0},
		{name:'admin_email', type:'String', header:'Assistant Email',edit:1, validate:{required:1}, globalF:0},
		{name:'admin_password', type:'String', header:'Assistant Password',edit:1, validate:{required:0}, globalF:0},
		{name:'primary_color', type:'String', header:'Primary color (e.g. #155EEF)',edit:1, validate:{required:1}, globalF:1},

		{name:'creator', type:'String', header:'Created By',edit:0, validate:{required:0}, globalF:0},
		{name:'created_at', type:'String', header:'Created At',edit:0, validate:{required:0}, globalF:0},
		{name:'updated_at', type:'String', header:'Updated At',edit:0, validate:{required:0}, globalF:0},
		{name:'id', type:'Integer', header:'ID', edit:0, validate:{required:0}, globalF:0},

	]


	const { t } = useTranslation('shared-components');
 

	const [loading, setLoading] = useState(false);
 
 
	const [successAlert, setSuccessAlert] = useState(null);
	const [failAlert, setFailAlert] = useState(null);
 
	const { theme, toggleTheme } = useTheme();
	const { hospital, toggleHospital } = useTheme();
	const { refreshHospital, toggleRefreshHospital } = useTheme();

	const [globalFilter, setGlobalFilter] = useState(null);
	useEffect(() => {  toggleTheme(t(headingTitle))  }, [t(headingTitle)]);


	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};
	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	function handleCountDataFromChild(count) {
		console.log(count,'xxxx')
		if(refreshHospital==true){
			toggleRefreshHospital(false)
		}else{
			toggleRefreshHospital(true)
		}
		
	}

	return (
		<Root
			header={
				<div className="p-24 hidden-on-large">
					<h4>{t(headingTitle)} </h4>
				</div>
			}
			content={
				<div className="flex flex-col items-center p-24 sm:p-40 container">

 					
					{successAlert != null && <Alert severity="success">{t(successAlert)}.</Alert>}
					{failAlert != null && <Alert severity="error">{t(failAlert)}..</Alert>}

					<motion.div
							className="grid   gap-24 w-full min-w-0 py-24"
							variants={container}
							initial="hidden"
							animate="show"
						>
					<Table filter={{}} sendCountToParent={handleCountDataFromChild} globalFilter={globalFilter}   tableName={tableName} keyConfig={keyConfig}/>
					</motion.div>
				</div>
			}
	/>

	);
}

export default Hospital;
