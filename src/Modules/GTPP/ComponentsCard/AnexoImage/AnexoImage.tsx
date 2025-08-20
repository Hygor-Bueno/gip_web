import React, { useState } from 'react';

interface IAnexoImageProps {
  // This prop will be used to get the base64 image to send to the server
  getInviteImageOfServer?: (base64Image: string | null) => void;
  taskId?: string;
}

function AnexoImage(props: IAnexoImageProps) {
  const [image, setImage] = useState<string | null>(null); // For image preview
  const [base64Image, setBase64Image] = useState<string | null>(null); // For base64 image
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To show error messages

  // Handle file input change (when user selects a file)
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    
    // Reset the error message on every new selection
    setErrorMessage(null);
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        // Check if the file is an image type
        setErrorMessage('Please select a valid image file (JPEG, PNG, GIF).');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result?.toString() || ''); // Save base64 image data
        setImage(URL.createObjectURL(file)); // Set the image preview
        setIsModalOpen(true); // Open the modal to show the image
      };
      reader.readAsDataURL(file); // Convert the file to base64 string
    }
  };

  // Close the modal and reset image states
  const closeModal = () => {
    setIsModalOpen(false);
    setImage(null);
    setBase64Image(null);
  };

  return (
    <div>
      <label className="file-input-container">
        <div className="fa fa-paperclip p-2 cursor-pointer" />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>

      {/* Display error message if the file is invalid */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Modal to show image preview and save options */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content rounded" onClick={(e) => e.stopPropagation()}>
            <h3>Imagem anexada</h3>
            <img
              className="rounded"
              src={image || ''}
              alt="Imagem selecionada"
              style={{ width: '100%', maxWidth: '500px' }}
            />
            <div className="d-flex justify-content-between mt-3">
              <div>
                <button
                  onClick={() => {
                    if (props.getInviteImageOfServer) {
                      props.getInviteImageOfServer(base64Image); // Send base64 image to parent
                    }
                    closeModal(); // Close modal after saving
                  }} className="btn btn-success">Salvar</button>
              </div>
              <div>
                <button onClick={closeModal} className="btn btn-danger">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnexoImage;
