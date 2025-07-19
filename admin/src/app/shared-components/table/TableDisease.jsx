import { useMemo,useEffect, useState } from 'react';
import {  MaterialReactTable,  useMaterialReactTable, } from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import {  QueryClient,  QueryClientProvider,  useMutation,  useQuery,  useQueryClient, } from '@tanstack/react-query';
 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { lazy } from 'react';
import apiConfig from '../../configs/apiConfig';
import i18next from 'i18next';
import en from '../i18n/en';
import ja from '../i18n/ja';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import '../../../styles/custom-basic.css';
i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);




const Example = (props) => {

  let tableName=props.tableName
  let keyConfig=props.keyConfig

  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, //customize the default page size
  });
  

  const { hospital, toggleHospital } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!data?.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      
 
      try {
        let h_id = ""
        if(hospital){   h_id=hospital?.id  }
 
        let new_columnFilters = []
        let f_columnFilters = null
        let f_globalFilters = null

        let get_global_filter = globalFilter
        if (props.globalFilter) {
          get_global_filter = props.globalFilter
        }
/*------------------------------------Start Filter-----------------------------------*/
        let order=""
  



        let tkeys = [];
        let tvalues = [];
        let ttype = [];
          for(let j=0 ; j<keyConfig.length;j++){
              let new_key = keyConfig[j]
              
              let gen=null
                for (let k = 0; k < columnFilters.length; k++) {
                  let new_ = columnFilters[k]

                  if(new_key.type=='Integer'){
                     if (new_.id == new_key.name) { gen = parseInt(new_.value); }
                  }else{
                      if (new_.id == new_key.name) { gen = new_.value; }
                  }

                  order=new_key.name
                  
                } 
            tkeys[j]=new_key.name
            tvalues[j]=gen
            ttype[j]=new_key.type
          }


          let dynamicObject = {};
          // Create object with dynamic keys
          tkeys.forEach((key, index) => {
              if(tvalues[index]){
                if(ttype[index]=='Integer'){
                    dynamicObject[key] = tvalues[index];
                }else{ 
                  dynamicObject[key] = {contains:tvalues[index]};
                }
                
              }
          });
 
 

        let filter = {
          f_columnFilters: dynamicObject,
          globalFilter: get_global_filter,
          f_globalFilters: f_globalFilters,
          sorting: sorting
        }
/*------------------------------------End Filter-----------------------------------*/


        const response = await axios.post(apiConfig.tableList + tableName+'/list?child=1&&hospital=' + h_id + '&&take=' + pagination.pageSize + '&&skip=' + (10 * pagination.pageIndex)+ '&&order='+order, { filter });
        let new_data = []
        let get_data = response.data.data


        for (let k = 0; k < get_data?.length; k++) {
          let this_d = get_data[k]
 
          if(this_d?.childs?.length>0){
            this_d=this_d.childs[0]
          } 

          new_data.push({
            icd: this_d.icd,
            name: this_d.name,
            receipt: this_d.receipt.toString(),
            id: this_d.id
          })
        }

 
        setData(new_data);


        const row = await axios.post(apiConfig.tableCount + tableName+'/count?child=1&&hospital=' + h_id, { filter });
        props.sendCountToSubParent(row.data.count._count.id)
        setRowCount(row.data.count._count.id);



      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    props.globalFilter,
    isRefetching,
    hospital
  ]);

  const { t } = useTranslation('shared-components');
  const [validationErrors, setValidationErrors] = useState({});


  const col_key=[]
  for(let j=0 ; j<keyConfig.length;j++){
    let new_key = keyConfig[j]
    col_key.push({
      accessorKey: new_key.name,
      header: t(new_key.header),
      ...new_key.edit==1?{enableEditing: true,}:{enableEditing: false,},
      size: 20,
      muiEditTextFieldProps: {
        required: true,
        error: !!validationErrors[new_key.name],
        helperText: validationErrors[new_key.name],
        //remove any previous validation errors when illness focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
 
          }),
        //optionally add validation checking for onBlur or onChange
      },
    })
  }

  console.log(col_key,'col_key')

  const columns = useMemo(
    () => col_key, 
    [validationErrors],
  );


  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =  useUpdateUser();


  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =   useDeleteUser();


  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    if (window.confirm(t('Are you sure to save?'))) {
      console.log(1,hospital?.id)
      const newValidationErrors = validateUser(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log(2)
        setValidationErrors(newValidationErrors);
        return;
      }
      console.log(3)
      setValidationErrors({});
      await updateUser({...values,hospital_id:hospital?.id || null});
      table.setEditingRow(null); //exit editing mode
    }
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm(t('Are you sure you want to delete this?'))) {
      deleteUser({...row.original,hospital_id:hospital?.id || null});
    }
  };



  
  const table = useMaterialReactTable({
    columns,
    data,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    /**/enablePagination: true,
 
    initialState: { showColumnFilters: true },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderRowActions: ({ row, table }) => (
      <div sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title={t("Edit")}>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() =>{ 
            openDeleteConfirmModal(row)
            setIsRefetching(true)}
          }>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    ),
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });




  function validateUser(illness) {
    let tkeys = [];
    let ttype = [];
    let trequired = [];
      for(let j=0 ; j<keyConfig.length;j++){
          let new_key = keyConfig[j]
        tkeys[j]=new_key.name
        ttype[j]=new_key.type
        trequired[j]=new_key.validate.required
      }
  
  
      let dynamicObject = {};
      // Create object with dynamic keys
      //tkeys.forEach((key, index) => {
        for(let j=0 ; j<tkeys.length;j++){
          let key=tkeys[j]
          let index=j
          if(trequired[index]==1){
  
            if(ttype[index]=='String'){
                if(illness[key].length>0){
                  dynamicObject[key] = ''
                }else{
                  dynamicObject[key] = 'This field is Required'
                }
            }else{
              if(illness[key]>0){
                dynamicObject[key] = ''
              }else{
                dynamicObject[key] = 'This field is Required'
              }
            }
  
          }
  
        }
     // });
  
      return dynamicObject
  
  }


//UPDATE hook (put illness in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (illness) => {
      const response = await axios.post(apiConfig.tableUpdate+tableName+'/update',{...illness});
      return Promise.resolve();
    },
  });
}



//DELETE hook (delete illness in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (illnessId) => {
      //send api update request here
      const response = await axios.post(apiConfig.tableRemove+tableName+'/remove',{receipt:illnessId.receipt,hospital_id:illnessId.hospital_id});
      return Promise.resolve();
    },
  });
}




  return <MaterialReactTable table={table} />;
};

 
 



const queryClient = new QueryClient();

const TableDisease = (props) => { 
	function handleCountDataFromSubChild(data) {
		console.log(data,'county')
    props.sendCountToParent(data)
	}


  return (
      <QueryClientProvider client={queryClient}>
      <Example    sendCountToSubParent={handleCountDataFromSubChild} globalFilter={props.globalFilter} 
      tableName={props.tableName} keyConfig={props.keyConfig}/>
    </QueryClientProvider>
  )

};

export default TableDisease;

const validateRequired = (value) => !!value.toString().length;
const validateRequiredInt = (value) => value>0;
const validatereceipt = (receipt) =>  !!receipt.length &&   receipt   .toLowerCase()  .match(   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,);


