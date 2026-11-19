import { useEffect, useState } from "react";
import { observarAgendamentos } from "./agendamentosFirebase";

const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valor) || 0);

export default function HistoricoDashboard() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => observarAgendamentos(
        (lista) => {
            setAgendamentos(lista);
            setCarregando(false);
            setErro("");
        },
        (erroAtual) => {
            setErro(`Não foi possível carregar o histórico: ${erroAtual.message}`);
            setCarregando(false);
        }
    ), []);

    const historico = [...agendamentos].sort((a, b) =>
        (b.data || "").localeCompare(a.data || "") ||
        (b.horario || "").localeCompare(a.horario || "")
    );

    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-xl font-bold tracking-tight">Histórico de agendamentos</h2>
                <p className="mt-1 text-sm text-info">Agendamentos mais recentes aparecem primeiro.</p>
            </header>

            {erro ? (
                <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{erro}</p>
            ) : carregando ? (
                <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                    Carregando histórico...
                </p>
            ) : historico.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                    Nenhum agendamento registrado.
                </p>
            ) : (
                <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white px-5 shadow-sm sm:px-6">
                    {historico.map((agendamento) => (
                        <li key={agendamento.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold">{agendamento.nomeCliente || "Cliente sem nome"}</p>
                                <p className="mt-1 text-sm text-info">{agendamento.servico || "Serviço não informado"}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                <p className="text-sm text-info">
                                    {agendamento.data?.split("-").reverse().join("/") || "Data não informada"}
                                    {agendamento.horario ? ` · ${agendamento.horario}` : ""}
                                </p>
                                <span className="font-semibold text-emerald-700">{formatarMoeda(agendamento.valor)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
