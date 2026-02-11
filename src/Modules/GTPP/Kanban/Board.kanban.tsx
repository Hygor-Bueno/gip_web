import React from "react";
import Column from "./Column.kanban";
import { ColumnType } from "./types";

interface Props {
  columns: ColumnType[];
}

const Board: React.FC<Props> = ({ columns }) => {
  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-950">
      
      {/* Container com scroll */}
      <div className="h-full w-full overflow-x-auto overflow-y-hidden">
        
        {/* Linha das colunas */}
        <div className="flex gap-4 p-4 h-full w-fit">
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Board;
