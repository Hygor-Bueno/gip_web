import React, { ChangeEvent, useState } from "react";
import NavBar from "../../Components/NavBar";
import { useMyContext } from "../../Context/MainContext";
import { useConnection } from "../../Context/ConnContext";
import { InputCheckButton } from "../../Components/CustomButton";
import { ImageCropper } from "./ImageCropper";

// --- SEU COMPONENTE PRINCIPAL (PROFILEGIPP) ---
const ProfileGIPP = () => {
  const { setLoading, userLog } = useMyContext();
  const { fetchData } = useConnection();

  const [openNavMenu, setOpenNavMenu] = useState<boolean>(true);
  const [cropperModal, setCropperModal] = useState<{ isOpen: boolean; src: string | null }>({ isOpen: false, src: null });

  const listPath = [
    { page: "/GIPP", children: "Home", icon: "fa fa-home" },
    { page: "/GIPP/configuration/profile", children: "Perfil", icon: "fa fa-user" },
    {
      page: "/",
      children: "Sair",
      icon: "fa fa-sign-out",
      actionAdd: () => {
        localStorage.removeItem("tokenGIPP");
        localStorage.removeItem("codUserGIPP");
      },
    },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result?.toString();
      if (result) {
        setCropperModal({ isOpen: true, src: result });
      }
    };
    reader.readAsDataURL(file);
    // Limpa o valor para permitir a seleção do mesmo arquivo novamente
    e.target.value = "";
  };
  
  const handleCroppedImage = (croppedImageBase64: string) => {
    if (croppedImageBase64) {
      const base64Data = croppedImageBase64.split(',')[1];
      putEmployee(base64Data);
    }
    setCropperModal({ isOpen: false, src: null }); // Fecha o modal
  };

  async function putEmployee(base64Image: string) {
    try {
      setLoading(true);
      const req = await fetchData({
        method: "PUT",
        params: { id: userLog.id, photo: base64Image },
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
  }

  const getPhotoSrc = (): string => {
    return `data:image/webp;base64,${userLog.photo}`;
  };

  return (
    <React.Fragment>
      {openNavMenu && <NavBar list={listPath} />}
      <main className="w-100 min-vh-100 bg-light">
        <header className="bg-primary position-relative">
          <div className="image-background-peg-pese d-flex justify-content-center align-items-center py-5">
            <div className="position-absolute btn-close-menu d-sm-none">
              <InputCheckButton
                inputId={`gapp_exp_ret_form`}
                nameButton={"Exibir/Ocultar formulário"}
                onAction={(event: any) => setOpenNavMenu(!event)}
                labelIconConditional={["fa-solid fa-eye", "fa-solid fa-eye-slash"]}
              />
            </div>
            <label htmlFor="inputChangePhoto" className="image-profile" style={{ cursor: 'pointer' }}>
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
              style={{ display: "none" }}
            />
          </div>
        </header>
        <section className="container py-5 overflow-auto h-50">
          <div className="card shadow-sm p-4 bg-white">
            <h3 className="mb-4 text-dark">Informações do Perfil</h3>
            <ul className="list-unstyled fs-5 profileGipp">
              <li><strong>Nome:</strong> {userLog.name}</li>
              <li><strong>Companhia:</strong> {userLog.company}</li>
              <li><strong>Loja:</strong> {userLog.shop}</li>
              <li><strong>Departamento:</strong> {userLog.departament}</li>
              <li><strong>Subdepartamento:</strong> {userLog.sub}</li>
            </ul>
          </div>
        </section>
      </main>

      {/* --- MODAL DE RECORTE --- */}
      {cropperModal.isOpen && cropperModal.src && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal-content">
            <ImageCropper
              imageSrc={cropperModal.src}
              onCrop={handleCroppedImage}
              onCancel={() => setCropperModal({ isOpen: false, src: null })}
            />
          </div>
        </div>
      )}

      <style>{`
        .profileGipp > li { font-size: 1rem; }
        .btn-close-menu { top: 1rem; right: 1rem; }
        .image-background-peg-pese {
          background-image: url("http://gigpp.com.br:72/GLOBAL/View/EPP_XXIII/static/media/pegpese_bolonha.bc54fd2a07e8fce715b5.jpg");
        }

        button-photo {
          font-size: 25px;
        }
        
        /* --- ESTILOS PARA O MODAL DE RECORTE --- */
        .cropper-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .cropper-modal-content {
          max-width: 95vw;
          max-height: 95vh;
        }
      `}</style>
    </React.Fragment>
  );
};

export default ProfileGIPP;
