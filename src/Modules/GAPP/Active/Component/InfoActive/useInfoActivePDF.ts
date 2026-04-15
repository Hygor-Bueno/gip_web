import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActiveTableData } from '../../Interfaces/Interfaces';
import { formatDate, formatCurrency } from './helpers';

const logoSrc = require('../../../../../Assets/Image/peg_pese_logo.png') as string;

function loadImageAsBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

export const useInfoActivePDF = (data: ActiveTableData) => {
  const handleDownloadPDF = async () => {
    const active   = data.active  as any;
    const vehicle  = data.vehicle;
    const insurance = data.insurance;

    const doc       = new jsPDF({ orientation: 'landscape', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today     = new Date().toLocaleDateString('pt-BR');
    const brand     = active?.brand ?? 'ativo';
    const model     = active?.model ?? '';

    // ── Logo ────────────────────────────────────────────────
    const logoBase64 = await loadImageAsBase64(logoSrc);
    if (logoBase64) {
      const logoSize = 22;
      doc.addImage(logoBase64, 'PNG', pageWidth - logoSize - 10, 6, logoSize, logoSize);
    }

    // ── Header text ─────────────────────────────────────────
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Relatório de Ativo', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${today}`, 14, 25);
    doc.text(`${brand} ${model}`.trim(), 14, 31);

    const table = (startY: number, head: string, rows: [string, string][], color: [number, number, number]) => {
      autoTable(doc, {
        startY,
        head:  [[head, '']],
        body:  rows,
        headStyles:    { fillColor: color },
        columnStyles:  { 0: { fontStyle: 'bold', cellWidth: 60 } },
        theme: 'striped',
      });
      return (doc as any).lastAutoTable.finalY + 8;
    };

    let y = 38;

    y = table(y, 'Identificação', [
      ['Marca',              active?.brand              ?? '—'],
      ['Modelo',             active?.model              ?? '—'],
      ['Nº Nota Fiscal',     active?.number_nf          ?? '—'],
      ['Data de Compra',     formatDate(active?.date_purchase) || '—'],
      ['Valor de Compra',    formatCurrency(active?.value_purchase) || '—'],
      ['Status',             active?.status_active === '1' ? 'Ativo' : active?.status_active ? 'Inativo' : '—'],
      ['Tipo de Ativo',      active?.desc_active_class  ?? '—'],
      ['É Veículo',          active?.is_vehicle === true || active?.is_vehicle === '1' || active?.is_vehicle === 1 ? 'Sim' : 'Não'],
      ['Responsável',        active?.name               ?? '—'],
      ['Última Atualização', formatDate(active?.change_date) || '—'],
    ], [22, 163, 74]);

    y = table(y, 'Localização / Organização', [
      ['Empresa',           active?.corporate_name ?? active?.fantasy_name ?? 'Peg Pese'],
      ['Unidade',           active?.unit_name   ?? '—'],
      ['Departamento',      active?.dep_id_fk   ?? '—'],
      ['Grupo de Trabalho', active?.group_name  ?? '—'],
    ], [37, 99, 235]);

    if (vehicle && Object.keys(vehicle).length > 0) {
      y = table(y, 'Veículo', [
        ['Placa',                vehicle.license_plates  ?? '—'],
        ['Ano',                  String(vehicle.year     ?? '—')],
        ['Ano Modelo',           String(vehicle.year_model ?? '—')],
        ['Chassi',               vehicle.chassi          ?? '—'],
        ['Renavam',              vehicle.renavam         ?? '—'],
        ['Cor',                  vehicle.color           ?? '—'],
        ['Combustível',          vehicle.fuel_type       ?? '—'],
        ['Potência',             String(vehicle.power    ?? '—')],
        ['Cilindradas',          String(vehicle.cylinder ?? '—')],
        ['Tabela FIPE',          String(vehicle.fipe_table ?? '—')],
        ['Blindagem',            vehicle.shielding === true ? 'Sim' : vehicle.shielding === false ? 'Não' : '—'],
        ['Última Revisão (Data)', formatDate(vehicle.last_revision_date as string | undefined) || '—'],
        ['Última Revisão (Km)',  String(vehicle.last_revision_km ?? '—')],
        ['Próxima Revisão (Data)', formatDate(vehicle.next_revision_date as string | undefined) || '—'],
        ['Próxima Revisão (Km)', String(vehicle.next_revision_km ?? '—')],
      ], [8, 145, 178]);
    }

    if (insurance?.id_insurance) {
      y = table(y, 'Seguro', [
        ['Seguradora',       insurance.ins_name        ?? '—'],
        ['Corretora',        insurance.broker_name     ?? '—'],
        ['Nº Apólice',       insurance.policy_number   ?? '—'],
        ['Nº Proposta',      insurance.proposal_number ?? '—'],
        ['Vigência Início',  formatDate(insurance.date_init)  || '—'],
        ['Vigência Fim',     formatDate(insurance.date_final) || '—'],
        ['Valor do Seguro',  formatCurrency(insurance.insurance_value) || '—'],
        ['Cobertura',        insurance.cov_name        ?? '—'],
        ['Forma de Pgto',    insurance.form_payment    ?? '—'],
        ['IOF',              formatCurrency(insurance.IOF_value) || '—'],
        ['Assistência 24h',  insurance.assist_24hrs    ?? '—'],
        ['Carro Reserva',    insurance.backup_car      ?? '—'],
        ['Vidros',           insurance.glasses         ?? '—'],
        ['Danos Corporais',  formatCurrency(insurance.bodily_damages) || '—'],
        ['Danos Morais',     formatCurrency(insurance.moral_damages)  || '—'],
        ['Danos Materiais',  formatCurrency(insurance.property_damage) || '—'],
        ['KM Reboque',       insurance.km_Trailer      ?? '—'],
        ['CEP de Risco',     insurance.risk_cep        ?? '—'],
        ['Utilização',       insurance.util_name       ?? '—'],
      ], [220, 38, 38]);

      if (insurance.franchise_list?.list?.length) {
        table(y, 'Franquias do Seguro',
          insurance.franchise_list.list.map((item, i) => [
            item.description || `Franquia ${i + 1}`,
            formatCurrency(item.value) || item.value || '—',
          ]),
          [220, 38, 38],
        );
      }
    }

    doc.save(`ativo-${brand}-${model}.pdf`.replace(/\s+/g, '-').toLowerCase());
  };

  return { handleDownloadPDF };
};
