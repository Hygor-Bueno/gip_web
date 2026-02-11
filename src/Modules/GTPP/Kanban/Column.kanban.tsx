import React from "react";
import Card from "./Card.kanban";
import { ColumnType } from "./types";

interface Props {
  column: ColumnType;
}

const Column: React.FC<Props> = ({ column }) => {
  return (
<div className="flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-2xl p-4 w-80 min-w-[20rem] max-h-[calc(100vh-140px)]">
      
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {column.title}
        </h2>
        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {column.cards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default Column;
