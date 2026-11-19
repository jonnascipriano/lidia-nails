import { useEffect, useState } from "react";
import { observarAgendamentos } from "./agendamentosFirebase";

const obterDataLocal = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const obterDataISO = (data) => {
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

const formatarHorario = (totalMinutos) => {
    const minutosNoDia = ((totalMinutos % 1440) + 1440) % 1440;
    const hora = String(Math.floor(minutosNoDia / 60)).padStart(2, "0");
    const minuto = String(minutosNoDia % 60).padStart(2, "0");
    return `${hora}:${minuto}`;
};

const formatarHorarioDescanso = (totalMinutos) => {
    const minutosNoDia = ((totalMinutos % 1440) + 1440) % 1440;
    const hora = String(Math.floor(minutosNoDia / 60)).padStart(2, "0");
    const minuto = String(minutosNoDia % 60).padStart(2, "0");
    return `${hora}h${minuto}`;
};

const formatarDuracaoDescanso = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const restoMinutos = minutos % 60;
    if (!horas) return `${restoMinutos}min`;
    return restoMinutos ? `${horas}h ${restoMinutos}min` : `${horas}h`;
};

const formatarDuracao = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const restoMinutos = minutos % 60;
    if (!horas) return `${restoMinutos} min`;
    return restoMinutos ? `${horas} h ${restoMinutos} min` : `${horas} h`;
};

const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(Number(valor) || 0);

