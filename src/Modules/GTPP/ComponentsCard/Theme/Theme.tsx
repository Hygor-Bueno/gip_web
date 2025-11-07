import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
require('./style.css');

const themeSchema = z.object({
  description: z.string().min(3, 'Mínimo 3 caracteres').max(500, 'Máximo 500 caracteres'),
});

type ThemeFormData = z.infer<typeof themeSchema>;

interface ModalThemeProps {
  taskId: number;
  onClose?: () => void;
  setSelectedTasks?: any;
}

export default function ModalTheme({ taskId, onClose, setSelectedTasks }: ModalThemeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
  });

  useEffect(() => {
    if (showModal) {
      setTimeout(() => setFocus('description'), 150);
    }
  }, [showModal, setFocus]);

  const handleAddTheme: SubmitHandler<ThemeFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      console.log('Novo tema salvo:', {
        ...data,
        task_id_fk: taskId,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
    onClose?.();
  };

  return (
    <div className="container mt-5 position-relative" style={{ zIndex: 1 }}>
      {showModal && (
        <Modal
          show={showModal}
          onHide={handleClose}
          centered
          size="lg"
          backdrop={false}
          contentClassName="border-0 shadow-2xl rounded-4"
          style={{ zIndex: 10000 }}
        >
          <Modal.Header
            closeButton
            className="bg-gradient text-white border-0 py-4 rounded-top-4"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <Modal.Title className="fw-bold fs-5">
              Novo Tema para Task #{taskId}
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={handleSubmit(handleAddTheme)} className="p-4 p-md-5">
            <Modal.Body className="pt-0 px-0">
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark d-flex align-items-center gap-1">
                  Descrição do Tema <span className="text-danger">*</span>
                </label>
                <textarea
                  {...register('description')}
                  className={`form-control form-control-lg shadow-sm ${
                    errors.description ? 'is-invalid' : ''
                  }`}
                  placeholder="Ex: Escreva um tema inicial"
                  rows={4}
                  style={{
                    borderRadius: '0.75rem',
                    border: '2px solid',
                    borderColor: errors.description ? '#dc3545' : '#ced4da',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}

                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d6efd';
                    e.target.style.boxShadow = '0 0 0 0.25rem rgba(13,110,253,.25)';
                  }}

                  onBlur={(e) => {
                    e.target.style.borderColor = errors.description ? '#dc3545' : '#ced4da';
                    e.target.style.boxShadow = 'none';
                  }}
                  
                />
                {errors.description && (
                  <div className="text-danger small mt-1">
                    {errors.description.message}
                  </div>
                )}
              </div>

              {/* Info: Task e User ID */}
              <div className="row w-100 overflow-hidden">
                <div className="col-6">
                  <small className="text-muted">Task ID:</small>
                  <div className="fw-bold">{taskId}</div>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-3 px-0 pb-0 d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-grow-1 fw-semibold"
                style={{ borderRadius: '0.75rem' }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 12px rgba(13,110,253,.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Tema'
                )}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
