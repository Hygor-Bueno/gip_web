import React from 'react'
import TableSalesEpp from '../Component/TableEPP/TableSalesEpp'
import { listPathEPP } from '../ConfigEPP'
import NavBar from '../../../Components/NavBar'
import FormSalesEPP from '../Component/FormEPP/FormSalesEpp'
import { useSalesData } from '../Hooks/useSalesData'
import { dataLogSale, dataOrder } from '../Interfaces/InterfacesEPP'

type Props = {}

const SalesPage = (props: Props) => {
  const {dataShop, tableDataCustom} = useSalesData();
  const [dataLog, setDataLog] = React.useState<dataLogSale[]>([]);
  const [dataOrder, setDataOrder] = React.useState<dataOrder[]>([]);

  return (
    <div className='d-flex w-100 flex-grow-1 overflow-hidden'>
        <NavBar list={listPathEPP} />
        <div className='w-100'>
            <div className='d-flex w-100'>
            <div className="w-100">
              <FormSalesEPP dataLogSale={dataLog} dataClient={dataOrder} stores={dataShop} />
            </div>
            <div className='w-75'>
              <TableSalesEpp 
                setDataLogSale={setDataLog}
                setDataOrder={setDataOrder} 
                tableData={tableDataCustom || []} 
              />
            </div>
          </div>
        </div>
    </div>
  )
}

export default SalesPage;