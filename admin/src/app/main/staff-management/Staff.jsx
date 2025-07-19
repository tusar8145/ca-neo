import Button from '@mui/material/Button';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import Alert from '@mui/material/Alert';
import {createdAt} from '../../helpers/timeHelpers';
import {filterItemsEqual} from '../../helpers/commonHelpers';
import { motion } from 'framer-motion';
import  User  from '../../auth/user/user';
 
   
const Table = lazy(() => import('../../shared-components/table/TableStaff'));

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


 
 
function Staff() {

 
	let user=User()
 
	let tableName='admins'
	let headingTitle='Staff Management'
 
	let keyConfig=[
		{name:'photo', type:'String', header:'Photo', edit:0, validate:{required:1}, globalF:1},
		{name:'name', type:'String', header:'Name', edit:1, validate:{required:1}, globalF:1},
		{name:'phone', type:'String', header:'Phone',edit:1, validate:{required:0}, globalF:1},
		{name:'email', type:'String', header:'Email',edit:1, validate:{required:1}, globalF:1},
		{name:'password', type:'String', header:'Password',edit:1, validate:{required:0}, globalF:0},
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
	const { hospital, toggleStaff } = useTheme();
	const { refreshStaff, toggleRefreshHospital } = useTheme();

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

export default Staff;
