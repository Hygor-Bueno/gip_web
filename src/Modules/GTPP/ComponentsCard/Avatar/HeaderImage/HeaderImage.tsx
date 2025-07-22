import '../AvatarGroup.css';

const HeaderImage = () => {
  return (
    <div className="bg-primary text-white p-2 gap-2 rounded font-weight-bold d-flex align-items-center">
      <i className="fa fa-user text-white"></i>{" "}
      <p className="font-weight-bold d-none d-md-inline">Usuários da tarefa</p>
    </div>
  );
};

export default HeaderImage;
