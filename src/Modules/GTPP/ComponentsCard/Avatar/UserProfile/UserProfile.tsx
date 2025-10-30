import ImageUser from "../../../../../Assets/Image/user.png";
import { convertImage } from "../../../../../Util/Util";
import Image from "../Image/Image";
import './Style.css';

const UserProfile = ({ detailsmodaluser, data }: any) => {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <strong>Colaboradores</strong>
        <button className="btn btn-danger text-white" onClick={() => detailsmodaluser(true)}>X</button>
      </div>
      {data.user?.map((photo: any, index: any) => (
        <div key={`photo_user_task_${index}`} className="d-flex rounded p-1 gap-4 align-items-center mb-2">
          <div className={`avatar`}>
            <Image title={photo.name} src={String(photo.photo).length > 0 ? convertImage(photo.photo) : ImageUser} alt={`User ${index}`} />
          </div>
          <div>
            <p><strong>{photo.name}</strong></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
