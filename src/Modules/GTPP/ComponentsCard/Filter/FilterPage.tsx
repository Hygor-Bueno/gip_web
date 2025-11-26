import { useEffect, useState } from "react";
import CustomTable from "../../../../Components/CustomTable";
import FiltersSearchUser from "../../../../Components/FiltersSearchUser";
import { tItemTable } from "../../../../types/types";
import { maskUserSeach } from "../../../../Util/Util";
import { useWebSocket } from "../../Context/GtppWsContext";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";

export function FilterPage() {
  const [page, setPage] = useState<number>(1);
  const [limitPage, setLimitPage] = useState<number>(1);
  const [params, setParams] = useState<string>('');
  const [list, setList] = useState<tItemTable[]>([]);
  const { setLoading, appIdSearchUser } = useMyContext();

  const { fetchData } = useConnection();
  const { getTask, setGetTask, reqTasks, isAdm } = useWebSocket();

  useEffect(() => {
    (async () => {
      await recoverList(params);
      await reqTasks();
    })();
  }, [page, params, appIdSearchUser]);

  async function recoverList(value?: string) {
    try {
      setLoading(true);
      let newUrlComplement = `&pPage=${page}`;
      if (value) newUrlComplement += value;
      if (appIdSearchUser) newUrlComplement += `&pApplicationAccess=${appIdSearchUser}`;
      const req: any = await fetchData({ method: 'GET', params: null, pathFile: 'CCPP/Employee.php', urlComplement: newUrlComplement });
      if (req["error"]) throw new Error(req["message"]);
      setList(maskFilter(req["data"]));
      setLimitPage(req["limitPage"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  function maskFilter(array: any[]): tItemTable[] {
    return array.map(element => ({
      employee_id: maskUserSeach(element["employee_id"], "", false, true),
      employee_photo: maskUserSeach(element["employee_photo"], "#", true),
      employee_name: maskUserSeach(element["employee_name"], "Nome", false, false, "150px"),
      store_name: maskUserSeach(element["store_name"], "Loja", false, false, "150px"),
      departament_name: maskUserSeach(element["departament_name"], "Depto", false, false, "150px"),
    }));
  }

return (
  <div style={{ zIndex: "2" }} className="d-flex justify-content-end bg-dark bg-opacity-50 position-absolute top-0 start-0 w-100 h-100">
    <div className="bg-white col-12 col-sm-8 col-md-6 col-lg-5 d-flex flex-column h-100">
      <div className="d-flex justify-content-end p-2"><button onClick={async () => document.getElementById('check_filter')?.click()} type="button" className="btn btn-danger">X</button></div>
      <div className="px-2">
        <FiltersSearchUser
          onAction={(e: string) => {
            setParams(e);
            setPage(1);
          }}
          callBack={true}
        />
      </div>
      <div className="d-flex flex-column flex-grow-1 p-2 overflow-auto">
        {list.length > 0 && (
          <CustomTable
            list={list}
            onConfirmList={closeCustomTable}
          />
        )}
      </div>
      <footer className="d-flex align-items-center justify-content-around py-2">
        <button onClick={() => navPage(false)} className="btn btn-light fa-solid fa-backward" type="button"></button>
        {`( ${page.toString().padStart(2, '0')} / ${limitPage.toString().padStart(2, '0')} )`}
        <button onClick={() => navPage(true)} className="btn btn-light fa-solid fa-forward" type="button"></button>
      </footer>
    </div>
  </div>
);

  function closeCustomTable(colabs: any) {
    setGetTask(filterTasks(getTask, { ...parseQueryStringToJson(params), colabs: colabs.map((colab: any) => colab.employee_id.value) }));
    document.getElementById('check_filter')?.click();
  }

  function filterTasks(tasks: any[], filter: any): any[] {
    return tasks.filter(task => {
      const hasMatchingCSD = task.csds.some((csd: any) =>
        csd.company_id === Number(filter.pCompanyId) ||
        csd.shop_id === Number(filter.pShopId) ||
        csd.depart_id === Number(filter.pDepartmentId)
      );
      const colabMatch = task.colabs.some((colab: any) => filter.colabs.includes(colab.user_id));
      const isUserOwnerMatch = filter.colabs.includes(String(task.user_id));
      return hasMatchingCSD || (colabMatch || isUserOwnerMatch);
    });
  }

  function navPage(isNext: boolean) {
    if (limitPage === 0) return;
    const newPage = isNext ? page + 1 : page - 1;
    if (newPage <= limitPage && newPage >= 1) {
      setPage(newPage);
    }
  }
  function parseQueryStringToJson(queryString: string): Record<string, string> {
    if (queryString.startsWith('&')) {
      queryString = queryString.slice(1);
    }

    const pairs = queryString.split('&');
    const result: Record<string, string> = {};

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      result[key] = value;
    }
    return result;
  }
}