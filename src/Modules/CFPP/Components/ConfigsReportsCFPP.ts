import { TUrl, TSelectForm } from "./TypesReportsCFPP"

export const formReports = (changeUrl: (e: any) => void, urlParam: TUrl, branch: TSelectForm[], costCenter: TSelectForm[], status: any[]) =>  [
        {
            attributes: { className: "col-12 overflow-hidden" },
            item: {
                label: "Nome:",
                captureValue: {
                    type: "text",
                    name: "name",
                    className: "form-control",
                    value: urlParam["name"],
                    onChange: changeUrl,
                },
            },
        },
        {
            attributes: { className: "col-12 overflow-hidden" },
            item: {
                label: "Cód. Jornada:",
                captureValue: {
                    type: "text",
                    name: "codWorkSchedule",
                    className: "form-control",
                    value: urlParam["codWorkSchedule"],
                    onChange: changeUrl,
                },
            },
        },
        {
            attributes: { className: "col-12 overflow-hidden" },
            item: {
                label: "Filial:",
                captureValue: {
                    type: "select",
                    name: "branch",
                    className: "form-control",
                    options: branch,
                    value: urlParam["branch"],
                    onChange: changeUrl,
                },
            },
        },
        {
            attributes: { className: "col-12 overflow-hidden" },
            item: {
                label: "C.C:",
                captureValue: {
                    type: "select",
                    name: "costCenter",
                    className: "form-control",
                    options: costCenter,
                    value: urlParam["costCenter"],
                    onChange: changeUrl,
                },
            },
        },
        {
            attributes: { className: "col-6 overflow-hidden" },
            item: {
                label: "Status:",
                captureValue: {
                    type: "select",
                    name: "statusCod",
                    className: "form-control",
                    options: status,
                    value: urlParam["statusCod"],
                    onChange: changeUrl,
                },
            },
        },
        {
            attributes: { className: "col-6 overflow-hidden" },
            item: {
                label: "Páginas:",
                captureValue: {
                    type: "select",
                    className: "form-control",
                    name: "pageSize",
                    options: [
                        { label: "10 itens", value: 10 },
                        { label: "20 itens", value: 20 },
                        { label: "40 itens", value: 40 },
                    ],
                    value: urlParam["pageSize"],
                    onChange: changeUrl,
                },
            },
        },
    ];