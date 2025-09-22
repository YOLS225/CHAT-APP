import React from 'react'
import { DataTableWithSearch, DataTableWithSearchProps } from "./DataTable"

const TableWithSearch = <TData, TValue>({
    columns,
    data,
}: DataTableWithSearchProps<TData, TValue>) => {
    return (
        <div className="  ">
            <DataTableWithSearch columns={columns} data={data} />
        </div>
    )
}

export default TableWithSearch
