import React, { useContext, createContext, useState, useEffect } from "react";
import { fetchNodeDataFull } from "../../../Util/Util";
import { TSelectForm } from "../Components/TypesReportsCFPP";

// Definindo a interface para o contexto
interface CfppContextType {
    tokenCFPP: string;
    branch: { label: string; value: string }[];
    costCenter: { label: string; value: string }[];
    loadBranch: () => Promise<void>;
    loadCostCenter: () => Promise<void>;
    loadTokenCFPP: () => Promise<void>;
}

// Criando o contexto com o tipo definido
const CfppContext = createContext<CfppContextType | undefined>(undefined);

type TypeCfppProvider = {
    children: React.ReactNode;
};

export function CfppProvider({ children }: TypeCfppProvider) {
    const [tokenCFPP, setTokenCFPP] = useState<string>('');
    const [branch, setBranch] = useState<TSelectForm[]>([]);
    const [costCenter, setCostCenter] = useState<TSelectForm[]>([]);

    useEffect(() => {
        (async () => {
            try {
                await loadTokenCFPP();
                setTokenCFPP(sessionStorage.tokenCFPP);
                if (sessionStorage.tokenCFPP) {
                    await Promise.all([loadBranch(), loadCostCenter()]);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    async function loadTokenCFPP() {
        if (!sessionStorage.tokenCFPP) {
            const data = await fetchNodeDataFull({
                method: 'POST',
                params: { session: localStorage.tokenGIPP },
                pathFile: '/api/auth/login',
                port: "5000",
            }, { 'Content-Type': 'application/json' });
            if (data.error) throw new Error(data.message);
            sessionStorage.setItem("tokenCFPP", data?.data);
        }
    }

    async function loadBranch() {
        try {
            if (tokenCFPP || sessionStorage.tokenCFPP) {
                const reqBranch: { error: boolean; message?: string; data?: any } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/BCC/branch`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP || sessionStorage.tokenCFPP}` });
                if ('message' in reqBranch && reqBranch.error) throw new Error(reqBranch.message);
                reqBranch.data &&
                    setBranch(reqBranch.data.map((branch: any) => ({
                        label: branch.BranchName,
                        value: branch.BranchCode,
                    })));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadCostCenter() {
        try {
            if (tokenCFPP || sessionStorage.tokenCFPP) {
                const reqCostCenter: { error: boolean; message?: string; data?: any } = await fetchNodeDataFull({
                    method: 'GET',
                    params: null,
                    pathFile: `/api/GIPP/GET/BCC/costCenter`,
                    port: "5000",
                }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCFPP || sessionStorage.tokenCFPP}` });
                if ('message' in reqCostCenter && reqCostCenter.error) throw new Error(reqCostCenter.message);
                reqCostCenter.data &&
                    setCostCenter(reqCostCenter.data.map((costCenter: any) => ({
                        label: costCenter.CostCenterDescription,
                        value: costCenter.CostCenterCode,
                    })));
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Valor do contexto
    const contextValue: CfppContextType = {
        tokenCFPP,
        branch,
        costCenter,
        loadBranch,
        loadCostCenter,
        loadTokenCFPP
    };

    return (
        <CfppContext.Provider value={contextValue}>
            {children}
        </CfppContext.Provider>
    );
}

export function useCfppContext(): CfppContextType {
    const context = useContext(CfppContext);
    if (!context) {
        throw new Error("useCfppContext must be used within a CfppProvider");
    }
    return context;
}