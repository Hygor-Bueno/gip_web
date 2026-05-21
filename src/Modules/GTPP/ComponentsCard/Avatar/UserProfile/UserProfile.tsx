import ImageUser from "../../../../../Assets/Image/user.png";
import { convertImage } from "../../../../../Util/Utils";
import Image from "../Image/Image";
import './Style.css';

const UserProfile = ({ detailsmodaluser, data }: any) => {
  const users = Array.isArray(data.user) ? data.user : [];
  return (
    <div className="gtpp-collab-profile d-flex flex-column h-100">
      <div className="gtpp-collab-panel__header d-flex align-items-center justify-content-between">
        <div className="gtpp-collab-panel__title">
          <span className="gtpp-collab-panel__icon" aria-hidden="true">
            <i className="fa-solid fa-users"></i>
          </span>
          <strong>Colaboradores</strong>
        </div>
        <button
          className="gtpp-collab-panel__close"
          onClick={() => detailsmodaluser(true)}
          aria-label="Fechar"
          title="Fechar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="gtpp-collab-body gtpp-collab-list overflow-auto">
        {users.length === 0 ? (
          <div className="gtpp-collab-empty">Nenhum colaborador atribuído.</div>
        ) : (
          users.map((photo: any, index: any) => (
            <div key={`photo_user_task_${index}`} className="gtpp-collab-row gtpp-collab-row--static d-flex align-items-center w-100">
              <div className="gtpp-collab-row__avatar avatar">
                <Image title={photo.name} src={String(photo.photo).length > 0 ? convertImage(photo.photo) : ImageUser} alt={`User ${index}`} />
              </div>
              <span className="gtpp-collab-row__name">{photo.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;
