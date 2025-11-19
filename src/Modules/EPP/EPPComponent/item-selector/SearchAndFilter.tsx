import React from "react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategoria: string;
  onCategoriaChange: (value: string) => void;
  categorias: string[];
};

export const SearchAndFilter: React.FC<Props> = ({
  search,
  onSearchChange,
  selectedCategoria,
  onCategoriaChange,
  categorias,
}) => {
  return (
    <div className="row mb-4">
      <div className="col-12 col-md-6 mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Buscar código ou descrição..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
      </div>
      <div className="col-12 col-md-6">
        <select
          className="form-select form-select-lg"
          value={selectedCategoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
        >
          <option value="Todas">Todas as Categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
};