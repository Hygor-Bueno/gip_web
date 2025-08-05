import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import NavBar from "../../Components/NavBar";
import { useMyContext } from "../../Context/MainContext";
import { useConnection } from "../../Context/ConnContext";
import { IMAGE_WEBP_QUALITY } from "../../Util/Util";
import { InputCheckButton } from "../../Components/CustomButton";
import useWindowSize from "../GAPP/Business/hook/useWindowSize";

// --- COMPONENTE DE RECORTE DE IMAGEM (INTEGRADO) ---
interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

/**
 * @interface ImageCropperProps
 * @property {string} imageSrc - A URL da imagem que será exibida para recorte (geralmente um Base64).
 * @property {(croppedImage: string) => void} onCrop - Função de callback que é chamada quando a imagem é recortada.
 * Recebe a imagem recortada como uma string Base64.
 * @property {() => void} onCancel - Função de callback chamada quando o usuário cancela o recorte.
 */

/**
 * @param {ImageCropperProps} props
 * @returns {React.FC<ImageCropperProps>} Um componente React para recorte de imagens.
 *
 * @description
 * O componente `ImageCropper` oferece uma interface interativa para que os usuários possam
 * selecionar uma porção de uma imagem. Ele utiliza um `<canvas>` HTML para desenhar e
 * manipular a imagem, permitindo arrastar e visualizar a área de recorte.
 *
 * Ele é "integrado" porque foi pensado para ser usado dentro de outro componente, como um modal.
 */
