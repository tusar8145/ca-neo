import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import SignInConfig from '../main/sign-in/SignInConfig';
import SignUpConfig from '../main/sign-up/SignUpConfig';
import SignOutConfig from '../main/sign-out/SignOutConfig';
import Error404Page from '../main/404/Error404Page';
import DashboardConfig from '../main/dashboard/DashboardConfig';
 
import HospitalConfig from '../main/admin/hospital-management/HospitalConfig';
import StaffConfig from '../main/staff-management/StaffConfig';

 
import ProfileConfig from '../main/profile/ProfileConfig';

//new
import ProjectsConfig from '../main/projects/ProjectsConfig';
import CertificatesConfig from '../main/certificates/CertificatesConfig';
import UserActivityConfig from '../main/user-activity/UserActivityConfig';
import CertificatesExpiringConfig from '../main/certificates-expiring/CertificatesExpiringConfig';
import ApiDocumentsConfig from '../main/apidocuments/ApiDocumentsConfig';

const routeConfigs = [DashboardConfig,ProjectsConfig, CertificatesConfig, UserActivityConfig,CertificatesExpiringConfig,ApiDocumentsConfig,
	 SignOutConfig, SignInConfig, SignUpConfig, HospitalConfig, StaffConfig, ProfileConfig ];
/**
 * The routes of the application.
 */
const routes = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
	{
		path: '/',
		element: <Navigate to="/dashboard" />,
		auth: settingsConfig.defaultAuth
	},
	{
		path: 'loading',
		element: <FuseLoading />
	},
	{
		path: '404',
		element: <Error404Page />
	},
	{
		path: '*',
		element: <Navigate to="404" />
	}
];
export default routes;
