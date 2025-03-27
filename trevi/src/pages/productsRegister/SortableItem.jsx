import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash } from "react-icons/fi";

const SortableItem = ({ id, file, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 0.25s ease",
  };

  // Verifica se `file` é um objeto File ou se já contém uma URL
  const imageUrl = file instanceof File ? URL.createObjectURL(file) : file.url || file;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-item"
    >
      <img src={imageUrl} alt={file.name || "Imagem"} className="sortable-image" />
      <button
        type="button"
        className="remove-button"
        onClick={() => onRemove(file.name || file.url)} // Garante um identificador único
      >
        <FiTrash size={16} />
      </button>
    </div>
  );
};

export default SortableItem;
