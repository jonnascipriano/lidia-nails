import { useState } from "react";
import { Link } from "react-router-dom";
import ButtonSwitch from "./ButtonSwitch";

const gerarHorariosPadrao = () => {
    const horarios = [];
    for (let hora = 7; hora <= 18; hora++) {
        for (let min = 0; min < 60; min += 15) {
            if (hora === 18 && min > 0) break;
            const horaFormatada = String(hora).padStart(2, "0");
            const minFormatado = String(min).padStart(2, "0");
            horarios.push(`${horaFormatada}:${minFormatado}`);
        }
    }
    return horarios;
};

const ordenarHorarios = (lista) => [...new Set(lista)].sort((a, b) => a.localeCompare(b));

export default function AdminDashboard({ onLogout }) {
    const [diasFechados, setDiasFechados] = useState(() => {
        const configSalva = localStorage.getItem("configSalao");
        if (!configSalva) return [];

        try {
            const config = JSON.parse(configSalva);
            return config.diasFechados || [];
        } catch {
            return [];
        }
    });

    const [horariosDisponiveis, setHorariosDisponiveis] = useState(() => {
        const configSalva = localStorage.getItem("configSalao");
        const horariosPadrao = gerarHorariosPadrao();

        if (!configSalva) return horariosPadrao;

        try {
            const config = JSON.parse(configSalva);
            return config.horariosDisponiveis?.length ? config.horariosDisponiveis : horariosPadrao;
        } catch {
            return horariosPadrao;
        }
    });

    const [diasCustomizados, setDiasCustomizados] = useState(() => {
        const configSalva = localStorage.getItem("configSalao");
        if (!configSalva) return {};

        try {
            const config = JSON.parse(configSalva);
            return config.diasCustomizados || {};
        } catch {
            return {};
        }
    });

    const [novoDia, setNovoDia] = useState("");
    const [novoHorario, setNovoHorario] = useState("");
    const [dataCustom, setDataCustom] = useState("");
    const [horarioExtra, setHorarioExtra] = useState("");

    const [agendamentos, setAgendamentos] = useState(() => {
        const agendamentosSalvos = localStorage.getItem("agendamentos");
        if (!agendamentosSalvos) return [];

        try {
            const lista = JSON.parse(agendamentosSalvos);
            return [...lista].sort((a, b) => {
                if (a.data === b.data) {
                    return a.horario.localeCompare(b.horario);
                }
                return a.data.localeCompare(b.data);
            });
        } catch {
            return [];
        }
    });

    const salvarConfiguracoes = () => {
        const config = { diasFechados, horariosDisponiveis, diasCustomizados };
        localStorage.setItem("configSalao", JSON.stringify(config));
        alert("Configurações salvas com sucesso!");
    };

    const adicionarDia = () => {
        if (novoDia && !diasFechados.includes(novoDia)) {
            setDiasFechados([...diasFechados, novoDia].sort());
            setNovoDia("");
        }
    };

    const removerDia = (diaParaRemover) => {
        setDiasFechados(diasFechados.filter((dia) => dia !== diaParaRemover));
    };

    const adicionarHorario = () => {
        if (novoHorario && !horariosDisponiveis.includes(novoHorario)) {
            setHorariosDisponiveis(ordenarHorarios([...horariosDisponiveis, novoHorario]));
            setNovoHorario("");
        }
    };

    const removerHorario = (horaParaRemover) => {
        setHorariosDisponiveis(horariosDisponiveis.filter((hora) => hora !== horaParaRemover));
    };

    const alterarDisponibilidadeDoHorario = (dia, horario, disponivel) => {
        setDiasCustomizados((atual) => {
            const temConfiguracaoDoDia = Object.prototype.hasOwnProperty.call(atual, dia);
            const horariosDoDia = temConfiguracaoDoDia ? atual[dia] : horariosDisponiveis;
            const horariosAtualizados = disponivel
                ? ordenarHorarios([...horariosDoDia, horario])
                : horariosDoDia.filter((item) => item !== horario);

            return { ...atual, [dia]: horariosAtualizados };
        });
    };

    const adicionarHorarioExtra = () => {
        if (!dataCustom) {
            alert("Selecione uma data antes de adicionar um horário.");
            return;
        }

        if (!horarioExtra) {
            alert("Selecione o horário que deseja adicionar.");
            return;
        }

        setDiasCustomizados((atual) => {
            const horariosDoDia = Object.prototype.hasOwnProperty.call(atual, dataCustom)
                ? atual[dataCustom]
                : horariosDisponiveis;

            return {
                ...atual,
                [dataCustom]: ordenarHorarios([...horariosDoDia, horarioExtra]),
            };
        });
        setHorarioExtra("");
    };

    const resetarHorarioCustom = (dia) => {
        setDiasCustomizados((atual) => {
            const proximo = { ...atual };
            delete proximo[dia];
            return proximo;
        });
    };

    const removerAgendamento = (indexParaRemover) => {
        const confirmacao = window.confirm("Tem certeza que deseja remover este agendamento? Ele voltará a ficar disponível para outras clientes.");
        if (confirmacao) {
            const novaLista = agendamentos.filter((_, index) => index !== indexParaRemover);
            setAgendamentos(novaLista);
            localStorage.setItem("agendamentos", JSON.stringify(novaLista));
        }
    };

    const horariosDoDiaSelecionado = dataCustom
        ? Object.prototype.hasOwnProperty.call(diasCustomizados, dataCustom)
            ? diasCustomizados[dataCustom]
            : horariosDisponiveis
        : [];
    const horariosParaEditar = ordenarHorarios([...horariosDisponiveis, ...horariosDoDiaSelecionado]);
    const horariosAgendadosDoDia = new Set(
        agendamentos
            .filter((agendamento) => agendamento.data === dataCustom)
            .map((agendamento) => agendamento.horario)
    );

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#fff8f5] via-[#fff] to-[#f8f1ff] p-5">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-destaque">Lídia Nails</p>
                        <h1 className="mt-2 text-3xl font-bold text-tertiary">Painel de Controle</h1>
                        <p className="mt-1 text-sm text-gray-500">Olá, Lídia! Gerencie sua agenda e horários aqui.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/dashboard">
                            <ButtonSwitch>Dashboard</ButtonSwitch>
                        </Link>
                        <button onClick={onLogout} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-destaque transition hover:border-destaque hover:bg-destaque/5">
                            Sair
                        </button>
                    </div>
                </header>

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Dias fechados</p>
                        <p className="mt-2 text-3xl font-bold text-tertiary">{diasFechados.length}</p>
                    </div>
                    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Horários padrão</p>
                        <p className="mt-2 text-3xl font-bold text-tertiary">{horariosDisponiveis.length}</p>
                    </div>
                    <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Dias com ajuste</p>
                        <p className="mt-2 text-3xl font-bold text-tertiary">{Object.keys(diasCustomizados).length}</p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-tertiary">Dias Fechados</h2>
                            <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-destaque">Folga / Feriado</span>
                        </div>

                        <div className="mb-4 flex gap-2">
                            <input 
                                type="date" value={novoDia} onChange={(e) => setNovoDia(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:border-destaque focus:outline-none"
                            />
                            <button onClick={adicionarDia} className="rounded-xl bg-destaque px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
                                Adicionar
                            </button>
                        </div>

                        <ul className="space-y-2">
                            {diasFechados.length > 0 ? diasFechados.map((dia) => (
                                <li key={dia} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                                    <span className="font-medium text-tertiary">{dia.split('-').reverse().join('/')}</span>
                                    <button onClick={() => removerDia(dia)} className="rounded-lg px-2 py-1 text-sm font-bold text-red-500 transition hover:bg-red-50">Remover</button>
                                </li>
                            )) : (
                                <li className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
                                    Nenhum dia fechado no momento.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-tertiary">Horários Padrão</h2>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">07:00 - 18:00</span>
                        </div>

                        <p className="mb-4 text-sm text-gray-500">Intervalo de 15 minutos entre cada horário.</p>
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">Clique no X para remover um horário.</p>

                        <div className="mb-4 flex gap-2">
                            <input 
                                type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:border-destaque focus:outline-none"
                            />
                            <button onClick={adicionarHorario} className="rounded-xl bg-tertiary px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
                                Adicionar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {horariosDisponiveis.map((hora) => (
                                <div key={hora} className="flex items-center gap-2 rounded-full border border-destaque/30 bg-primary px-3 py-1.5 text-sm font-medium text-destaque">
                                    <span>{hora}</span>
                                    <button onClick={() => removerHorario(hora)} className="text-base font-bold leading-none hover:text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-tertiary">Remover Horários em um Dia Específico</h2>
                            <p className="text-sm text-gray-500">Escolha a data e remova somente os horários que não estarão disponíveis naquele dia.</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <input
                            type="date"
                            value={dataCustom}
                            onChange={(e) => setDataCustom(e.target.value)}
                            className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:border-destaque focus:outline-none"
                        />
                        {dataCustom && (
                            <button type="button" onClick={() => resetarHorarioCustom(dataCustom)} className="rounded-xl bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300">
                                Restaurar todos os padrões
                            </button>
                        )}
                    </div>

                    {dataCustom ? (
                        <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                Horários de {dataCustom.split("-").reverse().join("/")}
                            </p>
                            <p className="mb-4 text-xs text-gray-500">
                                Os horários removidos e adicionados abaixo afetam somente esta data.
                            </p>
                            <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="time"
                                    value={horarioExtra}
                                    onChange={(e) => setHorarioExtra(e.target.value)}
                                    step="900"
                                    className="flex-1 rounded-xl border border-gray-300 bg-white p-3 text-sm focus:border-destaque focus:outline-none"
                                    aria-label="Horário extra para a data selecionada"
                                />
                                <button
                                    type="button"
                                    onClick={adicionarHorarioExtra}
                                    className="rounded-xl bg-destaque px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
                                >
                                    Adicionar horário extra neste dia
                                </button>
                            </div>
                            {horariosParaEditar.length === 0 ? (
                                <p className="text-sm text-gray-400">Não há horários para exibir neste dia.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {horariosParaEditar.map((hora) => {
                                        const estaDisponivel = horariosDoDiaSelecionado.includes(hora);
                                        const estaAgendado = horariosAgendadosDoDia.has(hora);
                                        return (
                                            <button
                                                key={`${dataCustom}-${hora}`}
                                                type="button"
                                                onClick={() => {
                                                    if (!estaAgendado) {
                                                        alterarDisponibilidadeDoHorario(dataCustom, hora, !estaDisponivel);
                                                    }
                                                }}
                                                disabled={estaAgendado}
                                                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                                    estaAgendado
                                                        ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-800"
                                                        : estaDisponivel
                                                        ? "border-green-200 bg-green-50 text-green-800 hover:bg-red-50 hover:text-red-700"
                                                        : "border-gray-200 bg-white text-gray-400 hover:bg-green-50 hover:text-green-800"
                                                }`}
                                                title={
                                                    estaAgendado
                                                        ? "Este horário já está reservado por uma cliente"
                                                        : estaDisponivel
                                                            ? "Remover somente deste dia"
                                                            : "Restaurar neste dia"
                                                }
                                            >
                                                {hora} · {estaAgendado
                                                    ? "Agendado"
                                                    : estaDisponivel
                                                        ? "Disponível — remover"
                                                        : "Removido — restaurar"}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-gray-400">Selecione uma data para remover horários padrão ou adicionar horários extras somente naquele dia.</p>
                    )}
                </div>

                <button onClick={salvarConfiguracoes} className="mt-8 w-full rounded-2xl bg-destaque px-5 py-4 text-lg font-bold text-white shadow-md transition hover:scale-[1.01]">
                    Salvar Alterações
                </button>

                <div className="mt-8 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-tertiary">Próximos Agendamentos</h2>

                    {agendamentos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                            Ainda não há clientes agendadas.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {agendamentos.map((agendamento, index) => (
                                <div key={index} className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-primary p-4">
                                    <button 
                                        onClick={() => removerAgendamento(index)}
                                        className="absolute right-3 top-3 p-1 text-sm font-bold text-red-500 hover:text-red-700"
                                        title="Remover Agendamento"
                                    >
                                        ✕
                                    </button>
                                    <span className="self-start rounded-md bg-destaque px-2 py-1 text-xs font-bold text-white">
                                        {agendamento.data.split('-').reverse().join('/')} às {agendamento.horario}
                                    </span>
                                    <h3 className="mt-1 text-lg font-bold text-tertiary">{agendamento.nomeCliente}</h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Serviço:</span> {agendamento.servico}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}