import i18next from 'i18next';
import { lazy } from 'react';
import en from './i18n/en';
import ja from './i18n/ja';
import {authRoles} from '../../auth';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);
const Profile = lazy(() => import('./Profile'));
/**
 * The Profile page config.
 */
const DashboardConfig = {
	settings: {
		layout: {}
	},
	auth    : authRoles.common,
	routes: [
		{
			path: 'profile',
			element: <Profile />
		}
	]
};
export default DashboardConfig;
