import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TablePagination,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';

interface DataTableProps {
    data: { [key: string]: number };
    onClose: () => void;
}

const PaperComponent = (props: any) => {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
};

const DataTable: React.FC<DataTableProps> = ({ data, onClose }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const dataRows = Object.entries(data);

    return (
        <Dialog
            open={true}
            onClose={onClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            BackdropProps={{ invisible: true }}  // Disable backdrop dimming effect
            disablePortal  // Keep dialog inside its parent DOM hierarchy
            disableEnforceFocus  // Allow focus outside of the dialog
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography variant="h6">Results</Typography>
                <IconButton onClick={onClose} style={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Crop</strong></TableCell>
                                <TableCell align="right"><strong>Area in (acres) </strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataRows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell component="th" scope="row">
                                            {key}
                                        </TableCell>
                                        <TableCell align="right">{value}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={dataRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </DialogActions>
        </Dialog>
    );
};

export default DataTable;
