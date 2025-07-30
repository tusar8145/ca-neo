import i18next from 'i18next';
import { lazy } from 'react';
import en from './i18n/en';
import ja from './i18n/ja';
import {authRoles} from '../../auth';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);
const Staff = lazy(() => import('./Staff'));
/**
 * The Staff page config.
 */
const StaffConfig = {
	settings: {
		layout: {}
	},
	auth    : authRoles.admin,
	routes: [
		{
			path: 'staff-management',
			element: <Staff />
		}
	]
};
export default StaffConfig;