const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
    // --- CONSTANTES DE DIMENSÃO ---

    const {isMobile} = useWindowSize();

    /** @constant {number} CANVAS_WIDTH - Largura fixa do canvas onde a imagem será desenhada. */
    const CANVAS_WIDTH = Math.min(isMobile ? 300 : 500, window.innerWidth * 0.8);
    /** @constant {number} CANVAS_HEIGHT - Altura fixa do canvas onde a imagem será desenhada. */
    const CANVAS_HEIGHT = CANVAS_WIDTH * 1;
    /** @constant {number} CROP_SIZE - Tamanho (largura e altura) do quadrado de recorte. */
    const CROP_SIZE = Math.min(700, CANVAS_WIDTH * 0.8);

    // --- REFERÊNCIAS DOM ---
    /**
     * @type {React.RefObject<HTMLCanvasElement>} canvasRef - Ref para o elemento HTML `<canvas>`.
     * Usamos `useRef` para acessar diretamente o elemento DOM do canvas.
     */
    const canvasRef = useRef<HTMLCanvasElement>(null);
    /**
     * @type {React.MutableRefObject<HTMLImageElement | null>} imageRef - Ref para a imagem sendo carregada no canvas.
     * Guarda a instância do objeto `Image` para que possamos desenhá-la no canvas.
     */
    const imageRef = useRef<HTMLImageElement | null>(null);

    // --- ESTADOS DO COMPONENTE ---
    /**
     * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} isDragging - Estado que indica se o usuário está arrastando a imagem.
     */
    const [isDragging, setIsDragging] = useState(false);
    /**
     * @type {[{x: number, y: number}, React.Dispatch<React.SetStateAction<{x: number, y: number}>>]} imageOffset - Posição X e Y da imagem dentro do canvas.
     * É por meio desse estado que a imagem se move.
     */
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
    /**
     * @type {[{x: number, y: number, initialOffsetX: number, initialOffsetY: number}, React.Dispatch<React.SetStateAction<{x: number, y: number, initialOffsetX: number, initialOffsetY: number}>>]} dragStart - Guarda a posição inicial do mouse e do offset da imagem quando o arrasto começa.
     * Essencial para calcular o quanto a imagem deve se mover.
     */
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });

    const [scale, setScale] = useState(1);

    const [pinchStartDistance, setPitchStartDistance] = useState<number | null> (null);
    const [initialScale, setInitialScale] = useState(1);

    /**
     * @function drawCanvas
     * @param {{x: number, y: number}} currentOffset - O deslocamento atual da imagem no canvas.
     * @returns {void}
     * @description
     * Esta função é responsável por desenhar a imagem e a área de recorte no canvas.
     * É aqui que a mágica acontece!
     * 1. Limpa o canvas.
     * 2. Desenha a imagem na posição `currentOffset.x` e `currentOffset.y`.
     * 3. Calcula a posição do quadrado de recorte no centro do canvas.
     * 4. Desenha uma borda tracejada vermelha para indicar a área de recorte.
     */
    const drawCanvas = (currentOffset: { x: number; y: number }, currentScale: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaledWidth = imageRef.current.width * currentScale;
        const scaledHeight = imageRef.current.height * currentScale;

        // AQUI É ONDE A MÁGICA ACONTECE!
        // `drawImage` é uma função do contexto 2D do canvas que desenha uma imagem.
        // ctx.drawImage(imageRef.current, currentOffset.x, currentOffset.y);
        ctx.drawImage(imageRef.current, currentOffset.x, currentOffset.y, scaledWidth, scaledHeight);

        const cropX = (canvas.width - CROP_SIZE) / 2;
        const cropY = (canvas.height - CROP_SIZE) / 2;

        // Estilos para a área de recorte
        ctx.strokeStyle = 'red'; // Cor da borda
        ctx.lineWidth = 2;       // Espessura da borda
        ctx.setLineDash([5, 5]); // Define um padrão de linha tracejada (5px de linha, 5px de espaço)
        ctx.strokeRect(cropX, cropY, CROP_SIZE, CROP_SIZE); // Desenha o retângulo de recorte
    };

    /**
     * @hook useEffect
     * @description
     * Este `useEffect` é executado apenas uma vez quando o componente é montado
     * ou quando `imageSrc` muda. Ele carrega a imagem, define o `imageRef` e
     * calcula a posição inicial da imagem para centralizá-la no canvas.
     * Depois de carregar, ele chama `drawCanvas` para renderizar a imagem.
     */
    useEffect(() => {
        const img = new Image(); // Cria um novo objeto Image
        img.src = imageSrc;      // Define a fonte da imagem
        img.onload = () => {
            imageRef.current = img;
            const canvas = canvasRef.current;
            if (!canvas) return;

            // 1. Calcule o fator de escala inicial para cobrir o CROP_SIZE
            const scaleX = CROP_SIZE / img.width;
            const scaleY = CROP_SIZE / img.height;
            const initialScale = Math.max(scaleX, scaleY); // Usa o maior fator para cobrir a área de recorte

            // 2. Calcule o offset inicial com base na nova escala
            const scaledWidth = img.width * initialScale;
            const scaledHeight = img.height * initialScale;
            
            // Centraliza a imagem escalada dentro da área de recorte
            const initialOffset = {
                x: (CANVAS_WIDTH - scaledWidth) / 2,
                y: (CANVAS_HEIGHT - scaledHeight) / 2,
            };

            // 3. Atualize os estados
            setScale(initialScale);
            setImageOffset(initialOffset);
            drawCanvas(initialOffset, initialScale);
        };
    }, [imageSrc]); // Dependência: só roda de novo se imageSrc mudar

    /**
     * @hook useEffect
     * @description
     * Este `useEffect` é executado toda vez que `imageOffset` muda.
     * Ele redesenha a imagem no canvas com a nova posição.
     * Isso garante que a imagem se mova suavemente enquanto o usuário arrasta.
     */
    useEffect(() => {
      if (imageRef.current) {
          // Chame com o scale atual
          drawCanvas(imageOffset, scale);
      }
    }, [imageOffset, scale]); // Dependência: roda toda vez que imageOffset muda


    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      const newScale = e.deltaY < 0 ? scale + zoomFactor : scale - zoomFactor;
      const newScaleCapped = Math.max(0.1, Math.min(newScale, 5));
      setScale(newScaleCapped);
    }

    /**
     * @function handleMouseDown
     * @param {React.MouseEvent<HTMLCanvasElement>} e - Evento de clique do mouse.
     * @returns {void}
     * @description
     * Chamado quando o botão do mouse é pressionado sobre o canvas.
     * Inicia o processo de arrasto, definindo `isDragging` para `true` e
     * registrando as posições iniciais do mouse e da imagem.
     */
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({
            x: e.nativeEvent.offsetX, // Posição X do mouse relativa ao elemento
            y: e.nativeEvent.offsetY, // Posição Y do mouse relativa ao elemento
            initialOffsetX: imageOffset.x, // Posição inicial X da imagem
            initialOffsetY: imageOffset.y, // Posição inicial Y da imagem
        });
    };

    // ##### START MOBILE ###### 

    // Funções auxiliares para obter a posição do evento
    const getEventCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      // Se for um evento de toque, pegue o primeiro toque da lista
      if ('touches' in e) {
        const touch = e.touches[0];
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }

      // Se for um evento de mouse, use offsetX e offsetY
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    };


    // const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    //   e.preventDefault();
    //   setIsDragging(true);
    //   const coords = getEventCoords(e);
    //   setDragStart({
    //     x: coords.x,
    //     y: coords.y,
    //     initialOffsetX: imageOffset.x,
    //     initialOffsetY: imageOffset.y
    //   });
    // }

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // Se houver dois dedos, inicie o zoom por pinça
        if (e.touches.length === 2) {
            setIsDragging(false); // Desativa o arrasto para não entrar em conflito com o zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            setPitchStartDistance(distance);
            setInitialScale(scale); // Guarda a escala atual
        } 
        // Se houver apenas um dedo, inicie o arrasto
        else if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            setDragStart({
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                initialOffsetX: imageOffset.x,
                initialOffsetY: imageOffset.y,
            });
        }
    };

    // const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    //     e.preventDefault();
    //     if (!isDragging || !imageRef.current) return;
    //     const coords = getEventCoords(e);
    //     const dx = coords.x - dragStart.x;
    //     const dy = coords.y - dragStart.y;

    //     let newOffsetX = dragStart.initialOffsetX + dx;
    //     let newOffsetY = dragStart.initialOffsetY + dy;

    //     // lógica de limitação de movimento aqui
    //     const cropX = (CANVAS_WIDTH - CROP_SIZE) / 2;
    //     const cropY = (CANVAS_HEIGHT - CROP_SIZE) / 2;
    //     const scaleWidth = imageRef.current.width * scale;
    //     const scaleHeight = imageRef.current.height * scale;
        
    //     newOffsetX = Math.min(newOffsetX, cropX);
    //     newOffsetY = Math.min(newOffsetY, cropY);
    //     newOffsetX = Math.max(newOffsetX, cropX + CROP_SIZE - scaleWidth);
    //     newOffsetY = Math.max(newOffsetY, cropY + CROP_SIZE - scaleHeight);

    //     setImageOffset({ x: newOffsetX, y: newOffsetY });
    // };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();

        // Lógica para o zoom (pinça)
        if (e.touches.length === 2 && pinchStartDistance !== null) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const newDistance = Math.sqrt(dx * dx + dy * dy);

            const zoomFactor = newDistance / pinchStartDistance;
            const newScale = initialScale * zoomFactor;

            // Limita o zoom para evitar que a imagem desapareça ou fique gigante demais
            const newScaleCapped = Math.max(1, Math.min(newScale, 5));
            setScale(newScaleCapped);
        } 
        // Lógica para o arrasto (pan)
        else if (isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            const dx = (touch.clientX - rect.left) - dragStart.x;
            const dy = (touch.clientY - rect.top) - dragStart.y;

            let newOffsetX = dragStart.initialOffsetX + dx;
            let newOffsetY = dragStart.initialOffsetY + dy;

            //@ts-ignore
            const scaledWidth = imageRef.current.width * scale;

            //@ts-ignore
            const scaledHeight = imageRef.current.height * scale;

            const cropX = (CANVAS_WIDTH - CROP_SIZE) / 2;
            const cropY = (CANVAS_HEIGHT - CROP_SIZE) / 2;

            newOffsetX = Math.min(newOffsetX, cropX);
            newOffsetY = Math.min(newOffsetY, cropY);
            newOffsetX = Math.max(newOffsetX, cropX + CROP_SIZE - scaledWidth);
            newOffsetY = Math.max(newOffsetY, cropY + CROP_SIZE - scaledHeight);
            

            setImageOffset({ x: newOffsetX, y: newOffsetY });
        }
    };

    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchCancel = () => setIsDragging(false);

    // ##### END MOBILE ###### 

    /**
     * @function handleMouseMove
     * @param {React.MouseEvent<HTMLCanvasElement>} e - Evento de movimento do mouse.
     * @returns {void}
     * @description
     * Chamado quando o mouse é movido sobre o canvas ENQUANTO o botão está pressionado.
     * Calcula o deslocamento da imagem com base no movimento do mouse e atualiza `imageOffset`.
     * Assegura que a imagem não saia da área de recorte, limitando seus movimentos.
     */
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !imageRef.current) return; // Só move se estiver arrastando e a imagem existir

        const dx = e.nativeEvent.offsetX - dragStart.x; // Variação em X
        const dy = e.nativeEvent.offsetY - dragStart.y; // Variação em Y

        let newOffsetX = dragStart.initialOffsetX + dx;
        let newOffsetY = dragStart.initialOffsetY + dy;

        const cropX = (CANVAS_WIDTH - CROP_SIZE) / 2;
        const cropY = (CANVAS_HEIGHT - CROP_SIZE) / 2;

        // Limita o movimento da imagem para que a área de recorte
        // sempre contenha parte da imagem.
        newOffsetX = Math.min(newOffsetX, cropX); // Não permite mover a imagem muito para a direita
        newOffsetY = Math.min(newOffsetY, cropY); // Não permite mover a imagem muito para baixo
        // newOffsetX = Math.max(newOffsetX, cropX + CROP_SIZE - imageRef.current.width); // Não permite mover a imagem muito para a esquerda
        // newOffsetY = Math.max(newOffsetY, cropY + CROP_SIZE - imageRef.current.height); // Não permite mover a imagem muito para cima

        const scaledWidth = imageRef.current.width * scale;
        const scaledHeight = imageRef.current.height * scale;

        newOffsetX = Math.max(newOffsetX, cropX + CROP_SIZE - scaledWidth);
        newOffsetY = Math.max(newOffsetY, cropY + CROP_SIZE - scaledHeight);

        setImageOffset({ x: newOffsetX, y: newOffsetY }); // Atualiza a posição da imagem
    };

    /**
     * @function handleMouseUp
     * @returns {void}
     * @description
     * Chamado quando o botão do mouse é liberado.
     * Finaliza o processo de arrasto, definindo `isDragging` para `false`.
     */
    const handleMouseUp = () => setIsDragging(false);

    /**
     * @function handleCrop
     * @returns {void}
     * @description
     * Chamado quando o botão "Recortar e Salvar" é clicado.
     * 1. Cria um novo canvas temporário do tamanho exato da área de recorte.
     * 2. Desenha APENAS a porção da imagem que está dentro da área de recorte nesse novo canvas.
     * 3. Converte o conteúdo do novo canvas para uma string Base64 no formato WebP.
     * 4. Chama a função `onCrop` passada via props com a imagem recortada.
     */
    // const handleCrop = () => {
    //     if (!imageRef.current) return;

    //     const resultCanvas = document.createElement('canvas'); // Cria um canvas temporário
    //     resultCanvas.width = CROP_SIZE;
    //     resultCanvas.height = CROP_SIZE;
    //     const resultCtx = resultCanvas.getContext('2d');
    //     if (!resultCtx) return;

    //     // Calcula a posição da área de recorte no canvas principal
    //     const cropXOnCanvas = (CANVAS_WIDTH - CROP_SIZE) / 2;
    //     const cropYOnCanvas = (CANVAS_HEIGHT - CROP_SIZE) / 2;

        
    //     // Calcula a fonte (source) da imagem a ser copiada para o canvas de resultado
    //     const sourceX = (cropXOnCanvas - imageOffset.x) / scale;
    //     const sourceY = (cropYOnCanvas - imageOffset.y) / scale;

    //     // novos
    //     const sourceWidth = CROP_SIZE / scale;
    //     const sourceHeight = CROP_SIZE / scale;

    //     // Desenha a porção da imagem recortada no novo canvas
    //     // resultCtx.drawImage(
    //     //     imageRef.current,
    //     //     sourceX, sourceY, // Posição de início da cópia na imagem original
    //     //     CROP_SIZE, CROP_SIZE, // Largura e altura da porção a ser copiada
    //     //     0, 0, // Posição de início do desenho no canvas de resultado
    //     //     CROP_SIZE, CROP_SIZE // Largura e altura para desenhar no canvas de resultado
    //     // );

    //     resultCtx.drawImage(
    //       imageRef.current,
    //       sourceX, sourceY, // Posição de início da cópia na imagem original (dividida pelo scale)
    //       sourceWidth, sourceHeight, // Largura e altura da porção a ser copiada
    //       0, 0,
    //       CROP_SIZE, CROP_SIZE
    //     );

    //     // Converte o canvas de resultado para Base64 (WebP com qualidade definida)
    //     const webpData = resultCanvas.toDataURL('image/webp', IMAGE_WEBP_QUALITY);
    //     onCrop(webpData); // Chama o callback com a imagem recortada
    // };

    const handleCrop = () => {
        if (!imageRef.current) return;

        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = CROP_SIZE;
        resultCanvas.height = CROP_SIZE;
        const resultCtx = resultCanvas.getContext('2d');
        if (!resultCtx) return;

        // A lógica para o cropXOnCanvas e cropYOnCanvas continua a mesma
        const cropXOnCanvas = (CANVAS_WIDTH - CROP_SIZE) / 2;
        const cropYOnCanvas = (CANVAS_HEIGHT - CROP_SIZE) / 2;
        
        // As coordenadas da fonte e o tamanho agora precisam levar em conta o scale
        const sourceX = (cropXOnCanvas - imageOffset.x) / scale;
        const sourceY = (cropYOnCanvas - imageOffset.y) / scale;
        const sourceWidth = CROP_SIZE / scale;
        const sourceHeight = CROP_SIZE / scale;

        resultCtx.drawImage(
            imageRef.current,
            sourceX, sourceY, // Posição de início da cópia na imagem original (dividida pelo scale)
            sourceWidth, sourceHeight, // Largura e altura da porção a ser copiada
            0, 0,
            CROP_SIZE, CROP_SIZE
        );

        const webpData = resultCanvas.toDataURL('image/webp', IMAGE_WEBP_QUALITY);
        onCrop(webpData);
    };

    return (
        <div className="bg-white rounded shadow-xl p-4 sm:p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Posicione sua Foto</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg inline-block">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp} // Importante para parar o arrasto se o mouse sair do canvas
                    
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}

                    onWheel={handleWheel}

                    className="rounded cursor-move"
                />
            </div>
            <div className="mt-6 d-flex justify-content-center gap-4">
                <button onClick={onCancel} className="btn btn-danger px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold">
                    <i className="fa fa-x text-white"></i> Cancelar
                </button>
                <button onClick={handleCrop} className="btn button-photo btn-primary px-6 py-2 rounded-md text-white hover:opacity-90 font-semibold inline-flex items-center">
                    <i className="text-white fa fa-save"></i> Salvar
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
