 
 
 import { useMemo, useState,useEffect } from 'react';
 import * as React from 'react';
 import Badge from '@mui/material/Badge';
import {
    MRT_GlobalFilterTextField,
    MRT_TableBodyCellValue,
    MRT_TablePagination,
    MRT_ToolbarAlertBanner,
    flexRender,
    useMaterialReactTable,
  } from 'material-react-table';
  import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
  } from '@mui/material';
  import Button from '@mui/material/Button';
  import MailIcon from '@mui/icons-material/Mail';
  import FileIcon from '@mui/icons-material/SpeakerNotes';
  
  import '../../../styles/custom-basic.css';
  import Chip from '@mui/material/Chip';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
  const Example = (props) => {

    const { t } = useTranslation('shared-components');

    const data = props.data;

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => ` `, //accessorFn used to join multiple data into a single cell
                id: 'action', //id is still required when using accessorFn instead of accessorKey
                header: t('Reply'),
                enableEditing: false,
                required: false,
                size: 50,
                Cell: ({ renderedCellValue, row }) => (
                  <> 



                        <div className="flex-container cursor-pointer" onClick={() => { props.idSend(row.original.id) }} >
                       
 

                            <div className="flex-item" ><Badge badgeContent={row.original.reply_count} color="primary">

                            <FileIcon color="action"/>
                                {/*<Button onClick={() => { props.idSend(row.original.id) }} variant="contained" size="small"> {t('View')} </Button>*/}
                            </Badge></div>

                            {row.original.have_new == " New ✉ found" &&
                                <div className="flex-item">
                                    <Badge   color="secondary" badgeContent={'new'}>
                                       
                                    </Badge>
                                </div>
                            }

                           

                        </div> 

     <p style={{
    "font-size": "smaller"
}}>{row.original.reply_time}</p> 


{row.original.reply_time &&
    <p style={{"font-size": "smaller"}}>{row.original.reply_by}</p>    
}
               
                        
    
                  </>
                ),
              },
          {
            accessorKey: 'subject', //access nested data with dot notation
            header: t('Subject'),
            size: 150,
          },
 
          {
            accessorKey: 'created', //normal accessorKey
            header: t('Sender'),
            size: 200,
          },
 
        
          {
            accessorFn: (row) => ` `, //accessorFn used to join multiple data into a single cell
            id: 'action1', //id is still required when using accessorFn instead of accessorKey
            header: t('Status'),
            enableEditing: false,
            required: false,
            size: 150,
            Cell: ({ renderedCellValue, row }) => (
              <> 



                 
                    
                         {row.original.status=='Pending' &&
                         <Chip label={t(row.original.status)}  size="small"  color="default" variant=" "/>
                         }

                        {row.original.status=='Seen' &&
                         <Chip label={t(row.original.status)}  size="small"  color="secondary" variant=" "/>
                         }

                        {row.original.status=='Solved' &&
                         <Chip label={t(row.original.status)}  size="small"  color="success" variant=" "/>
                         }
 
                        
                        <div className="">{row.original.status_date}</div>
 
                       
                    
                 

 
         
                    

              </>
            ),
          },
  
        ],
        [],
      );
      const [rowSelection, setRowSelection] = useState({});

      useEffect(() => {
        console.log(rowSelection,'rowSelection')
		props.selectedRows(rowSelection);
	}, [rowSelection]);


    const table = useMaterialReactTable({
      columns,
      data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      //MRT display columns can still work, optionally override cell renders with `displayColumnDefOptions`
      enableRowSelection: true,


      getRowId: (row) => row.userId,
      muiTableBodyRowProps: ({ row }) => ({
        //implement row selection click events manually
        onClick: () =>
          setRowSelection((prev) => ({
            ...prev,
            [row.original.id]: !prev[row.original.id], //this is a simple toggle implementation
          })),
        selected: rowSelection[row.original.id],
        sx: {
          cursor: 'pointer',
        },
      }),
      onRowSelectionChange: setRowSelection,
      state: { rowSelection },


      initialState: {
        pagination: { pageSize: 5, pageIndex: 0 },
        showGlobalFilter: true,
      },
      //customize the MRT components
      muiPaginationProps: {
        rowsPerPageOptions: [5, 10, 15],
        variant: 'outlined',
      },
      paginationDisplayMode: 'pages',
    });
  
    return (
      <Stack sx={{ m: '2rem 0' }} style={{background:"white", padding:"15px", borderRadius:"15px"}}> 
        <Typography variant="p"></Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/**
           * Use MRT components along side your own markup.
           * They just need the `table` instance passed as a prop to work!
           */}
          <MRT_GlobalFilterTextField table={table} />
          <MRT_TablePagination table={table} />
        </Box>
        {/* Using Vanilla Material-UI Table components here */}
        <TableContainer>
          <Table>
            {/* Use your own markup, customize however you want using the power of TanStack Table */}
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell align="center" variant="head" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.Header ??
                              header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow key={row.original.id} selected={row.getIsSelected()}>
                  {row.getVisibleCells().map((cell, _columnIndex) => (
                    <TableCell align="center" variant="body" key={cell.id}>
                      {/* Use MRT's cell renderer that provides better logic than flexRender */}
                      <MRT_TableBodyCellValue
                        cell={cell}
                        table={table}
                        staticRowIndex={rowIndex} //just for batch row selection to work
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
      </Stack>
    );
  };
  
  export default Example;













