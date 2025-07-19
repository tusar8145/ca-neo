import { useMemo,useEffect, useState } from 'react';
import {   MRT_EditActionButtons, MaterialReactTable,  useMaterialReactTable, } from 'material-react-table';
import {Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip, } from '@mui/material';
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

import '../../../styles/custom-basic-less.css';
import '../../../styles/custom-basic.css';
import '../../../styles/custom-table.css';
import * as React from 'react';
import { styled } from '@mui/material/styles';
const ImageUpModal = lazy(() => import('../modal/ImageUpModal')); 

import AddIcon from '@mui/icons-material/Add';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);




const Example = (props) => {

  const dispatch = useAppDispatch();

 
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

  function UploadComplete(para) {
    setIsRefetching(true)
		
	}


  

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
  


       // if (columnFilters || get_global_filter) {
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
                  if(key=='created_at' || key=='updated_at'){
                    //dynamicObject[key] = {equals:tvalues[index]};
                  }else{
                    dynamicObject[key] = {contains:tvalues[index]};
                  }
                  
                }
                
              }
          });
 
 
/*--------------------------------------------------------------------------------------------*/
 
if(get_global_filter){
    let value_single=get_global_filter
 
  for(let j=0 ; j<keyConfig.length;j++){
    let new_key = keyConfig[j]
    
    let gen=null

    if(new_key.globalF==1){
        if(new_key.type=='Integer'){
             gen = parseInt(value_single); 
        }else{
             gen = value_single;  
        }      
    }

    if(gen){
      tkeys[j]=new_key.name
      tvalues[j]=gen
      ttype[j]=new_key.type
    }
      

}


  let dynamicObject2 = {};
  // Create object with dynamic keys
  tkeys.forEach((key, index) => {
      if(tvalues[index]){
        if(ttype[index]=='Integer'){
            dynamicObject2[key] = tvalues[index];
        }else{ 
          dynamicObject2[key] = {contains:tvalues[index]};
        }
      }
  });

  const originalArray = {...dynamicObject2};
  const convertedArray = Object.entries(originalArray).map(([key, value]) => ({ [key]: value }));

  f_globalFilters =  {  OR:convertedArray }
}

console.log(f_globalFilters,'f_globalFilters')
 

        //dynamic filter check
        
        let new_dynamicObject=dynamicObject
        if(new_dynamicObject.admin_name || new_dynamicObject.admin_email  || new_dynamicObject.admin_phone ){
         

            let admin_name = new_dynamicObject.admin_name
            let admin_email = new_dynamicObject.admin_email
            let admin_phone = new_dynamicObject.admin_phone

            
           

            let temp_name=null
            let temp_email=null
            let temp_phone=null

            

             if(admin_name){temp_name= { name: admin_name };       }
             if(admin_email){temp_email= { email: admin_email };   }
             if(admin_phone){temp_phone= { phone: admin_phone };   }

            

              let gen_admin={
              ...admin_name?{...temp_name}:{},
              ...admin_email?{...temp_email}:{},
              ...admin_phone?{...temp_phone}:{},
              }

             delete new_dynamicObject.admin_name
             delete new_dynamicObject.admin_email
             delete new_dynamicObject.admin_phone

            console.log(gen_admin,'dynamicObject')

             

           new_dynamicObject.admin=gen_admin
            /* console.log(gen_admin,'dynamicObje')*/
            //console.log(new_dynamicObject)


        }

         console.log(new_dynamicObject,'dynamicObject00')

        /*{
          "name": {
              "contains": "Tusar23"
          },
          "admin_name": {
              "contains": "Tusar"
          }
        }*/

        let filter = {
          f_columnFilters: dynamicObject,
          globalFilter: get_global_filter,
          f_globalFilters: f_globalFilters,
          sorting: sorting
        }

         
