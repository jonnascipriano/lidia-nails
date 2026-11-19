import { useEffect, useState } from "react";
import { observarAgendamentos } from "./agendamentosFirebase";

const obterDataLocal = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const converterParaMinutos = (horario) => {
    if (typeof horario !== "string") return null;
    const [horas, minutos] = horario.split(":").map(Number);
    if (![horas, minutos].every(Number.isFinite)) return null;
    return horas * 60 + minutos;
};

const formatarHorario = (minutos) => {
    const minutosNoDia = ((minutos % 1440) + 1440) % 1440;
    const hora = String(Math.floor(minutosNoDia / 60)).padStart(2, "0");
    const minuto = String(minutosNoDia % 60).padStart(2, "0");
    return `${hora}h${minuto}`;
};

const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valor) || 0);

export default function HistoricoDashboard() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [agora, setAgora] = useState(() => new Date());
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mostrarConcluidos, setMostrarConcluidos] = useState(true);
    const [mostrarFuturos, setMostrarFuturos] = useState(false);

    useEffect(() => {
        const intervalo = setInterval(() => setAgora(new Date()), 60 * 1000);
        return () => clearInterval(intervalo);
    }, []);

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

    const dataHoje = obterDataLocal(agora);
    const minutoAtual = agora.getHours() * 60 + agora.getMinutes();
    const estaConcluido = (agendamento) => {
        const inicio = converterParaMinutos(agendamento.horario);
        const termino = inicio === null
            ? null
            : inicio + (Number(agendamento.duracao) || 15);
        return agendamento.data < dataHoje ||
            (agendamento.data === dataHoje && termino !== null && termino <= minutoAtual);
    };
    const historico = [...agendamentos].sort((a, b) => {
        const aConcluido = estaConcluido(a);
        const bConcluido = estaConcluido(b);
        if (aConcluido !== bConcluido) return aConcluido ? 1 : -1;

        const ordemCronologica =
            (a.data || "").localeCompare(b.data || "") ||
            (a.horario || "").localeCompare(b.horario || "");
        return aConcluido ? -ordemCronologica : ordemCronologica;
    });
    const agendamentosFiltrados = historico.filter((agendamento) => {
        const concluido = estaConcluido(agendamento);
        return (mostrarConcluidos && concluido) || (mostrarFuturos && !concluido);
    });

    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-xl font-bold tracking-tight">Histórico de agendamentos</h2>
                <p className="mt-1 text-sm text-info">Próximos horários aparecem primeiro; concluídos seguem do mais recente ao mais antigo.</p>
            </header>

            <fieldset className="flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <legend className="px-1 text-sm font-semibold">Exibir</legend>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={mostrarConcluidos}
                        onChange={(event) => setMostrarConcluidos(event.target.checked)}
                        className="h-4 w-4 accent-destaque"
                    />
                    Agendamentos concluídos
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={mostrarFuturos}
                        onChange={(event) => setMostrarFuturos(event.target.checked)}
                        className="h-4 w-4 accent-destaque"
                    />
                    Agendamentos futuros
                </label>
            </fieldset>

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
            ) : !mostrarConcluidos && !mostrarFuturos ? (
                <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                    Selecione ao menos um filtro para exibir agendamentos.
                </p>
            ) : agendamentosFiltrados.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                    Nenhum agendamento corresponde aos filtros selecionados.
                </p>
            ) : (
                <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white px-5 shadow-sm sm:px-6">
                    {agendamentosFiltrados.map((agendamento) => {
                        const inicio = converterParaMinutos(agendamento.horario);
                        const duracao = Number(agendamento.duracao) || 15;
                        const previsaoHorario = inicio === null
                            ? "Horário não informado"
                            : `${formatarHorario(inicio)} às ${formatarHorario(inicio + duracao)}`;

                        return (
                        <li key={agendamento.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold">{agendamento.nomeCliente || "Cliente sem nome"}</p>
                                <p className="mt-1 text-sm text-info">{agendamento.servico || "Serviço não informado"}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                <p className="text-sm text-info">
                                    {agendamento.data?.split("-").reverse().join("/") || "Data não informada"}
                                    {" · "}{previsaoHorario}
                                </p>
                                <span className="font-semibold text-emerald-700">{formatarMoeda(agendamento.valor)}</span>
                            </div>
                        </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
