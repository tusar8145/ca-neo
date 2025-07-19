import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import CIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
/**
 * The SummaryWidget widget.
 */
function SummaryWidget(props) {
	const navigate = useNavigate();
	const { t } = useTranslation('shared-components');
	return (
		<paper className="flex flex-col flex-auto hover:shadow rounded-2xl overflow-hidden cursor-pointer transition ease-in-out   bg-white hover:-translate-y-1 hover:scale-104 hover:bg-white-50 duration-300" style={{"height":"100%", "border-radius":"15px"}}
		   onClick={() => {
			//props.patientDetails(data)
				if(props.view==1 ){
					if(props.link){
						navigate('/hospital/dpc-analysis?hospitalization-days='+props.link);
					}
					
					if(props.type){
						navigate('/hospital/dpc-analysis?type='+props.type);
					}
				}
				if(props.admin==1 ){
					navigate('/hospital-management');
				}
			}}
		>
	 
			
			<div class="grid grid-cols-2 gap-20 p-32">
				<div className="text-center p-1">
					<Typography className="text-3xl font-medium text-blue-600 dark:text-blue-500" style={{ color: props.color }}>
						{props.title}
					</Typography>

				</div>
				<div className="text-center bg-slate-300" style={{ "background-color": "rgb(103 14 166 / 5%)", "text-shadow": ".5px .5px 1px #000000"}}>
					<Typography className="text-7xl sm:text-8xl font-bold tracking-tight leading-none text-blue-500" style={{ color: props.color }}>
						{props.count}
					</Typography>
				</div>
			</div>

 

 
		</paper>
	);
}

export default memo(SummaryWidget);