export default function LinhaTempoDashboard() {
    const [data, setData] = useState(obterDataLocal);
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
            setErro(`Não foi possível carregar a linha do tempo: ${erroAtual.message}`);
            setCarregando(false);
        }
    ), []);

    const diasProximos = Array.from({ length: 14 }, (_, indice) => {
        const dia = new Date();
        dia.setHours(12, 0, 0, 0);
        dia.setDate(dia.getDate() + indice);
        const valor = obterDataISO(dia);

        return {
            valor,
            rotulo: indice === 0
                ? "Hoje"
                : indice === 1
                    ? "Amanhã"
                    : dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
            data: dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            quantidadeAgendamentos: agendamentos.filter((agendamento) => agendamento.data === valor).length,
        };
    });

    const atendimentosDoDia = agendamentos
        .filter((agendamento) => agendamento.data === data)
        .map((agendamento) => {
            const inicio = converterParaMinutos(agendamento.horario);
            const duracao = Number(agendamento.duracao) || 15;
            return { ...agendamento, inicio, duracao, fim: inicio === null ? null : inicio + duracao };
        })
        .filter((agendamento) => agendamento.inicio !== null)
        .sort((a, b) => a.inicio - b.inicio);

    const terminoFinal = atendimentosDoDia.reduce(
        (termino, agendamento) => Math.max(termino, agendamento.fim),
        0
    );
    const minutosPrevistos = atendimentosDoDia.reduce(
        (total, agendamento) => total + agendamento.duracao,
        0
    );
    const intervalosDoDia = atendimentosDoDia
        .slice(1)
        .map((agendamento, indice) => ({
            inicio: atendimentosDoDia[indice].fim,
            fim: agendamento.inicio,
        }))
        .filter((intervalo) => intervalo.fim > intervalo.inicio);

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Lista de Agendamentos</h2>
                    <p className="mt-1 text-sm text-info">Horários de início, términos previstos e intervalos do dia.</p>
                </div>
                <label className="text-sm font-medium">
                    Outra data
                    <input
                        type="date"
                        value={data}
                        onChange={(event) => setData(event.target.value)}
                        aria-label="Escolher outra data"
                        className="mt-1 block rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-destaque focus:ring-4 focus:ring-destaque/10"
                    />
                </label>
            </header>

            <div>
                <p className="mb-3 text-sm font-bold text-tertiary">Escolha um dia</p>
                <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-2" role="group" aria-label="Dias com agendamentos">
                    {diasProximos.map((dia) => {
                        const selecionado = data === dia.valor;
                        return (
                            <button
                                key={dia.valor}
                                type="button"
                                onClick={() => setData(dia.valor)}
                                aria-pressed={selecionado}
                                className={`flex min-h-[74px] min-w-[76px] shrink-0 flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition ${
                                    selecionado
                                        ? "border-destaque bg-rose-50 text-rose-900"
                                        : "border-gray-200 bg-white text-tertiary hover:border-destaque/50"
                                }`}
                            >
                                <span className="text-xs font-medium uppercase">{dia.rotulo}</span>
                                <span className="mt-0.5 text-sm font-semibold">{dia.data}</span>
                                {dia.quantidadeAgendamentos > 0 && (
                                    <span className="mt-1 whitespace-nowrap text-[10px] font-semibold leading-tight text-destaque">
                                        {dia.quantidadeAgendamentos} agend.
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {erro ? (
                <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{erro}</p>
            ) : carregando ? (
                <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                    Carregando agenda...
                </p>
            ) : atendimentosDoDia.length === 0 ? (
                <>
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-info">
                        Não há agendamentos com horário marcado neste dia.
                    </p>
                    <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <p className="text-sm font-medium text-info">Horas previstas no dia</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-800">{formatarDuracao(minutosPrevistos)}</p>
                        <div className="mt-4 border-t border-emerald-200 pt-3">
                            <p className="text-sm font-semibold text-tertiary">Horários de intervalo:</p>
                            <p className="mt-1 text-sm text-info">Nenhum intervalo previsto.</p>
                        </div>
                    </aside>
                </>
            ) : (
                <>
                    <ol className="space-y-0">
                        {atendimentosDoDia.map((agendamento, indice) => {
                            const atendimentoAnterior = atendimentosDoDia[indice - 1];
                            const intervalo = atendimentoAnterior
                                ? agendamento.inicio - atendimentoAnterior.fim
                                : null;

                            return (
                                <li key={agendamento.id}>
                                    {atendimentoAnterior && (
                                        <div className="ml-5 border-l-2 border-dashed border-stone-300 py-3 pl-5 text-sm text-info">
                                            {intervalo > 0
                                                ? `Descanso entre atendimentos: ${formatarDuracaoDescanso(intervalo)}, de ${formatarHorarioDescanso(atendimentoAnterior.fim)} às ${formatarHorarioDescanso(agendamento.inicio)}m`
                                                : intervalo === 0
                                                    ? "Sem intervalo entre atendimentos"
                                                    : `Sobreposição de ${formatarDuracao(Math.abs(intervalo))}`}
                                        </div>
                                    )}
                                    <article className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                                        <span className="absolute -left-[7px] top-6 h-3 w-3 rounded-full bg-destaque ring-4 ring-primary" aria-hidden="true" />
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-destaque">
                                                    Início do atendimento · {formatarHorario(agendamento.inicio)}
                                                </p>
                                                <h3 className="mt-1 font-semibold">{agendamento.nomeCliente || "Cliente sem nome"}</h3>
                                                <p className="mt-1 text-sm text-info">{agendamento.servico || "Serviço não informado"}</p>
                                                <p className="mt-1 text-sm font-semibold text-emerald-700">
                                                    {formatarMoeda(agendamento.valor)}
                                                </p>
                                            </div>
                                            <div className="text-sm sm:text-right">
                                                <p className="font-semibold text-tertiary">
                                                    Término previsto · {formatarHorario(agendamento.fim)}
                                                </p>
                                                <p className="mt-1 text-info">Duração · {formatarDuracao(agendamento.duracao)}</p>
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ol>
                    <aside className="rounded-2xl border border-destaque/20 bg-rose-50/70 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-info">Previsão de término do último agendamento</p>
                                <p className="mt-1 text-2xl font-bold text-destaque">{formatarHorario(terminoFinal)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-info">Horas previstas no dia</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-800">{formatarDuracao(minutosPrevistos)}</p>
                            </div>
                            <div className="border-t border-stone-200 pt-3 sm:col-span-2">
                                <p className="text-sm font-semibold text-tertiary">Horários de intervalo:</p>
                                {intervalosDoDia.length === 0 ? (
                                    <p className="mt-1 text-sm text-info">Nenhum intervalo previsto.</p>
                                ) : (
                                    <ol className="mt-1 space-y-1 text-sm text-info">
                                        {intervalosDoDia.map((intervalo, indice) => (
                                            <li key={`${intervalo.inicio}-${intervalo.fim}`}>
                                                {indice + 1}º - {formatarHorarioDescanso(intervalo.inicio)}m às {formatarHorarioDescanso(intervalo.fim)}m
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        </div>
                    </aside>
                </>
            )}
        </section>
    );
}
