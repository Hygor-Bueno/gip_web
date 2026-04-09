import React, { useState, useRef, useEffect, useCallback } from "react";
import "./CnpjFilterInput.css";

// ── CNPJ mask ────────────────────────────────────────────────────────────────
export function maskCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <=  2) return d;
  if (d.length <=  5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <=  8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

// ── CNPJ checksum validation ─────────────────────────────────────────────────
export function validateCnpj(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;

  const calc = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((acc, n, i) => acc + Number(n) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calc(d.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
  const d2 = calc(d.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  return d1 === Number(d[12]) && d2 === Number(d[13]);
}

// ─────────────────────────────────────────────────────────────────────────────
interface CnpjFilterInputProps {
  value:   string;
  onChange: (raw: string) => void;  // raw = stripped digits for filtering
  cnpjs:   string[];                // existing CNPJs from dataset
}

const CnpjFilterInput: React.FC<CnpjFilterInputProps> = ({ value, onChange, cnpjs }) => {
  const [display,   setDisplay]   = useState(value ? maskCnpj(value) : "");
  const [open,      setOpen]      = useState(false);
  const [query,     setQuery]     = useState("");
  const containerRef              = useRef<HTMLDivElement>(null);

  // sync display when external clear (value="")
  useEffect(() => {
    if (!value) { setDisplay(""); setQuery(""); }
  }, [value]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked  = maskCnpj(e.target.value);
    const raw     = masked.replace(/\D/g, "");
    setDisplay(masked);
    setQuery(raw);
    onChange(raw);
    setOpen(raw.length > 0);
  }, [onChange]);

  const handleSelect = useCallback((cnpj: string) => {
    const masked = maskCnpj(cnpj);
    const raw    = cnpj.replace(/\D/g, "");
    setDisplay(masked);
    setQuery(raw);
    onChange(raw);
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setDisplay("");
    setQuery("");
    onChange("");
    setOpen(false);
  }, [onChange]);

  const rawDigits  = display.replace(/\D/g, "");
  const isFull     = rawDigits.length === 14;
  const isValid    = isFull && validateCnpj(rawDigits);
  const isInvalid  = isFull && !isValid;

  const suggestions = cnpjs.filter(c => c.replace(/\D/g, "").includes(query) && query.length > 0);

  return (
    <div className="cnpj-filter-wrap" ref={containerRef}>
      <div className={`cnpj-filter-input-row ${isValid ? "cnpj--valid" : ""} ${isInvalid ? "cnpj--invalid" : ""}`}>
        <input
          className="filter-input cnpj-filter-input"
          type="text"
          placeholder="00.000.000/0000-00"
          value={display}
          onChange={handleInput}
          onFocus={() => query.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {isFull && (
          <span className={`cnpj-badge ${isValid ? "cnpj-badge--ok" : "cnpj-badge--err"}`}>
            <i className={`fa fa-${isValid ? "check" : "times"}`}></i>
          </span>
        )}
        {display && (
          <button className="cnpj-clear" onClick={handleClear} tabIndex={-1} title="Limpar">
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="cnpj-dropdown">
          {suggestions.map(c => (
            <li key={c} className="cnpj-dropdown-item" onMouseDown={() => handleSelect(c)}>
              {maskCnpj(c)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CnpjFilterInput;
