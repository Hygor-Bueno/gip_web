import React, { useRef, useState } from 'react';
import NavBar from '../../Components/NavBar';
import { useMyContext } from '../../Context/MainContext';
import { useConnection } from '../../Context/ConnContext';

const ProfileGIPP = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();
  const [photo, setPhoto] = useState<string>('');
  // const [photoExt, setPhotoExt] = useState<string>('png'); // padrão

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

  const getMimeTypeFromExtension = (filename?: string): string => {
    if (!filename) return 'image/png'; // fallback padrão
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'gif' ? 'image/gif'
      : ext === 'bmp' ? 'image/bmp'
      : ext === 'webp' ? 'image/webp'
      : 'application/octet-stream';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      // const extension = fileName.split('.').pop()?.toLowerCase() || 'png';
      const mimeType = getMimeTypeFromExtension(fileName);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        const fullBase64 = `data:${mimeType};base64,${base64Data}`;
        setPhoto(fullBase64);
        // setPhotoExt(extension);
        putEmployee(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
      console.log("Imagem enviada com sucesso:", req.data);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoSrc = (): string => {
    if (photo) return photo;
    const mimeType = getMimeTypeFromExtension(userLog.photo);
    return `data:${mimeType};base64,${userLog.photo}`;
  };

  return (
    <React.Fragment>
      <NavBar list={listPath} />
      <main className="w-100 min-vh-100 bg-light">
        <header className="bg-primary position-relative">
          <div className="image-background-peg-pese d-flex justify-content-center align-items-center py-5">
            <div className="image-profile" onClick={handleImageClick}>
              <img
                src={getPhotoSrc()}
                className="img-fluid rounded-circle"
                alt="Foto do usuário"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
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
