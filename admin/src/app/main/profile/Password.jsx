import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useAppSelector } from 'app/store/hooks';
import { selectUserRole, selectUser } from '../../auth/user/store/userSlice';
import apiConfig from '../../configs/apiConfig';
import TextField from '@mui/material/TextField';
import { useEffect, useRef,  useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import axios from 'axios';

/**
 * The about tab.
 */
function PasswordTab() {
    const { t } = useTranslation('shared-components');
	const dispatch = useAppDispatch();
	/*if (isLoading) {
		return <FuseLoading />;
	}*/

    const user = useAppSelector(selectUser);
 

    const [error1, seterror1] = useState(0);
    const [error2, seterror2] = useState(0);
    const [error3, seterror3] = useState(0);

	const [c_password, setc_password] = useState('');
    const handlec_password = (event) => {  setc_password(event.target.value); };

    const [r1_password, setr1_password] = useState('');
    const handler1_password = (event) => {  setr1_password(event.target.value); };
    
    const [r2_password, setr2_password] = useState('');
    const handler2_password = (event) => {  setr2_password(event.target.value); };
    
	const HandleSubmit = async (event) => {
        if(c_password==''){seterror1(1)}
        if(r1_password==''){seterror2(1)}
        if(r2_password==''){seterror3(1)}

       if(c_password && r1_password && r2_password){
            if(r1_password != r2_password){
                dispatch(showMessage({  message: t("Password not match!"), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: 'error' }))    
            }
            else if(r1_password.length<6){
                dispatch(showMessage({  message: t("Password minimum 6 digit"), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: 'error' }))    
            }else{
                let response = await axios.post(apiConfig.updatePassword, {id:user.uid, old_password:c_password, password:r1_password });

                dispatch(showMessage({  message: t(response.data.message), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: response.data.success }))    
                if(response.data.success=='success'){
                    setc_password('')
                    setr1_password('')
                    setr2_password('')
                }else{



                }
            }
        }
    }


   
	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};
	const item = {
		hidden: { opacity: 0, y: 40 },
		show: { opacity: 1, y: 0 }
	};
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			className="w-full"
		>
			<div className="md:flex">
				<div className="flex flex-col flex-1 md:ltr:pr-32 md:rtl:pl-32">
					<Card
						component={motion.div}
						variants={item}
						className="w-full mb-32"
					>
						<div className="px-32 pt-24">
							<Typography className="text-2xl font-semibold leading-tight">
								{t('Update Password')}

    
							</Typography>
						</div>

						<CardContent className="px-32 py-24">
							<div className="mb-24">
                                <TextField fullWidth className="mt-20" type="password" name="c_password" id="standard-basic" value={c_password} onChange={handlec_password} label={t("Write current password")+'*'} />
								{c_password == '' && error1 == 1 && <p style={{ color: "red", marginTop: "1%", marginBottom: "4%" }}>{t('This field is required')}*</p>}

							</div>

							<div className="mb-24">

                            <TextField fullWidth className="mt-20" type="password" name="r1_password" id="standard-basic" value={r1_password} onChange={handler1_password} label={t("Write new password")+'*'} />
                            {r1_password == '' && error2 == 1 && <p style={{ color: "red", marginTop: "1%", marginBottom: "4%" }}>{t('This field is required')}*</p>}

								 
							</div>
 

							<div className="mb-24">
                            <TextField fullWidth className="mt-20" type="password" name="r2_password" id="standard-basic" value={r2_password} onChange={handler2_password} label={t("Retype new password")+'*'} />
                            {r2_password == '' && error3 == 1 && <p style={{ color: "red", marginTop: "1%", marginBottom: "4%" }}>{t('This field is required')}*</p>}

							 
							</div>

                            <div className="mb-24">
                            <Button color="secondary" data-id={1} onClick={HandleSubmit} variant="contained" style={{ marginTop: "3px" }}>  <span sx={{ pl: 1, textTransform: "capitalize" }}>{t("Submit")}</span>  </Button>


                            </div>
 
						</CardContent>
					</Card>

  
				</div>
 
			</div>
		</motion.div>
	);
}

export default PasswordTab;
