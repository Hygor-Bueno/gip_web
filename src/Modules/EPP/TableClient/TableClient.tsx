import React, { useState, useEffect } from "react";
import CustomTable from "../../../Components/CustomTable";
import useEppFetchOrder from "../EPPFetch/useEppFetchOrder";
import { tItemTable } from "../../../types/types"; // ajuste o caminho se precisar

function TableClient() {
    const { allOrders } = useEppFetchOrder();
    const [listaPedidos, setListaPedidos] = useState<tItemTable[]>([]);
    const [selectedPedido, setSelectedPedido] = useState<[]>([]);

    // Função que transforma o JSON da API no formato que o CustomTable AMA
    const convertApiToTable = (apiData: any[]): tItemTable[] => {
        return apiData.map(item => ({
            idOrder: { value: item.idOrder, tag: "Pedido", ocultColumn: false, minWidth: "90px" },
            nameClient: { value: item.nameClient || "-", tag: "Cliente", ocultColumn: false, minWidth: "200px" },
            fone: { 
                value: item.fone ? `(${item.fone.slice(0,2)}) ${item.fone.slice(2,7)}-${item.fone.slice(7)}` : "-", 
                tag: "Telefone", ocultColumn: false, minWidth: "150px"
            },
            deliveryDate: { 
                value: new Date(item.deliveryDate).toLocaleDateString('pt-BR'), 
                tag: "Data Entrega", ocultColumn: false, minWidth: "120px" 
            },
            deliveryHour: { value: item.deliveryHour, tag: "Horário", ocultColumn: false, minWidth: "90px" },
            total: { 
                value: `R$ ${parseFloat(item.total || 0).toFixed(2).replace('.', ',')}`, 
                tag: "Total", ocultColumn: false 
            },
            signalValue: { 
                value: `R$ ${parseFloat(item.signalValue || 0).toFixed(2).replace('.', ',')}`, 
                tag: "Sinal", ocultColumn: false 
            },
            pendingValue: {value: `R$ ${(item.total - item.signalValue || 0).toFixed(2).replace('.', ',')}`, tag: "Pendente", ocultColumn: false},
            // description: { 
            //     value: item.description
            //         ?.replace(/Cód\.: \d+\.\nDescrição: /g, "")
            //         .replace(/ - \d+ Un\..*?\nSubtotal:.*?\n\n?/g, " • ")
            //         .replace(/\n/g, " ")
            //         .trim() || "Sem itens",
            //     tag: "Descrição", ocultColumn: false, minWidth: "400px" 
            // }
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
    
    return (
        <div className="w-100 overflow-auto">
            <div style={{ width: "calc(100% - 50px)", height: 'calc(100vh - 100px)' }}>
                {listaPedidos.length > 0 && (<CustomTable
                    list={listaPedidos}                    // ← AQUI USA OS DADOS CONVERTIDOS
                    onConfirmList={(row: any) => {
                        setSelectedPedido(row);
                    }}
                    selectionKey="idOrder"                 // ← OBRIGATÓRIO PRA SELEÇÃO NÃO QUEBRAR
                    hiddenButton={false}
                    maxSelection={1}
                />)}
            </div>
        </div>
    );
}

export default TableClient;