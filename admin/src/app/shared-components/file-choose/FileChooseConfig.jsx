import i18next from 'i18next';
import { lazy } from 'react';
import en from '../i18n/en';
import tr from '../i18n/tr';
import ar from '../i18n/ar';
import ja from '../i18n/ja';

i18next.addResourceBundle('en', 'fileChoosePage', en);
i18next.addResourceBundle('tr', 'fileChoosePage', tr);
i18next.addResourceBundle('ar', 'fileChoosePage', ar);
i18next.addResourceBundle('ja', 'fileChoosePage', ja);
const FileChoose = lazy(() => import('./FileChoose'));
/**
 * The Example page config.
 */
const ExampleConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'fileChoose',
			element: <Example />
		}
	]
};
export default ExampleConfig;
