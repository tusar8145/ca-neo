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
import SummaryWidget from '../../shared-components/card/SummaryWidget';
import { motion } from 'framer-motion';
import  User  from '../../auth/user/user';
import { changeFuseTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { useAppDispatch } from 'app/store/hooks';
import Avatar from '@mui/material/Avatar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

import AboutTab from './About';
import PasswordTab from './Password';



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







 
function Profile() {
	let user=User()
 
	const [selectedTab, setSelectedTab] = useState(0);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	function handleTabChange(event, value) {
		setSelectedTab(value);
	}


	const { t } = useTranslation('shared-components');
	let tableName=''
	let headingTitle='Profile'
  
 
 

	const [loading, setLoading] = useState(false);
 
 
	const [successAlert, setSuccessAlert] = useState(null);
	const [failAlert, setFailAlert] = useState(null);
 
	const { theme, toggleTheme } = useTheme();
	const { hospital, toggleHospital } = useTheme();
	
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

	const [countHospital, setCountHospital] = useState(0);
	const [countAdmin, setCountAdmin] = useState(0);
	const [countAssistant, setCountAssistant] = useState(0);
	const [countStaff, setCountStaff] = useState(0);

	const [count3rd, setCount3rd] = useState(0);
	const [count7th, setCount7th] = useState(0);
	const [countAll, setCountAll] = useState(0);
	const [countDischarged, setCountDischarged] = useState(0);
	const [countWithC, setCountWithC] = useState(0);


	async function dashboardCount(){
		let data = await axios.post(apiConfig.countAdminGroup, {});
		let getData=data.data.count

		for(let x=0; x<getData.length; x++){
			let this_=getData[x]

			if(this_.role=='admin'){setCountAdmin(this_._count.id)}
			if(this_.role=='hospitalAssistant'){setCountAssistant(this_._count.id)}
			if(this_.role=='staff'){setCountStaff(this_._count.id)}
 	
		}


		 data = await axios.post(apiConfig.countHospital, {});
		 getData=data.data.count._count.id
		 setCountHospital(getData)
		  
	}

	async function dashboardPatientCount(hospital){
		let data = await axios.post(apiConfig.PatientDashboardCount, {hospital_id:hospital.id});
		let getData=data.data.data
 
		setCount3rd(getData.total_3_hospitalized_count)
		setCount7th(getData.total_7_hospitalized_count)
		setCountAll(getData.total_hospitalized_count)
		setCountDischarged(getData.total_discharge_count)
 
	}
	 
	useEffect(() => {  
		if(user?.role!='admin'){
			dashboardPatientCount(hospital)
		}else{
			dashboardCount()
		}
	}, [user,hospital]);







	return (
		<Root
			header={
				<div className="flex flex-col w-full">
					<img
						className="h-160 lg:h-320 object-cover w-full"
						src="assets/images/pages/profile/cover.jpg"
						alt="Profile Cover"
					/>

					<div className="flex flex-col flex-0 lg:flex-row items-center max-w-5xl w-full mx-auto px-32 lg:h-72">
						<div className="-mt-96 lg:-mt-88 rounded-full">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1, transition: { delay: 0.1 } }}
							>
								<Avatar
									sx={{ borderColor: 'background.paper' }}
									className="w-128 h-128 border-4"
									src={user.data?.photoURL} 
									alt="User avatar"
								/>
							</motion.div>
						</div>

						<div className="flex flex-col items-center lg:items-start mt-16 lg:mt-0 lg:ml-32">
							<Typography className="text-lg font-bold leading-none">{user.data?.displayName}</Typography>
							<Typography color="text.secondary">{user.role}</Typography>
							
						</div>

						<div className="hidden lg:flex h-32 mx-32 border-l-2" />

		 

						<div className="flex flex-1 justify-end my-16 lg:my-0">
							<Tabs
								value={selectedTab}
								onChange={handleTabChange}
								indicatorColor="primary"
								textColor="inherit"
								variant="scrollable"
								scrollButtons={false}
								className="-mx-4 min-h-40"
								classes={{ indicator: 'flex justify-center bg-transparent w-full h-full' }}
								TabIndicatorProps={{
									children: (
										<Box
											sx={{ bgcolor: 'text.disabled' }}
											className="w-full h-full rounded-full opacity-20"
										/>
									)
								}}
							>
					 
								<Tab
									className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12 "
									disableRipple
									label={t("About")}
								/>
								<Tab
									className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12 "
									disableRipple
									label={t("Update Password")}
								/>
							</Tabs>
						</div>
					</div>
				</div>
			}
			content={
				<div className="flex flex-auto justify-center w-full max-w-5xl mx-auto p-24 sm:p-32">
 
{selectedTab==0?
<>
 
<AboutTab /> 
 
</>:
<>
<PasswordTab/>
</>}




				 
				</div>
			}
			scroll={isMobile ? 'normal' : 'page'}
	/>

	);
}

export default Profile;
