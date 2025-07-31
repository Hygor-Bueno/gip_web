import { useEffect, useState } from "react";
import { useMyContext } from "../../../../../Context/MainContext";
import { Connection } from "../../../../../Connection/Connection";
import ModalUser from "../ModalUser/ModalUser";
import UserProfile from "../UserProfile/UserProfile";
import './Style.css';
import { useConnection } from "../../../../../Context/ConnContext";

const Modal = (props: any) => {
  const [getInfoUser, setInfoUser] = useState();
  const [openDetailUser, setOpenDetailUser] = useState();
  const [photos, setPhotos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useMyContext();

  const { fetchData } = useConnection();

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);
      try {
        const userList: any = [];

        if (Array.isArray(props.user)) {
          for (let user of props.user) {
            const responsePhotos: any = await fetchData({method: "GET", pathFile: "CCPP/EmployeePhoto.php", params: null, urlComplement: `&id=${user.user_id}`, exception: ["no data"]});
            const responseDetails: any = await fetchData({method: "GET", pathFile: 'CCPP/Employee.php', params: null, urlComplement: `&id=${user.user_id}`, exception: ["no data"]});

            if (!responsePhotos?.error && !responseDetails?.error) {
              const details = responseDetails.data[0];
              userList.push({
                id: user.user_id,
                name: details.name,
                company: details.company,
                shop: details.shop,
                department: details.departament,
                sub: details.sub,
                administrator: responseDetails.data[1]?.administrator,
                photo: responsePhotos.photo,
              });
            }
          }
        }

        setPhotos(userList);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [props.user]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="modal-list d-flex align-items-center gap-3">
      <div>
        <ModalUser
          isSearchUser={true}
          allTaskUser={props.allTaskUser}
          dataPhotosUsers={photos}
          data={props}
          list={getInfoUser}
          openDetailUser={openDetailUser}
          setOpenDetailUser={setOpenDetailUser}
        >
          <UserProfile
            photos={photos}
            detailsmodaluser={props.detailsmodaluser}
            listuser={setInfoUser}
            setOpenDetailUser={setOpenDetailUser}
            userId={props.user}
          />
        </ModalUser>
      </div>
    </div>
  );
};

export default Modal;
