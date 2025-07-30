import React, { useRef, useState } from 'react';
import NavBar from '../../Components/NavBar';
import { useMyContext } from '../../Context/MainContext';
import { useConnection } from '../../Context/ConnContext';

const ProfileGIPP = () => {

  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();

  const listPath = [
    { page: '/GIPP', children: 'Home', icon: 'fa fa-home' },
    { page: '/GIPP/configuration/profile', children: 'Perfil', icon: 'fa fa-user' },
    {
      page: '/', children: 'Sair', icon: 'fa fa-sign-out', actionAdd: () => {
        localStorage.removeItem("tokenGIPP");
        localStorage.removeItem("codUserGIPP");
      }
    }
  ];

function getMimeTypeFromExtension(filename?: string): string {
  const mimeTypes: { [key: string]: string } = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
  };

  const ext = filename?.split('.').pop()?.toLowerCase();
  return mimeTypes[ext ?? ''] ?? 'image/png';
}

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        putEmployee(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  async function putEmployee(base64Image: string) {
    try {
      setLoading(true);
      const req = await fetchData({
        method: "PUT",
        params: {
          id: userLog.id,
          photo: base64Image,
        },
        pathFile: "CCPP/EmployeePhoto.php",
        urlComplement: "",
      });
      if (req.error) throw new Error(req.message);
      userLog.photo = base64Image;
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoSrc = (): string => {
    const mimeType = getMimeTypeFromExtension(userLog.photo);
    return `data:${mimeType};base64,${userLog.photo}`;
  };

  return (
    <React.Fragment>
      <NavBar list={listPath} />
      <main className="w-100 min-vh-100 bg-light">
        <header className="bg-primary position-relative">
          <div className="image-background-peg-pese d-flex justify-content-center align-items-center py-5">
            <label htmlFor="inputChangePhoto" className="image-profile" >
              <img
                src={getPhotoSrc()}
                className="img-fluid rounded-circle"
                alt="Foto do usuário"
              />
            </label>
            <input
              id="inputChangePhoto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </header>
        <section className="container py-5">
          <div className="card shadow-sm p-4 bg-white">
            <h3 className="mb-4 text-dark">Informações do Perfil</h3>
            <ul className="list-unstyled fs-5">
              <li><strong>Nome:</strong> {userLog.name}</li>
              <li><strong>Companhia:</strong> {userLog.company}</li>
              <li><strong>Loja:</strong> {userLog.shop}</li>
              <li><strong>Departamento:</strong> {userLog.departament}</li>
              <li><strong>Subdepartamento:</strong> {userLog.sub}</li>
            </ul>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
};

export default ProfileGIPP;