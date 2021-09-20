import React, { useState, useEffect, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import CircularProgress from '@material-ui/core/CircularProgress'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Card from '@material-ui/core/Card'
import Checkbox from '@material-ui/core/Checkbox'
import CheckIcon from '@material-ui/icons/Check'
import RemoveIcon from '@material-ui/icons/Remove'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import ClearIcon from '@material-ui/icons/Clear'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { useAsync } from 'react-async-hook'

const sortIcon = <ArrowDownward />
const selectProps = { indeterminate: isIndeterminate => isIndeterminate }

const Circular = () => (
  <div style={{ padding: '24px' }}>
    <CircularProgress size={75} />
  </div>
)

const Boolean = ({ value }) => (
  value ? (<CheckIcon />) : (<RemoveIcon />)
)

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <>
    <TextField
      id='search'
      type='text'
      placeholder='Filtrar dados'
      value={filterText}
      onChange={onFilter}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton onClick={onClear}>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  </>
)

const paginationOptions = {
  rowsPerPageText: 'Por página',
  rangeSeparatorText: 'de'
}

const CustomDataTable = ({ title, columns, fetchData, defaultPerPage = 10, ...rest }) => {
  const [filterText, setFilterText] = React.useState('')
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState('')
  const [columnsPrepared, setColumnsPrepared] = useState([])
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const [data, setData] = useState([])

  const handleFetchData = useMemo(() => async (page, rowsPerPage, sortColumn, sortDirection, filterText, debounced) => {
    setLoading(true)
    let response
    if (debounced) {
      response = await AwesomeDebouncePromise(fetchData, 300)(page, rowsPerPage, sortColumn, sortDirection, filterText)
    } else {
      response = await fetchData(page, rowsPerPage, sortColumn, sortDirection, filterText)
    }
    if (!response) return
    const { data, total } = response

    setData(data)
    setTotalRows(total)
    setLoading(false)
  }, [fetchData])

  const handlePageChange = page => {
    handleFetchData(page, perPage, sortColumn, sortDirection, filterText, false)
  }

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage)
    setResetPaginationToggle(!resetPaginationToggle)
  }

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector)
    setSortDirection(sortDirection)
    setResetPaginationToggle(!resetPaginationToggle)
  }

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

    return <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />
  }, [filterText, resetPaginationToggle])

  useEffect(() => {
    const columnsAux = [...columns]
    columnsAux.forEach(c => {
      c.sortable = true
      if (c.type === 'boolean') {
        c.cell = row => {
          return <Boolean value={row[c.selector]} />
        }
      }
    })
    setColumnsPrepared(columnsAux)
  }, [columns])

  useAsync(() => {
    if (filterText) {
      handleFetchData(1, perPage, sortColumn, sortDirection, filterText, true)
    } else {
      handleFetchData(1, perPage, sortColumn, sortDirection, filterText, false)
    }
  }, [perPage, sortColumn, sortDirection, filterText])

  return (
    <Card style={{ height: '100%' }}>
      <DataTable
        title={<Typography variant='h6'>{title}</Typography>}
        columns={columnsPrepared}
        data={data}
        noDataComponent='Sem dados para exibir'
        progressPending={loading}
        progressComponent={<Circular />}
        persistTableHead
        pagination
        paginationServer
        paginationComponentOptions={paginationOptions}
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        paginationResetDefaultPage={resetPaginationToggle}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        onSort={handleSort}
        sortServer
        sortIcon={sortIcon}
        selectableRowsComponent={Checkbox}
        selectableRowsComponentProps={selectProps}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        {...rest}
      />
    </Card>
  )
}

export default CustomDataTable