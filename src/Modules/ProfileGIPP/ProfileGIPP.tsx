import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import NavBar from "../../Components/NavBar";
import { useMyContext } from "../../Context/MainContext";
import { useConnection } from "../../Context/ConnContext";
import { IMAGE_WEBP_QUALITY } from "../../Util/Util";
import { InputCheckButton } from "../../Components/CustomButton";

// --- ÍCONES USADOS NO COMPONENTE DE RECORTE ---
const IconCrop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3m-1-4V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 4h.01M16 16h.01" />
  </svg>
);

// --- COMPONENTE DE RECORTE DE IMAGEM (INTEGRADO) ---
interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 400;
  const CROP_SIZE = 300;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });

  const drawCanvas = (currentOffset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // AQUI É ONDE A MÁGICA ACONTECE!
    ctx.drawImage(imageRef.current, currentOffset.x, currentOffset.y);

    const cropX = (canvas.width - CROP_SIZE) / 2;
    const cropY = (canvas.height - CROP_SIZE) / 2;

    // 
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(cropX, cropY, CROP_SIZE, CROP_SIZE);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropX, cropY, CROP_SIZE, CROP_SIZE);
  };

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const initialOffset = {
        x: (canvas.width - img.width) / 2,
        y: (canvas.height - img.height) / 2,
      };
      setImageOffset(initialOffset);
      drawCanvas(initialOffset);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (imageRef.current) {
      drawCanvas(imageOffset);
    }
  }, [imageOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      initialOffsetX: imageOffset.x,
      initialOffsetY: imageOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageRef.current) return;

    const dx = e.nativeEvent.offsetX - dragStart.x;
    const dy = e.nativeEvent.offsetY - dragStart.y;

    let newOffsetX = dragStart.initialOffsetX + dx;
    let newOffsetY = dragStart.initialOffsetY + dy;
    
    const cropX = (CANVAS_WIDTH - CROP_SIZE) / 2;
    const cropY = (CANVAS_HEIGHT - CROP_SIZE) / 2;

    newOffsetX = Math.min(newOffsetX, cropX);
    newOffsetY = Math.min(newOffsetY, cropY);
    newOffsetX = Math.max(newOffsetX, cropX + CROP_SIZE - imageRef.current.width);
    newOffsetY = Math.max(newOffsetY, cropY + CROP_SIZE - imageRef.current.height);

    setImageOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCrop = () => {
    if (!imageRef.current) return;

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = CROP_SIZE;
    resultCanvas.height = CROP_SIZE;
    const resultCtx = resultCanvas.getContext('2d');
    if (!resultCtx) return;

    const cropXOnCanvas = (CANVAS_WIDTH - CROP_SIZE) / 2;
    const cropYOnCanvas = (CANVAS_HEIGHT - CROP_SIZE) / 2;
    const sourceX = cropXOnCanvas - imageOffset.x;
    const sourceY = cropYOnCanvas - imageOffset.y;

    resultCtx.drawImage(imageRef.current, sourceX, sourceY, CROP_SIZE, CROP_SIZE, 0, 0, CROP_SIZE, CROP_SIZE);
    
    const webpData = resultCanvas.toDataURL('image/webp', IMAGE_WEBP_QUALITY);
    onCrop(webpData);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Posicione sua Foto</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg inline-block">
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="rounded-md cursor-move"
            />
        </div>
        <div className="mt-6 flex justify-center gap-4">
            <button onClick={onCancel} className="btn btn-danger px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold">
                Cancelar
            </button>
            <button onClick={handleCrop} className="btn btn-primary px-6 py-2 rounded-md text-white hover:opacity-90 font-semibold inline-flex items-center">
                {/* <IconCrop /> */}
                Recortar e Salvar
            </button>
        </div>
    </div>
  );
};


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
          background-image: url("${process.env.REACT_APP_API_GIPP_BASE_URL}:${process.env.REACT_APP_API_GIPP_PORT_SERVER_INTRA}/View/CLPP/static/media/bg_interlagos.b58bb3c23877f2ddf775.jpg");
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
