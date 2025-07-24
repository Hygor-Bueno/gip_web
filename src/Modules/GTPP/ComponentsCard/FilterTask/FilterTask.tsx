import { useState, useEffect } from "react";
import { useMyContext } from "../../../../Context/MainContext";
import iconImage from "../../../../Assets/Image/user.png";
import { useConnection } from "../../../../Context/ConnContext";
import { convertImage } from "../../../../Util/Util";
import { Image } from "../Avatar";

const FilterTask = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limitPage, setLimitPage] = useState<number>(1);
  const [list, setList] = useState<any>([]); 
  const { setLoading } = useMyContext();

  const { fetchData } = useConnection();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      (async () => await recoverList())();
    }
  }, [page, searchTerm, isOpen]);

  async function recoverList() {
    try {
      setLoading(true);
      const req: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "CCPP/Employee.php",
        urlComplement: `&pApplicationAccess=3&pPage=${page}&pEmployeeName=${searchTerm}`,
      });
      if (req.error) throw new Error(req.message);
      setList(req.data);
      setLimitPage(req.limitPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div>
      <button className={`btn fa fa-user border-light ${isOpen ? "bg-success text-white active" : "bg-light text-dark"}`} onClick={toggleDrawer}></button>
      {isOpen && (
        <div className="trello-drawer-overlay" onClick={toggleDrawer}></div>
      )}
      <div className={`trello-drawer ${isOpen ? "open" : ""}`}>
        <div className="trello-drawer-header">
          <h5 className="trello-drawer-title">Filtrar por:</h5>
          <button type="button" className="btn-close" onClick={toggleDrawer} aria-label="Close"></button>
        </div>
        <div className="trello-drawer-body cursor-pointer">
          <div>
            <input className="form-control" placeholder="Nome do colaborador"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  setSearchTerm(e.currentTarget.value);
                  setPage(1);
                }
              }}
            />
            <div className="d-flex">
              <select className="form-select mt-2" >
                <option hidden value="">Loja</option>
              </select>
              <select className="form-select mt-2" >
                <option hidden value="">Departamento</option>
              </select>
              <select className="form-select mt-2" >
                <option hidden value="">Subdepartamento</option>
              </select>
            </div>
          </div>
          <div className="mt-2 overflow-auto trello-drawer-modal">
            {list.map((item: any, index: any) => {
              return (
                <div key={item.employee_id} className="p-2 mt-2 border-dark rounded d-flex justify-content-between align-items-center" onClick={() => props?.getIdUser(item.employee_id)}>
                  <div>
                    <strong>{item.employee_name}</strong>
                    <div className="text-muted small">{item.departament_name} & {item.sub_dep_name}</div>
                  </div>
                  <div className="rounded d-flex justify-content-between">
                    <div className="">
                      <Image src={item?.employee_photo ? convertImage(item.employee_photo) : iconImage} alt={item.name} className="img-user rounded" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="trello-drawer-footer d-flex justify-content-between">
          <button className="btn btn-primary" onClick={() => props?.getIdUser('')}>Limpar</button>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <button disabled={page <= 1 ? true : false} className="btn btn-danger" onClick={() => setPage(prev => (prev > 1 ? prev - 1 : 1))}>{"<"}</button>
            <strong>{String(page).padStart(2, "0")} / {String(limitPage).padStart(2, "0")}</strong>
            <button disabled={page >= limitPage ? true : false} className="btn btn-success" onClick={() => setPage(prev => (prev < limitPage ? prev + 1 : limitPage))}>{">"}</button>
          </div>
          <button type="button" className="btn btn-success" onClick={toggleDrawer}>Buscar</button>
        </div>
      </div>
    </div>
  );
};

export default FilterTask;