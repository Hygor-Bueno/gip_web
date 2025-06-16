import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, PieChart, Line, LineChart, Cell, Legend } from 'recharts';
import NavBar from "../../Components/NavBar";
import { listPathGAPP } from "./ConfigGapp";
import { useConnection } from "../../Context/ConnContext";
import ExpensesRegister from "./ExpensesRegister/ExpensesRegister";

export default function Gapp(): JSX.Element {

    const { fetchData } = useConnection();
    const [data, setData] = useState<[]>([]);
    useEffect(() => {
        (
            async () => {
                try {
                    const req: any = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/FiltredExpenses.php", urlComplement: `&dashGAPP=1` });
                    if (req.error) throw new Error(req.message);
                    setData(req.data);
                } catch (error) {
                    console.error(error)
                }
            }
        )();
    }, []);

    return (
        <div className="d-flex w-100 flex-grow-1 overflow-hidden">
            <NavBar list={listPathGAPP} />
            <ExpensesRegister/>
        </div>
    );
}

















/*
const cores = [
  "#0D3B66", // azul escuro
  "#145DA0",
  "#1E7FCB",
  "#3FA1F3",
  "#63B8FF",
  "#85CCFF",
  "#5598C8",
  "#2C6DA3",
  "#1B4F7A",
  "#123B5C", // azul profundo
];

const cores = [
  "#14532D", // verde profundo
  "#166534", // verde escuro vibrante
  "#15803D", // verde forte (tipo folha)
  "#16A34A", // verde padrão
  "#22C55E", // verde brilhante
  "#34D399", // verde jade
  "#10B981", // verde esmeralda médio
  "#059669", // verde mais fechado
  "#047857", // verde floresta
  "#065F46", // verde pinho escuro
];




function MeuGrafico(props: { data: [] }) {
    return (
        // <ResponsiveContainer width="100%" height={"25%"}>
        //     <BarChart data={props.data}>
        //         <CartesianGrid strokeDasharray="3 3" />
        //         <XAxis dataKey="name" />
        //         <YAxis width={150} tickFormatter={formatarParaBRL} />
        //         <Tooltip formatter={(value: number) => formatarParaBRL(value)} />
        //         <Bar dataKey="value" fill="#8884d8" />
        //     </BarChart>
        // </ResponsiveContainer>
         <ResponsiveContainer height={350}> 
            <PieChart>
                <Pie
                    data={props.data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, value }) => formatarParaBRL(value)}
                >
                    {props.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatarParaBRL(value)} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

function formatarParaBRL(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}
*/