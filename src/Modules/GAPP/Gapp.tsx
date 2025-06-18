import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, PieChart, Line, LineChart, Cell, Legend } from 'recharts';
import NavBar from "../../Components/NavBar";
import { listPathGAPP } from "./ConfigGapp";
import { useConnection } from "../../Context/ConnContext";
import ExpensesRegister from "./ExpensesRegister/ExpensesRegister";
import { useMyContext } from "../../Context/MainContext";

export default function Gapp(): JSX.Element {
    const { setTitleHead } = useMyContext();
    
    useEffect(() => {
        setTitleHead({
            title: "Relatório de despesas - GAPP",
            simpleTitle: "GAPP - Despesas",
            icon: "fa-solid fa-file-invoice",
        });
    }, []);

    return (
        <div className="d-flex w-100 flex-grow-1 overflow-hidden">
            <NavBar list={listPathGAPP} />
            <ExpensesRegister />
        </div>
    );
}