import React, { forwardRef } from "react";
import MaterialTable from "material-table";
import AddBox from "@mui/icons-material/AddBox";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Check from "@mui/icons-material/Check";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import FilterList from "@mui/icons-material/FilterList";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import Remove from "@mui/icons-material/Remove";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Search from "@mui/icons-material/Search";
import ViewColumn from "@mui/icons-material/ViewColumn";
import Loading from "./Loading";

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => (
        <ChevronRight {...props} ref={ref} />
    )),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => (
        <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const Table = (props) => {

    return props.loaded ? (
        <MaterialTable
            title={props.title}
            icons={tableIcons}
            columns={props.columns}
            data={props.data.map(row => {
                return {
                    ...row,
                    /* rowStyle: {
                        backgroundColor: '#EEE',
                    } */

                }
            })}
            localization={{
                pagination: {
                    labelDisplayedRows: "{from}-{to} de {count}",
                    labelRowsSelect: "Registros",
                    labelRowsPerPage: "Registros por página",
                    firstTooltip: "Primeira página",
                    previousTooltip: "Página anterior",
                    nextTooltip: "Próxima página",
                    lastTooltip: "Última página",
                },
                grouping: {
                    placeholder: "Arraste títulos para agrupar",
                },
                toolbar: {
                    nRowsSelected: "{0} registro(s) selecionado(s)",
                    searchTooltip: "Buscar",
                    searchPlaceholder: "Buscar",
                    exportTitle: "Exportar",
                    exportName: "Exportar como CSV",
                },
                header: {
                    actions: "Ações",
                },
                body: {
                    emptyDataSourceMessage: "Sem dados para exibir",
                    addTooltip: "Adicionar",
                    deleteTooltip: "Deletar",
                    editTooltip: "Editar",
                    filterRow: {
                        filterTooltip: "Filtro",
                    },
                    editRow: {
                        deleteText: "Você tem certeza que deseja deletar este registro?",
                        cancelTooltip: "Cancelar",
                        saveTooltip: "Salvar",
                    },
                },
            }}
            actions={props.actions}
            options={{
                pageSize: 10,
                pageSizeOptions: [5, 10, 20, 50],
                draggable: false,
                cellStyle: {
                    textAlign: 'center',
                    border: '1px solid black',
                    padding: '2px'
                },
                headerStyle: {
                    textAlign: 'center',
                    borderBottom: '1px solid black',
                    padding: '2px'
                },
                rowStyle: (rowData, idx) => ({
                    backgroundColor: idx % 2 == 0 ? '#EEE' : '#FFF'
                    
                }),
                ...props.options,
            }}
            editable={props.editable}
        />
    ) : (
        <Loading />
    );
};

export default Table;