/*------------------------------------End Filter-----------------------------------*/

        const response = await axios.post(apiConfig.hospitalManageList +'?take=' + pagination.pageSize + '&&skip=' + (10 * pagination.pageIndex)+ '&&order='+order, { filter });
        let new_data = []
        let get_data = response.data.data
 
            let keys = [];
            let values = [];
 
              for(let j=0 ; j<keyConfig.length;j++){
                  let new_key = keyConfig[j]
                  keys[j]=new_key.name
                  values[j] = [];
                  for(let k=0; k<get_data?.length; k++){
                        
                          let ob=get_data[k]
                          
                          if(ob?.childs?.length>0){
                            ob=ob.childs[0]
                          } 
                      
                         values[j][k]=ob[new_key.name]
                  }
              }
    
    
            const result = values[0].map((_, index) => {
              let obj = {};
              keys.forEach((key, keyIndex) => {
                obj[key] = values[keyIndex][index];
              });
              return obj;
            });

 
        setData(result);


        const row = await axios.post(apiConfig.tableCount + tableName+'/count?' + h_id, { filter });
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


    if(j==0){
        col_key.push( 
          {
            accessorFn: (row) => ` `, //accessorFn used to join multiple data into a single cell
            id: 'logo', //id is still required when using accessorFn instead of accessorKey
            header: t('Logo'),
            ...new_key.edit==1?{enableEditing: true,}:{enableEditing: false, Edit: () => null,},

            enableEditing: false,
            required: false,
            size: 50,
            Cell: ({ renderedCellValue, row }) => (
              <> 
 
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <img
                  alt="avatar"
                  height={10}
                  src={row.original.logo}
                  loading="lazy"
                  style={{ borderRadius: '0%' }}
                />
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>     

                <ImageUpModal data={row}  api={'hospital-manage/logo'}  complete={UploadComplete}/>




              </>
             

            ),
          }
      )
    }else{
      col_key.push({
        accessorKey: new_key.name,
        header: t(new_key.header),
        
        ...new_key.edit==1?{enableEditing: true,}:{enableEditing: false, Edit: () => null,},
        size: 200,
         //disable editing on this column and hide it
        muiEditTextFieldProps: {
          ...new_key.validate.required==1?{required: true,}:{required: false,},
          error: !!validationErrors[new_key.name],
          helperText: validationErrors[new_key.name],
          //remove any previous validation errors when params focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      })
    }



  }



  
 
  const columns = useMemo(
    () => col_key, 
    [validationErrors],
  );

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();

  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =  useUpdateUser();


  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =   useDeleteUser();

  //CREATE action
  const handleCreateUser = async ({ values, table }) => {

    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
        if (window.confirm(t('Are you sure to create?'))) {
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  }
  };

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
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    /**/enablePagination: true,
 
    initialState: { showColumnFilters: true,

      columnVisibility: {
         'admin_password': false, //hide row expand column by default
      },

     },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,

    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    onEditingRowCancel: () => setValidationErrors({}),
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowSave: handleSaveUser,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t('Create')}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">{t('Edit Hospital')}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),


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

    renderTopToolbarCustomActions: ({ table }) => (
 
      <Button component="label" variant="contained" color="success"
      
      onClick={() => {
        table.setCreatingRow(true); //simplest way to open the create row modal with no default values
      }}
      startIcon={<AddIcon />}>
        {t('Create')}
     
    </Button>
    ),

    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      //send api update request here
      const response = await axios.post(apiConfig.hospitalManageCreate,{...user});
      //
      dispatch(showMessage({  message: t(response.data.message), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: response.data.success }))    
      if(response.data.success=='error'){  fetchData(); }else{  setIsRefetching(true); return Promise.resolve(); }
      //
      

      /*await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();*/
    },
    //client side optimistic update
    /*onMutate: (newUserInfo) => {
      queryClient.setQueryData(['users'], (prevUsers) => [
        ...prevUsers,
        {
          ...newUserInfo,
          id: (Math.random() + 1).toString(36).substring(7),
        },
      ]);
    },*/
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

function validateEmail(email) {
  // Regular expression for validating an email address
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
}

function is_hexadecimal(str)
{
 let regexp = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  
        if (regexp.test(str))
          {
            return true;
          }
        else
          {
            return false;
          }
}
 

  function validateUser(params) {
    let tkeys = [];
    let ttype = [];
    let tname = [];
    let trequired = [];
      for(let j=0 ; j<keyConfig.length;j++){
          let new_key = keyConfig[j]
        tkeys[j]=new_key.name
        ttype[j]=new_key.type
        tname[j]=new_key.name
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

                if(tname[j]=='admin_email'){ 

                  if (params[key].length > 0) {

                    if (validateEmail(params[key]) == true) {
                      dynamicObject[key] = ''
                    } else {
                      dynamicObject[key] = t('Invalid Email')
                    }

                  } else {
                    dynamicObject[key] = t('This field is Required')
                  }

                  



                }else if(tname[j]=='primary_color'){ 


                  if (params[key].length > 0) {

                    if (is_hexadecimal(params[key]) == true) {
                      dynamicObject[key] = ''
                    } else {
                      dynamicObject[key] = t('Invalid Primary color')
                    }

                  } else {
                    dynamicObject[key] = t('This field is Required')
                  }

                }else{

                      if(params[key].length>0){
                        dynamicObject[key] = ''
                      }else{
                        dynamicObject[key] = t('This field is Required')
                      }

                }

            }else{
              if(params[key]>0){
                dynamicObject[key] = ''
              }else{
                dynamicObject[key] = t('This field is Required')
              }
            }
  
          }
  
        }
     // });
  
      return dynamicObject
  
  }


//UPDATE hook (put params in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const response = await axios.post(apiConfig.hospitalManageUpdate,{...params});
      
      //
      dispatch(showMessage({  message: t(response.data.message), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: response.data.success }))
      if(response.data.success=='error'){  fetchData(); }else{  setIsRefetching(true);  }
      //

      return Promise.resolve();

    },
  });
}


//success



//DELETE hook (delete params in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (illnessId) => {
      //send api update request here
      console.log('reshereponse')
      const response = await axios.post(apiConfig.hospitalManageRemove,{...illnessId});

      dispatch(showMessage({  message: t(response.data.message), autoHideDuration: 2000, anchorOrigin: {  vertical: 'top',  horizontal: 'right' }, variant: response.data.success }))
      if(response.data.success=='error'){  fetchData(); }else{  setIsRefetching(true);  }
 
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


