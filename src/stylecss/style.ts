export const styleStringFunction = () => {
  return `
    /* --- Paleta e Fontes com Estilo de Jornal --- */
    :root {
      /* CORES: Paleta em escala de cinza para um visual clássico */
      --cor-cabecalho: #111111;
      --cor-texto: #222222;
      --cor-fundo: #f9f5f0; /* Um tom de papel envelhecido */
      --cor-fundo-tabela: #ffffff;
      --cor-borda: #cccccc;
      --cor-borda-cabecalho: #000000;

      /* FONTES: Fontes com serifa do Google Fonts */
      --fonte-titulos: 'Merriweather', serif;
      --fonte-corpo: 'Lora', serif;
    }

    /* --- Estilos Gerais --- */
    * {
      box-sizing: border-box;
    }

    body {
      font-family: var(--fonte-corpo);
      background-color: var(--cor-fundo);
      color: var(--cor-texto);
      margin: 0;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    /* --- Container e Cabeçalho do Relatório --- */
    .report-container {
      max-width: 800px;
      margin: 30px auto;
      background: var(--cor-fundo-tabela);
      border: 1px solid var(--cor-borda);
      /* EFEITO: Removido box-shadow e border-radius para um look reto */
    }

    .report-header {
      padding: 25px 30px;
      background: var(--cor-fundo-tabela);
      color: var(--cor-cabecalho);
      /* EFEITO: Borda dupla, um clássico de jornais */
      border-bottom: 4px double var(--cor-borda-cabecalho);
    }

    .report-header h1 {
      font-family: var(--fonte-titulos);
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .report-header p {
      margin: 8px 0 0;
      font-size: 15px;
      font-style: italic;
      color: #555;
    }

    .table-content {
      padding: 10px 30px 30px 30px;
    }

    /* --- Estilo da Tabela --- */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--cor-borda);
    }

    thead th {
      font-family: var(--fonte-titulos);
      font-weight: 700;
      font-size: 14px;
      color: var(--cor-cabecalho);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid var(--cor-cabecalho);
    }

    /* EFEITO: Removido o efeito zebrado para um visual mais tradicional */
    tbody tr:hover {
      background-color: #f5f5f5; /* Hover sutil para usabilidade */
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    /* --- Design Responsivo (Ajustado para o novo tema) --- */
    @media screen and (max-width: 768px) {
      body {
        padding: 0;
      }

      .report-container {
        margin: 0;
        border: none;
      }

      .report-header, .table-content {
        padding: 20px;
      }

      table, thead, tbody, th, td, tr {
        display: block;
      }

      thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }

      tr {
        border: 1px solid var(--cor-borda);
        margin-bottom: 15px;
      }

      td {
        border: none;
        border-bottom: 1px dotted var(--cor-borda);
        position: relative;
        padding-left: 50%;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        text-align: right;
      }

      td:last-child {
        border-bottom: none;
      }

      td::before {
        content: attr(data-label);
        position: absolute;
        left: 15px;
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
        font-weight: 700;
        font-family: var(--fonte-titulos);
        color: var(--cor-texto);
        text-align: left;
      }
    }

    /* --- Estilos para Impressão (Mantidos e otimizados) --- */
    @media print {
      body {
        background: #fff;
        padding: 0;
        margin: 0;
        font-family: Georgia, 'Times New Roman', Times, serif; /* Fonte segura para impressão */
      }

      .report-container {
        box-shadow: none;
        border: 1px solid #000;
        margin: 0;
        max-width: 100%;
      }

      .report-header {
        background: #fff !important;
        border-bottom: 2px solid #000 !important;
      }

      thead th {
        border-bottom: 2px solid #000;
      }
      
      tr, th, td {
        page-break-inside: avoid;
      }
      
      * {
        background: transparent !important;
        color: #000 !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
    }
  `;
};