interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, subtitle, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
