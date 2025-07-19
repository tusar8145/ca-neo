import i18next from 'i18next';
import { lazy } from 'react';
import en from './i18n/en';
import ja from './i18n/ja';
import {authRoles} from '../../../auth';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);
const Hospital = lazy(() => import('./Hospital'));
/**
 * The Hospital page config.
 */
const HospitalConfig = {
	settings: {
		layout: {}
	},
	auth    : authRoles.admin,
	routes: [
		{
			path: 'hospital-management',
			element: <Hospital />
		}
	]
};
export default HospitalConfig;
