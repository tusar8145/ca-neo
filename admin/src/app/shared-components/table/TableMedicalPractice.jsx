import { useMemo,useEffect, useState } from 'react';
import {
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';

import en from '../i18n/en';
import ja from '../i18n/ja';

import i18next from 'i18next';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import '../../../styles/custom-basic.css';
import { useTheme } from '../../context/ThemeContext';

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

 


const Example = (props) => {

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
        if(hospital){
          h_id=hospital?.id
        }

       // console.log(row.data.count._count.id);

 
        let new_columnFilters = []
        let f_columnFilters = null
        let f_globalFilters = null

        let get_global_filter = globalFilter
        if (props.globalFilter) {
          get_global_filter = props.globalFilter
        }

        if (columnFilters || get_global_filter) {
          let class_, name, receipt, score = null
          for (let k = 0; k < columnFilters.length; k++) {
            let new_ = columnFilters[k]
            if (new_.id == 'class') { class_ = new_.value }
            if (new_.id == 'name') { name = new_.value }
            if (new_.id == 'receipt') { receipt = parseInt(new_.value) }
            if (new_.id == 'score') { score = parseInt(new_.value) }
            new_columnFilters.push({
              ...class_ ? { class:  {contains:class_} } : {},
              ...name ? { name:  {contains:name} } : {},
              ...receipt ? { receipt: receipt } : {},
              ...score ? { score: score } : {}
            })
          }

          f_globalFilters =
          {
            OR: [
              { class: {contains:get_global_filter} },
              { name: {contains:get_global_filter} },
              get_global_filter > 0 ? { receipt: parseInt(get_global_filter) } : {},
              get_global_filter > 0 ? { score: parseInt(score) } : {}

            ]
          }
        }

        if (new_columnFilters.length > 0) { f_columnFilters = new_columnFilters[new_columnFilters.length - 1] }


        let filter = {
          f_columnFilters: f_columnFilters,
          globalFilter: get_global_filter,
          f_globalFilters: f_globalFilters,
          sorting: sorting
        }



        const response = await axios.post(apiConfig.medicalPrList + '?hospital=' + h_id + '&&take=' + pagination.pageSize + '&&skip=' + (10 * pagination.pageIndex), { filter });
        let new_data = []
        let get_data = response.data.data


        /*for (let k = 0; k < get_data?.length; k++) {
          let this_d = get_data[k]
          new_data.push({
            icd: this_d.icd,
            name: this_d.name,
            receipt: this_d.receipt.toString(),
            id: this_d.id
          })
        }*/

 
        setData(get_data);


       // if (rowCount > 0 || columnFilters) { } else {
          const row = await axios.post(apiConfig.medicalPrCount + '?hospital=' + h_id, { filter });
          props.sendCountToSubParent(row.data.count._count.id)
          setRowCount(row.data.count._count.id);
        //}



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
    isRefetching
  ]);

   const { t } = useTranslation('shared-components');
  const [validationErrors, setValidationErrors] = useState({});
 
  const columns = useMemo(
    () => [

      {
        accessorKey: 'class', 
        header: t('Classification'),
        size: 20,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.class,
          helperText: validationErrors?.class,
          //remove any previous validation errors when illness focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              class: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: 'name',
        header: t('Medical practice name'),
        size: 280,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          //remove any previous validation errors when illness focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: 'score',
        header: t('Score'),
 
        size: 180,
        muiEditTextFieldProps: {
          type: 'score',
          required: true,
          error: !!validationErrors?.score,
          helperText: validationErrors?.score,
          //remove any previous validation errors when illness focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              score: undefined,
            }),
        },
      },
      {
        accessorKey: 'receipt',
        header: t('Receipt'),
        enableEditing: false,
        size: 180,
        muiEditTextFieldProps: {
          type: 'receipt',
          required: true,
          error: !!validationErrors?.receipt,
          helperText: validationErrors?.receipt,
          //remove any previous validation errors when illness focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              receipt: undefined,
            }),
        },
      }
    ],
    [validationErrors],
  );

  //call CREATE hook
  //const { mutateAsync: createUser, isPending: isCreatingUser } =
    //useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    if (window.confirm(t('Are you sure to save?'))) {
      console.log(1)
      const newValidationErrors = validateUser(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        console.log(2)
        setValidationErrors(newValidationErrors);
        return;
      }
      console.log(3)
      setValidationErrors({});
      await updateUser(values);
      table.setEditingRow(null); //exit editing mode
    }
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm(t('Are you sure you want to delete this?'))) {
      deleteUser(row.original);
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

  return <MaterialReactTable table={table} />;
};

 

//READ hook (get illnesss from api)
function useGetUsers(temp) {
  
  return useQuery({
    queryKey: ['illnesss'],
    queryFn: async () => {
      //send api request here
      //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
       const response = await axios.post(apiConfig.medicalPrList,{...temp.id>0?{...temp}:{}});
      return response.data.data;
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put illness in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (illness) => {
      const response = await axios.post(apiConfig.medicalPrUpdate,{...illness});
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
      const response = await axios.post(apiConfig.medicalPrRemove,{receipt:illnessId.receipt});
      return Promise.resolve();
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['illnesss'] }), //refetch illnesss after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const TableDisease = (props) => { 
  //Put this with your other react-query providers near root of your app
	function handleCountDataFromSubChild(data) {
		console.log(data,'county')
    props.sendCountToParent(data)
	  //setDataFromChild(data);
	}
 
return (
    <QueryClientProvider client={queryClient}>
    <Example    sendCountToSubParent={handleCountDataFromSubChild} globalFilter={props.globalFilter} />
  </QueryClientProvider>
)

};

export default TableDisease;

const validateRequired = (value) => !!value.length;
const validateRequiredInt = (value) => value>0;
const validatereceipt = (receipt) =>
  !!receipt.length &&
  receipt
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateUser(illness) {
 let data= {
    class: !validateRequired(illness.class) ? 'This field is Required' : '',
    name: !validateRequired(illness.name) ? 'This field is Required' : '',
    score: !validateRequiredInt(illness.score) ? 'This field is Required' : ''};

  
    return data
}
