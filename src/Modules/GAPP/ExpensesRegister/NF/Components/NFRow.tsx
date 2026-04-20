import React from "react";
import { INFItem } from "../Interfaces/InterfaceNF";
import { formatBRL } from "../utils";

interface NFRowProps {
  nf: INFItem;
  onEdit: (nf: INFItem) => void;
}

export function NFRow({ nf, onEdit }: NFRowProps): JSX.Element {
  return (
    <tr>
      <td>{nf.number_nf}</td>
      <td className="nf-key-cell" title={nf.nf_key}>{nf.nf_key}</td>
      <td>{formatBRL(nf.total_liq)}</td>
      <td>
        <button className="nf-edit-btn" type="button" onClick={() => onEdit(nf)} title="Editar NF">
          <i className="fa fa-pen-to-square" />
        </button>
      </td>
    </tr>
  );
}
