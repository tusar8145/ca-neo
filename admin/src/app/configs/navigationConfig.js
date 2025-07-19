import i18next from 'i18next';
import en from './navigation-i18n/en';
import ja from './navigation-i18n/ja';
import { authRoles } from '../auth';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('ja', 'navigation', ja);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */

const navigationConfig = [
  // Dashboard Section
  {
    id: 'dashboard',
    title: 'Dashboard',
    translate: 'Dashboard',
    type: 'item',
    icon: 'heroicons-outline:home',
    auth: authRoles.common,
    url: 'dashboard',
    exact: true
  },

  // Projects Section
  {
    id: 'projects',
    title: 'Projects',
    translate: 'Projects',
    type: 'item',
    icon: 'heroicons-outline:folder',
    auth: authRoles.common,
    url: 'projects'
  },

  // Certificate Management Section
  {
    id: 'certificate-management',
    title: 'Certificate Management',
    translate: 'CertificateManage',
    type: 'collapse',
    icon: 'heroicons-outline:lock-closed',
    auth: authRoles.common,
    children: [
      {
        id: 'certificates',
        title: 'Certificates',
        translate: 'Certificates',
        type: 'item',
        icon: 'heroicons-outline:document-text',
        url: 'certificates'
      },
	    {
        id: 'certificates-expiring',
        title: 'Expired Certificates',
        translate: 'CertificatesExpering',
        type: 'item',
        icon: 'heroicons-outline:document-text',
        url: 'certificates-expiring'
      },      
	  {
        id: 'certificate-logs',
        title: 'Audit Logs',
        translate: 'AuditLogs',
        type: 'item',
        icon: 'heroicons-outline:clipboard-list',
        url: 'user-activity'
      },
    ]
  },

  // API Section


  // Healthcare Management Section
  {
    id: 'healthcare-management',
    title: 'Healthcare Manage',
    translate: 'HealthcareManage',
    type: 'collapse',
    icon: 'heroicons-outline:plus-circle',
    auth: authRoles.common,
    children: [
      {
        id: 'hospitals',
        title: 'Hospitals',
        translate: 'Hospitals',
        type: 'item',
        icon: 'heroicons-outline:plus-circle',
        url: 'hospital-management',
		auth: authRoles.admin
      },
      {
        id: 'staff',
        title: 'Staff',
        translate: 'Staff',
        type: 'item',
        icon: 'heroicons-outline:users',
    	url: 'staff-management',
        auth: authRoles.hospitalAssistant
      }
    ]
  },
  {
    id: 'api',
    title: 'API Documents',
    translate: 'APIManagement',
    type: 'item',
    icon: 'heroicons-outline:key',
    auth: authRoles.common,
    url: 'api-documents'
  }, 
  // System Section
  /*{
    id: 'system',
    title: 'System',
    translate: 'System',
    type: 'collapse',
    icon: 'heroicons-outline:cog',
    auth: authRoles.common,
    children: [
      {
        id: 'settings',
        title: 'Settings',
        translate: 'Settings',
        type: 'item',
        icon: 'heroicons-outline:cog',
        url: 'system/settings'
      },
      {
        id: 'documentation',
        title: 'Documentation',
        translate: 'Documentation',
        type: 'item',
        icon: 'heroicons-outline:book-open',
        url: 'system/documentation',
        auth: authRoles.common
      }
    ]
  }*/
];

/*const navigationConfig = [
  // Dashboard (unchanged URL)
  {
    id: 'dashboard',
    title: 'Dashboard',
    translate: 'Dashboard',
    type: 'item',
    icon: 'material-outline:widgets',
    auth: authRoles.common,
    url: 'dashboard'
  },

  // Projects (unchanged URL)
  {
    id: 'projects',
    title: 'Projects',
    translate: 'Projects',
    type: 'item',
    icon: 'material-outline:widgets',
    auth: authRoles.common,
    url: 'projects'
  },

  // Certificate Section (unchanged URLs)
  {
    id: 'certificate',
    title: 'Certificate',
    translate: 'Certificate',
    type: 'collapse',
    icon: 'heroicons-outline:lock-closed',  // Updated icon
    auth: authRoles.common,
    children: [
      {
        id: 'certificates',
        title: 'Certificates',
        translate: 'Certificates',
        type: 'item',
        icon: 'heroicons-outline:document-text',  // Updated icon
        url: 'certificate/certificates'  // Original URL preserved
      },
      {
        id: 'log',
        title: 'Log',
        translate: 'Log',
        type: 'item',
        icon: 'heroicons-outline:clipboard-list',  // Updated icon
        url: 'certificate/log'  // Original URL preserved
      }
    ]
  },

  // API Key (unchanged URL)
  {
    id: 'api-key',
    title: 'API Key',
    translate: 'APIKey',
    type: 'item',
    icon: 'heroicons-outline:key',  // Updated icon
    auth: authRoles.common,
    url: 'apikey'
  },

  // Settings (unchanged URL)
  {
    id: 'settings',
    title: 'Settings',
    translate: 'Settings',
    type: 'item',
    icon: 'heroicons-outline:cog',  // Updated icon
    auth: authRoles.common,
    url: 'settings'
  },

  // Documentation (unchanged URL)
  {
    id: 'documentation',
    title: 'Documentation',
    translate: 'Documentation',
    type: 'item',
    icon: 'heroicons-outline:book-open',  // Updated icon
    auth: authRoles.common,
    url: 'documentation'
  },

  // Hospital Management (unchanged URL)
  {
    id: 'hospital-management',
    title: 'Hospital Management',
    translate: 'HospitalManagement',
    type: 'item',
    icon: 'heroicons-outline:building-hospital',  // Updated icon
    auth: authRoles.admin,
    url: 'hospital-management'
  },

  // Staff Management (unchanged URL)
  {
    id: 'staff-management',
    title: 'Staff Management',
    translate: 'StaffManagement',
    type: 'item',
    icon: 'heroicons-outline:users',  // Updated icon
    auth: authRoles.hospitalAssistant,
    url: 'staff-management'
  }
];*/
export default navigationConfig;
