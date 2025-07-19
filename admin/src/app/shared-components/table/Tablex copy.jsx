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
 

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

 


const Example = (props) => {

  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, //customize the default page size
  });
  
 
  useEffect(() => {
    const fetchData = async () => {
      console.log(globalFilter,'/',columnFilters,'/',sorting)
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      
 
      try {
        if(rowCount>0){}else{
                  const row = await axios.post(apiConfig.illnessCount);
                  setRowCount(row.data.count._count.id);
        }
       // console.log(row.data.count._count.id);
       let filter={
        columnFilters:columnFilters,
        globalFilter:globalFilter,
        sorting:sorting
       }
        const response = await axios.post(apiConfig.illnessList+'?take='+pagination.pageSize+'&&skip='+(10*pagination.pageIndex),{filter});
 
        setData(response.data.data);

        
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
  ]);

   const { t } = useTranslation('shared-components');
  const [validationErrors, setValidationErrors] = useState({});
 
  const columns = useMemo(
    () => [

      {
        accessorKey: 'icd',
        header: t('ICD Code'),
        size: 20,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.icd,
          helperText: validationErrors?.icd,
          //remove any previous validation errors when illness focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              icd: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: 'name',
        header: t('Injury and disease name'),
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
        accessorKey: 'receipt',
        header: t('Receipt'),
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
      },
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
        enableHiding: true, 
      },
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
  } = useGetUsers(props.filter);
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
 

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    if (window.confirm('Are you sure you want to save this illness?')) {
      const newValidationErrors = validateUser(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
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
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
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
       const response = await axios.post(apiConfig.illnessList,{...temp.id>0?{...temp}:{}});
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
      const response = await axios.post(apiConfig.illnessUpdate,{...illness});
     // console.log(illness,'??')
      //send api update request here
      //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    /*onMutate: (newUserInfo) => {
      queryClient.setQueryData(['illnesss'], async (prevUsers) =>
       { 
        console.log(newUserInfo,'??')
      //  const response = await axios.post(apiConfig.illnessUpdate,{...newUserInfo});
       // prevUsers?.map((prevUser) =>
         // prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        //)
      }
      );
    },*/
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['illnesss'] }), //refetch illnesss after mutation, disabled for demo
  });
}

//DELETE hook (delete illness in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (illnessId) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (illnessId) => {
      queryClient.setQueryData(['illnesss'], (prevUsers) =>
        prevUsers?.filter((illness) => illness.id !== illnessId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['illnesss'] }), //refetch illnesss after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const Tablex = (props) => (
  //Put this with your other react-query providers near root of your app




  <QueryClientProvider client={queryClient}>
    <Example filter={props.filter}/>
  </QueryClientProvider>
);

export default Tablex;

const validateRequired = (value) => !!value.length;
const validatereceipt = (receipt) =>
  !!receipt.length &&
  receipt
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateUser(illness) {
  return {
    icd: !validateRequired(illness.icd)
      ? 'ICD Code is Required'
      : '',
    name: !validateRequired(illness.name) ? 'Injury and disease name is Required' : '',
    receipt: !validateRequired(illness.receipt) ? 'is Required' : '',
  };
}
