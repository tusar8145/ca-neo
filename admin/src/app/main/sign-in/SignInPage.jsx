import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CardContent from '@mui/material/CardContent';
import _ from '@lodash';
import Alert from '@mui/material/Alert';
import JwtLoginTab from './tabs/JwtSignInTab';
import FirebaseSignInTab from './tabs/FirebaseSignInTab';
import AwsSignInTab from './tabs/AwsSignInTab';
import backgroundImage from './background.jpg';
import logo from './logo.svg';
import apiConfig from 'src/app/configs/apiConfig';

const tabs = [
	{
		id: 'jwt',
		title: 'JWT',
		logo: 'assets/images/logo/jwt.svg',
		logoClass: 'h-40 p-4 bg-black rounded-12'
	},
	{
		id: 'firebase',
		title: 'Firebase',
		logo: 'assets/images/logo/firebase.svg',
		logoClass: 'h-40'
	},
	{
		id: 'aws',
		title: 'AWS',
		logo: 'assets/images/logo/aws-amplify.svg',
		logoClass: 'h-40'
	}
];

function SignInPage() {
	const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

	useEffect(() => {
		// Create hidden iframe to check backend connection
		const iframe = document.createElement('iframe');
		iframe.src = `${apiConfig.baseUrl}/connection-test`;
		//iframe.style.display = 'none';
		document.body.appendChild(iframe);
		
		// Clean up after 5 seconds
		const timer = setTimeout(() => {
			document.body.removeChild(iframe);
		}, 1000);

		return () => {
			clearTimeout(timer);
			if (document.body.contains(iframe)) {
				document.body.removeChild(iframe);
			}
		};
	}, []);

	function handleSelectTab(id) {
		setSelectedTabId(id);
	}

	return (
		<div className="flex min-w-0 flex-1 flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start"  
			style={{
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed', 
			}}>
			<Paper className="h-full w-full px-16 py-8 ltr:border-r-1 rtl:border-l-1 sm:h-auto sm:w-auto sm:rounded-2xl sm:p-48 sm:shadow md:flex md:h-full md:w-1/2 md:items-center md:justify-end md:rounded-none md:p-64 md:shadow-none"
				style={{ background: 'transparent', borderRightWidth: 0 }}>
				<CardContent className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320" style={{ background: 'white', borderRadius: '5%' }}>
					<div className="flex justify-center mt-20">
						<img
							className="w-96"
							src="assets/images/logo/logo.svg"
							alt="logo"
						/>
					</div>

					<Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
						Sign in
					</Typography>
					
					<div>
						{selectedTabId === 'jwt' && <JwtLoginTab />}
						{selectedTabId === 'firebase' && <FirebaseSignInTab />}
						{selectedTabId === 'aws' && <AwsSignInTab />}
					</div>
				</CardContent>
			</Paper>

			<Box
				className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
			>
				<svg
					className="pointer-events-none absolute inset-0"
					viewBox="0 0 960 540"
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMax slice"
					xmlns="http://www.w3.org/2000/svg"
				>
					<Box
						component="g"
						sx={{ color: 'primary.light' }}
						className="opacity-20"
						fill="none"
						stroke="currentColor"
						strokeWidth="100"
					>
						<circle
							r="234"
							cx="196"
							cy="23"
						/>
						<circle
							r="234"
							cx="790"
							cy="491"
						/>
					</Box>
				</svg>
				<Box
					component="svg"
					className="absolute -right-64 -top-64 opacity-20"
					sx={{ color: 'primary.light' }}
					viewBox="0 0 220 192"
					width="220px"
					height="192px"
					fill="none"
				>
					<defs>
						<pattern
							id="837c3e70-6c3a-44e6-8854-cc48c737b659"
							x="0"
							y="0"
							width="20"
							height="20"
							patternUnits="userSpaceOnUse"
						>
							<rect
								x="0"
								y="0"
								width="4"
								height="4"
								fill="currentColor"
							/>
						</pattern>
					</defs>
					<rect
						width="220"
						height="192"
						fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"
					/>
				</Box>

				<div className="relative z-10 w-full max-w-2xl">
					<div className="text-7xl font-bold leading-none text-gray-100">
						<div>Certificate Authority</div>
					</div>
				</div>
			</Box>
		</div>
	);
}

export default SignInPage;