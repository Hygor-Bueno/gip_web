import React, { useState, useEffect } from "react";
import CustomTable from "../../../Components/CustomTable";
import useEppFetchOrder from "../EPPFetch/useEppFetchOrder";
import { tItemTable } from "../../../types/types"; // ajuste o caminho se precisar

function TableClient() {
    const { allOrders } = useEppFetchOrder(); // já vem os dados da API aqui
    const [listaPedidos, setListaPedidos] = useState<tItemTable[]>([]);
    const [selectedPedido, setSelectedPedido] = useState<tItemTable | null>(null);

    // Função que transforma o JSON da API no formato que o CustomTable AMA
    const convertApiToTable = (apiData: any[]): tItemTable[] => {
        return apiData.map(item => ({
            idOrder: { value: item.idOrder, tag: "Pedido", ocultColumn: false, minWidth: "90px" },
            nameClient: { value: item.nameClient || "-", tag: "Cliente", ocultColumn: false, minWidth: "200px" },
            fone: { 
                value: item.fone ? `(${item.fone.slice(0,2)}) ${item.fone.slice(2,7)}-${item.fone.slice(7)}` : "-", 
                tag: "Telefone", ocultColumn: false 
            },
            deliveryDate: { 
                value: new Date(item.deliveryDate).toLocaleDateString('pt-BR'), 
                tag: "Data Entrega", ocultColumn: false, minWidth: "120px" 
            },
            deliveryHour: { value: item.deliveryHour, tag: "Horário", ocultColumn: false, minWidth: "90px" },
            deliveryStore: { value: item.deliveryStore, tag: "Loja", ocultColumn: false },
            total: { 
                value: `R$ ${parseFloat(item.total || 0).toFixed(2).replace('.', ',')}`, 
                tag: "Total", ocultColumn: false 
            },
            signalValue: { 
                value: `R$ ${parseFloat(item.signalValue || 0).toFixed(2).replace('.', ',')}`, 
                tag: "Sinal", ocultColumn: false 
            },
            pendingValue: {value: `R$ ${(item.total - item.signalValue || 0).toFixed(2).replace('.', ',')}`, tag: "Pendente", ocultColumn: false},
            description: { 
                value: item.description
                    ?.replace(/Cód\.: \d+\.\nDescrição: /g, "")
                    .replace(/ - \d+ Un\..*?\nSubtotal:.*?\n\n?/g, " • ")
                    .replace(/\n/g, " ")
                    .trim() || "Sem itens",
                tag: "Itens", ocultColumn: false, minWidth: "400px" 
            },
            obs: { 
                value: (item.obs || "").trim(), 
                tag: "Obs", 
                ocultColumn: !(item.obs?.trim()) 
            },
        }));
    };

    // Quando os dados da API chegarem → converte na hora
    useEffect(() => {
        if (allOrders?.data && Array.isArray(allOrders.data)) {
            const dadosConvertidos = convertApiToTable(allOrders.data);
            setListaPedidos(dadosConvertidos);
        }
    }, [allOrders?.data]);

    // Se ainda tá carregando ou deu erro
    if (!allOrders?.data) {
        return <div>Carregando pedidos...</div>;
    }

    const handleRowClick = (row: tItemTable) => {
        console.log("Linha clicada:", row); // aqui você vê o item
        setSelectedPedido(row); // conecta com estado externo
    };
    
    return (
        <div className="w-100 overflow-auto">
            <div style={{height: '90vh'}}>
                {listaPedidos.length > 0 && (<CustomTable
                    list={listaPedidos}                    // ← AQUI USA OS DADOS CONVERTIDOS
                    onConfirmList={(selecionados) => {
                        console.log("Selecionados:", selecionados);
                        console.log(selectedPedido);
                    }}
                    selectionKey="idOrder"                 // ← OBRIGATÓRIO PRA SELEÇÃO NÃO QUEBRAR
                    hiddenButton={false}
                    onRowClick={(item:any) => handleRowClick(item)} // ou true se não quiser os botões
                />)}
            </div>
        </div>
    );
}

export default TableClient;