import "./modal.css";

type Props = {
  src: string;
  name: string;
  onClose: () => void;
};

function Modal({ name, src, onClose }: Props) {
  return (
    <div className="modal-container">
      <dialog open className="modal">
        <div className="modal-content">
          <header className="header">
            <span className="title">{name}</span>
            <button onClick={onClose}>Close</button>
          </header>

          <img className="image" src={src} />
        </div>
      </dialog>
    </div>
  );
}

export default Modal;
