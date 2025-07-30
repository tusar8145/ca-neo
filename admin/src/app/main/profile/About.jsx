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
import { useTranslation } from 'react-i18next';
/**
 * The about tab.
 */
function AboutTab() {
 
    const { t } = useTranslation('shared-components');
	/*if (isLoading) {
		return <FuseLoading />;
	}*/

    const user = useAppSelector(selectUser);

	const { general, work, contact, groups, friends } = {
         
        "general": {
          "gender": "Male",
          "name":user.data?.displayName,
          "birthday": "February 30th, 1974",
          "locations": [
            "London, UK",
            "New York, USA"
          ],
          "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget pharetra felis, sed ullamcorper dui. Sed et elementum neque. Vestibulum pellente viverra ultrices. Etiam justo augue, vehicula ac gravida a, interdum sit amet nisl. Integer vitae nisi id nibh dictum mollis in vitae tortor."
        },
        "work": {
          "HospitalName": user.hospital?.name,
          "Logo": user.hospital?.logo,
        },
        "contact": {
          "address": "Ut pharetra luctus est quis sodales. Duis nisi tortor, bibendum eget tincidunt, aliquam ac elit. Mauris nec euismod odio.",
          "tel": [
            user.data?.phone,
            
          ],
          "websites": [
            "withinpixels.com"
          ],
          "emails": [
            user.data?.email,
          ]
        },
        "groups": [
          {
            "id": "1",
            "name": "Android",
            "category": "Technology",
            "members": "1.856.546"
          },
          {
            "id": "2",
            "name": "Google",
            "category": "Web",
            "members": "1.226.121"
          },
          {
            "id": "3",
            "name": "Fallout",
            "category": "Games",
            "members": "526.142"
          }
        ],
        "friends": [
          {
            "id": "1",
            "name": "Garry Newman",
            "avatar": "assets/images/avatars/male-11.jpg"
          },
          {
            "id": "2",
            "name": "Carl Henderson",
            "avatar": "assets/images/avatars/male-12.jpg"
          },
          {
            "id": "3",
            "name": "Jane Dean",
            "avatar": "assets/images/avatars/female-11.jpg"
          },
          {
            "id": "4",
            "name": "Garry Arnold",
            "avatar": "assets/images/avatars/male-13.jpg"
          },
          {
            "id": "5",
            "name": "Vincent Munoz",
            "avatar": "assets/images/avatars/male-14.jpg"
          },
          {
            "id": "6",
            "name": "Alice Freeman",
            "avatar": "assets/images/avatars/female-12.jpg"
          },
          {
            "id": "7",
            "name": "Andrew Green",
            "avatar": "assets/images/avatars/male-16.jpg"
          }
        ]
     
}
    
    
    
    ;
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
								
                                {t('General Information')}
    
							</Typography>
						</div>

						<CardContent className="px-32 py-24">
							<div className="mb-24">
								<Typography className="font-semibold mb-4 text-15">{t('Name')}</Typography>
								<Typography>{general.name}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-semibold mb-4 text-15">{t('Phone')}</Typography>

								{contact.tel.map((tel) => (
									<div
										className="flex items-center"
										key={tel}
									>
										<Typography>{tel}</Typography>
									</div>
								))}
							</div>
 

							<div className="mb-24">
								<Typography className="font-semibold mb-4 text-15">{t('Emails')}</Typography>

								{contact.emails.map((email) => (
									<div
										className="flex items-center"
										key={email}
									>
										<Typography>{email}</Typography>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

 
{user.role != 'admin' &&

 <Card
						component={motion.div}
						variants={item}
						className="w-full mb-32"
					>
						<div className="px-32 pt-24">
							<Typography className="text-2xl font-semibold leading-tight">{t('Client Info')}</Typography>
						</div>

						<CardContent className="px-32 py-24">
							<div className="mb-24">
								<Typography className="font-semibold mb-4 text-15">{t('Client Name')}</Typography>
								<Typography>{work.HospitalName}</Typography>
							</div>

							<div className="mb-24">
								<Typography className="font-semibold mb-4 text-15">{t('Logo')}</Typography>
 
                                <img
                                    src={apiConfig.base_url + 'issue/image/' + user?.hospital?.logo}
                                    alt="beach"
                                    
                                    style={{
                                        Width: '16px',
                                        'background':"gray"
                                    
                                    }}
                                    className="rounded-6"
                                />	

								 
							</div>
 
						</CardContent>
					</Card>
}
                   



				</div>

			</div>
		</motion.div>
	);
}

export default AboutTab;
