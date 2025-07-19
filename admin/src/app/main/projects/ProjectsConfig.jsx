//D:\Projects\ca-neo\admin\src\app\main\projects\ProjectsConfig.jsx
import i18next from 'i18next';
import { lazy } from 'react';
import en from '../../shared-components/i18n/en';
import ja from '../../shared-components/i18n/ja';
 

import {authRoles} from '../../auth';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);
 


const Projects = lazy(() => import('./Projects'));
/**
 * The Example2 page config.
 */
const ProjectsConfig = {
	settings: {
		layout: {}
	},
	auth    : authRoles.common,
	routes: [
		{
			path: 'projects',
			element: <Projects />
		}
	]
};
export default ProjectsConfig;
