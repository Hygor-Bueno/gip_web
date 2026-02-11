import React from "react";
import { CardType } from "./types";

interface Props {
  card: CardType;
}

const priorityStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

const Card: React.FC<Props> = ({ card }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {card.title}
        </h3>

        <span
          className={`text-[10px] px-2 py-1 rounded-full font-medium ${priorityStyles[card.priority]}`}
        >
          {card.priority.toUpperCase()}
        </span>
      </div>

      {card.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {card.description}
        </p>
      )}

      {/* Progresso */}
      <div className="mb-3">
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-1.5 bg-blue-600 rounded-full transition-all"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400">
        <span>{card.progress}%</span>

        {card.dueDate && (
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {card.dueDate}
          </span>
        )}
      </div>
    </div>
  );
};

export default Card;
