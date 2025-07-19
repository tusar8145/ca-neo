let base_url= import.meta.env.VITE_BASE_URL
const apiConfig = {
    base_url:base_url,
    baseUrl:base_url,
    hospitalList:base_url+'crud/hospitals/list',

    illnessCreate:base_url+'crud/injuries/create',
    illnessUpdate:base_url+'crud/injuries/update',
    illnessCount:base_url+'crud/injuries/count',
	illnessList:base_url+'crud/injuries/list',
    illnessClear:base_url+'crud/injuries/remove-all',
    illnessRemove:base_url+'crud/injuries/remove',
        
    medicalPrCreate:base_url+'crud/medical_practices/create',
    medicalPrUpdate:base_url+'crud/medical_practices/update',
    medicalPrCount:base_url+'crud/medical_practices/count',
	medicalPrList:base_url+'crud/medical_practices/list',
    medicalPrClear:base_url+'crud/medical_practices/remove-all',
    medicalPrRemove:base_url+'crud/medical_practices/remove',

    medicineCreate:base_url+'crud/medicines/create',
    medicineUpdate:base_url+'crud/medicines/update',
    medicineCount:base_url+'crud/medicines/count',
	medicineList:base_url+'crud/medicines/list',
    medicineClear:base_url+'crud/medicines/remove-all',
    medicineRemove:base_url+'crud/medicines/remove',

    medicinalEfCreate:base_url+'crud/medicinal_efficacy/create',
    medicinalEfUpdate:base_url+'crud/medicinal_efficacy/update',
    medicinalEfCount:base_url+'crud/medicinal_efficacy/count',
	medicinalEfList:base_url+'crud/medicinal_efficacy/list',
    medicinalEfClear:base_url+'crud/medicinal_efficacy/remove-all',
    medicinalEfRemove:base_url+'crud/medicinal_efficacy/remove',

    tableCreate:base_url+'crud/',
    tableUpdate:base_url+'crud/',
    tableCount:base_url+'crud/',
	tableList:base_url+'crud/',
    tableClear:base_url+'crud/',
    tableRemove:base_url+'crud/',

    countAdminGroup:base_url+'crud/admins/count/role',
    countHospital:base_url+'crud/hospitals/count',

    hospitalManageList:base_url+'hospital-manage/list',
    hospitalManageCreate:base_url+'hospital-manage/create',
    hospitalManageRemove:base_url+'hospital-manage/remove',
    hospitalManageUpdate:base_url+'hospital-manage/update',
    hospitalManageLogo:base_url+'hospital-manage/logo',

    hospitalStaffManageListAssis:base_url+'hospital-staff-assistant-manage/list',

    hospitalStaffManageList:base_url+'hospital-staff-manage/list',
    hospitalStaffManageCreate:base_url+'hospital-staff-manage/create',
    hospitalStaffManageRemove:base_url+'hospital-staff-manage/remove',
    hospitalStaffManageUpdate:base_url+'hospital-staff-manage/update',
    hospitalStaffManageLogo:base_url+'hospital-staff-manage/logo',

    PatientDpcCreate:base_url+'patient/dpc-create',
    PatientDpcList:base_url+'patient/dpc-list',
    PatientDpcVerify:base_url+'patient/dpc-verify',
    PatientDpcUpdate:base_url+'patient/dpc-update',
    PatientDashboardCount:base_url+'patient/dashboard-count',
    PatientDpcUpdateCode:base_url+'patient/dpc-update-code',
    PatientDpcMeasure:base_url+'patient/dpc_measure',

    IssuePostIssue:base_url+'issue/post_issue',
    IssuePostIssueReply:base_url+'issue/post_issue_reply',
    IssueGetIssueReply:base_url+'issue/get_issue_reply',
    IssueGetIssue:base_url+'issue/get_issue',
    IssueUpdateIssues:base_url+'issue/update_issues',

    updatePassword:base_url+'admin/update_password',
    test:base_url+'crud/hospitals/list',
}
export default apiConfig;
