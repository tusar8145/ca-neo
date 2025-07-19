// D:\Projects\ca-neo\admin\src\app\main\certificates\CertificatesConfig.jsx
import i18next from 'i18next';
import { lazy } from 'react';
import en from '../../shared-components/i18n/en';
import ja from '../../shared-components/i18n/ja';

import { authRoles } from '../../auth';

// Add translations for certificates
i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

const Certificates = lazy(() => import('./Certificates'));

/**
 * The Certificates page config.
 */
const CertificatesConfig = {
    settings: {
        layout: {
            config: {
                // Custom layout configuration if needed
            }
        }
    },
    auth: authRoles.common, // Or specific role like authRoles.admin if needed
    routes: [
        {
            path: 'certificates',
            element: <Certificates />
        },
        // Optional nested routes if needed
        // {
        //     path: 'certificates/:serial',
        //     element: <CertificateDetails />
        // }
    ]
};

export default CertificatesConfig;