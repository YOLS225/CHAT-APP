"use client"

import {Button} from "@/core/components/ui/button"
import {ColumnDef} from "@tanstack/react-table"
import Image from "next/image"
import DeleteIcon from "../../../../../public/delete-icon.svg"
import ModifyIcon from "../../../../../public/modify-icon.svg"

export type TableWithSearchType = {
    id: string
    number: string
    bank_name: string
    bank_code: string
    counter_code: string
    number_account: string
    rib_key: string
    iban: string
  }


   
  export const columns: ColumnDef<TableWithSearchType>[] = [
    {
        accessorKey: "number",
        header: "N°",
        
      },
      {
        accessorKey: "bank_name",
        header: "Nom Banque",
      },
      {
        accessorKey: "bank_code",
        header: "Code Banque",
      },
      {
        accessorKey: "counter_code",
        header: "Code Guichet",
      },
      {
        accessorKey: "number_account",
        header: "N°Compte",
      },
      {
        accessorKey: "rib_key",
        header: "Clé Rib",
      },
      {
        accessorKey: "iban",
        header: "IBAN",
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({  }) => {
          return (
            <div className="flex flex-row gap-2">
              <Button variant="outline" className="p-4">
                <Image src={ModifyIcon}  alt="" width={12} height={12} /></Button>
                <Button variant="outline" className="p-4">
                <Image src={DeleteIcon}  alt="" width={12} height={12} /></Button>
            </div>
          );
        },
      },
  ]