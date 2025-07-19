import i18next from 'i18next';
import { lazy } from 'react';
import en from '../../shared-components/i18n/en';
import ja from '../../shared-components/i18n/ja';
import {authRoles} from '../../auth';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);
const CertificatesExpiring = lazy(() => import('./CertificatesExpiring'));
/**
 * The CertificatesExpiring page config.
 */
const CertificatesExpiringConfig = {
	settings: {
		layout: {}
	},
	auth    : authRoles.common,
	routes: [
		{
			path: 'certificates-expiring',
			element: <CertificatesExpiring />
		}
	]
};
export default CertificatesExpiringConfig;


 
 
 