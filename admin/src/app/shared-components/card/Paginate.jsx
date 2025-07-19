import * as React from 'react';
import TablePagination from '@mui/material/TablePagination';
import { useEffect} from 'react';  





export default function TablePaginationDemo(props) {

    const queryParameters = new URLSearchParams(window.location.search)
const cpage = queryParameters.get("page")  || 0


    const [page, setPage] = React.useState(cpage);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const handleChangePage = (event, newPage) => {
        console.log('caalingggg0')
        window.history.pushState('hospital', 'hospital', '/hospital/dpc-analysis'+'?page='+parseInt(newPage));

        setPage(newPage);
        props.setPageParent(newPage)
    };
    const handleChangeRowsPerPage = (event) => {
        console.log('caalingggg1')
        setRowsPerPage(parseInt(event.target.value, 10));
        props.setRowParent(parseInt(event.target.value, 10))

        setPage(cpage);
        props.setPageParent(cpage)
    };

    useEffect(() => {
        console.log('caalingggg2')
        setPage(cpage);
        props.setPageParent(cpage)
    }, [props.total_data]);

    useEffect(() => {

        const cpage2 = queryParameters.get("page")

        console.log('caalingggg3',cpage,cpage2)
        setPage(cpage);
    }, [cpage]);

    return ( 
        <TablePagination component="div" count={props.total_data} page={parseInt(page)} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage}/>
);
}