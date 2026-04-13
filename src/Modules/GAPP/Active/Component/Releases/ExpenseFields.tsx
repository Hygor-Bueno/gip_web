import React from "react";
import CustomForm from "../../../../../Components/CustomForm";
import { Expense } from "./Interfaces";
import { Schema } from "../../Interfaces/Interfaces";
import { formExpense } from "./tabs/schemas/FormExpense.schema";

interface Props {
  expense: Expense;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  drivers: Schema[];
}

const ExpenseFields: React.FC<Props> = ({ expense, onChange, drivers }) => (
  <div className="rel-section">
    <p className="rel-section-title">
      <i className="fa fa-money"></i> Resumo da Despesa
    </p>
    <CustomForm
      notButton={false}
      className="row g-3"
      fieldsets={formExpense(expense, onChange, drivers)}
    />
  </div>
);

export default ExpenseFields;
