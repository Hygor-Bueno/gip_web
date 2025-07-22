import React, { useMemo, useState } from "react";
import GenericCardItem from "../../../../../Components/GenericCardItem";
import { InfractionItem } from "../../../Business/Interfaces/IFormGender";

interface CardSearchProps {
    items: InfractionItem[];
    loading: any;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    onRecycle: (item: any) => void;
}

const fields = [
    { label: "Infração", key: "infraction" },
    { label: "Pontos", key: "points" },
    { label: "Gravidade", key: "gravitity" },
] as const;

const restFields = [...fields];

const CardSearch: React.FC<CardSearchProps> = ({ items, loading, onEdit, onDelete, onRecycle }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGravitity, setSelectedGravitity] = useState("");
    const [selectedPoints, setSelectedPoints] = useState("");

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchInfraction = item.infraction?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchGravitity = !selectedGravitity || item.gravitity === selectedGravitity;
            const matchPoints = !selectedPoints || item.points === parseInt(selectedPoints);
            return matchInfraction && matchGravitity && matchPoints;
        });
    }, [items, searchTerm, selectedGravitity, selectedPoints]);

    const uniqueGravities = useMemo(() => {
        const gravities = items.map((item) => item.gravitity);
        return Array.from(new Set(gravities));
    }, [items]);

    const uniquePoints = useMemo(() => {
        const points = items.map((item) => item.points);
        return Array.from(new Set(points)).sort((a, b) => a - b);
    }, [items]);

    return (
        <div className="w-100">
            <div className="mb-2 mx-2 d-flex gap-3 flex-wrap">
                <div>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por infração..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="form-select"
                        value={selectedGravitity}
                        onChange={(e) => setSelectedGravitity(e.target.value)}
                    >
                        <option value="">Todas as gravidades</option>
                        {uniqueGravities.map((gravity, index) => (
                            <option key={index} value={gravity}>
                                {gravity}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select className="form-select" value={selectedPoints} onChange={(e) => setSelectedPoints(e.target.value)}>
                        <option value="">Todos os pontos</option> {uniquePoints.map((points, index) => <option key={index} value={points}>{points} ponto(s)</option>)}
                    </select>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    {filteredItems.length > 0 ? (
                        filteredItems.slice().reverse().map((item: any, index: any) => (
                            <GenericCardItem<InfractionItem>
                                key={`card_${index}`}
                                item={item}
                                fields={restFields}
                                loading={loading}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onRecycle={onRecycle}
                                showEdit={item.status_infractions === 1}
                                showDelete={item.status_infractions === 1}
                                showRecycle={item.status_infractions === 0}/>
                            ))) : (
                        <div className="p-3 m-auto shadow-sm border_none background_whiteGray" role="alert">
                            <b className="text-muted font_size">Nenhum resultado encontrado</b>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardSearch;
