import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

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

const converterParaMinutos = (horaString) => {
    const [horas, minutos] = horaString.split(":").map(Number);
    return horas * 60 + minutos;
};

const obterHorariosDoDia = (dataEscolhida, configSalao) => {
    if (!dataEscolhida) return [];

    if (configSalao?.diasCustomizados && Object.prototype.hasOwnProperty.call(configSalao.diasCustomizados, dataEscolhida)) {
        return configSalao.diasCustomizados[dataEscolhida];
    }

    if (Array.isArray(configSalao?.horariosDisponiveis) && configSalao.horariosDisponiveis.length > 0) {
        return configSalao.horariosDisponiveis;
    }

    return gerarHorariosPadrao();
};

export default function Agendamento() {
    const location = useLocation();
    const servico = location.state?.servicoSelecionado;

    const [nome, setNome] = useState("");
    const [dataEscolhida, setDataEscolhida] = useState("");
    const [horarioEscolhido, setHorarioEscolhido] = useState("");
    const [configSalao] = useState(() => {
        const configSalva = localStorage.getItem("configSalao");
        if (!configSalva) {
            return { diasFechados: [], horariosDisponiveis: [], diasCustomizados: {} };
        }

        try {
            const config = JSON.parse(configSalva);
            return {
                diasFechados: config.diasFechados || [],
                horariosDisponiveis: config.horariosDisponiveis || [],
                diasCustomizados: config.diasCustomizados || {},
            };
        } catch {
            return { diasFechados: [], horariosDisponiveis: [], diasCustomizados: {} };
        }
    });

    const [agendamentosJaFeitos, setAgendamentosJaFeitos] = useState(() => {
        const agendamentosSalvos = localStorage.getItem("agendamentos");
        if (!agendamentosSalvos) {
            return [];
        }

        try {
            return JSON.parse(agendamentosSalvos);
        } catch {
            return [];
        }
    });

    if (!servico) {
        return (
            <div className="min-h-screen p-5 flex flex-col items-center justify-center text-tertiary">
                <p>Nenhum serviço selecionado.</p>
                <Link to="/" className="text-destaque font-bold mt-4">
                    Voltar ao Catálogo
                </Link>
            </div>
        );
    }

    const isDiaFechado = Array.isArray(configSalao.diasFechados) && configSalao.diasFechados.includes(dataEscolhida);
    const horariosDoDiaBase = obterHorariosDoDia(dataEscolhida, configSalao);
    const horarioSelecionadoValido = horarioEscolhido && horariosDoDiaBase.includes(horarioEscolhido) ? horarioEscolhido : "";

    const horariosLivres = horariosDoDiaBase.filter((horaCandidata) => {
        if (!dataEscolhida) return false;

        const inicioNovoServico = converterParaMinutos(horaCandidata);
        const fimNovoServico = inicioNovoServico + servico.tempoEstimado;
        const agendamentosDoDia = agendamentosJaFeitos.filter((agendamento) => agendamento.data === dataEscolhida);

        const temConflito = agendamentosDoDia.some((agendado) => {
            const inicioAgendado = converterParaMinutos(agendado.horario);
            const fimAgendado = inicioAgendado + (agendado.duracao || servico.tempoEstimado);
            return inicioNovoServico < fimAgendado && fimNovoServico > inicioAgendado;
        });

        return !temConflito;
    });

    const processarAgendamento = () => {
        if (!nome.trim()) {
            alert("Digite seu nome antes de continuar.");
            return;
        }

        if (!dataEscolhida) {
            alert("Selecione uma data.");
            return;
        }

        if (!horarioSelecionadoValido) {
            alert("Selecione um horário disponível.");
            return;
        }

        const novoAgendamento = {
            data: dataEscolhida,
            horario: horarioSelecionadoValido,
            duracao: servico.tempoEstimado,
            nomeCliente: nome,
            servico: servico.nome,
            valor: servico.valor,
        };

        const todosAgendamentos = [...agendamentosJaFeitos, novoAgendamento];
        localStorage.setItem("agendamentos", JSON.stringify(todosAgendamentos));
        setAgendamentosJaFeitos(todosAgendamentos);

        const numeroLidia = "5588992137098";
        const dataFormatada = dataEscolhida.split("-").reverse().join("/");

        const mensagem =
            `Olá, Lídia! Gostaria de agendar um horário. 💅\n\n` +
            `*Serviço:* ${servico.nome}\n` +
            `*Nome:* ${nome}\n` +
            `*Data:* ${dataFormatada}\n` +
            `*Horário:* ${horarioSelecionadoValido}\n` +
            `*Valor:* R$ ${servico.valor}\n\n` +
            `Podemos confirmar?`;

        const urlWhatsApp = `https://wa.me/${numeroLidia}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsApp, "_blank");

        setHorarioEscolhido("");
        setNome("");
        setDataEscolhida("");
    };

    return (
        <section className="min-h-screen bg-primary p-5 text-tertiary">
            <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-destaque">Agendamento</p>
                        <h1 className="mt-2 text-3xl font-bold text-tertiary">{servico.nome}</h1>
                    </div>
                    <Link to="/" className="text-sm font-medium text-destaque underline">
                        Voltar
                    </Link>
                </div>

                <div className="mb-6 rounded-2xl bg-primary p-4 text-tertiary">
                    <p className="text-sm text-info">Resumo do serviço</p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                        <span>{servico.tempoEstimado} min</span>
                        <strong className="text-destaque">R$ {servico.valor}</strong>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="mb-2 block font-medium">Seu nome</span>
                            <input
                                type="text"
                                value={nome}
                                onChange={(event) => setNome(event.target.value)}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:border-destaque focus:outline-none"
                                placeholder="Digite seu nome"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block font-medium">Data</span>
                            <input
                                type="date"
                                value={dataEscolhida}
                                onChange={(event) => {
                                    setDataEscolhida(event.target.value);
                                    setHorarioEscolhido("");
                                }}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:border-destaque focus:outline-none"
                            />
                        </label>
                    </div>

                    <div>
                        <p className="mb-2 font-medium">Horários disponíveis</p>

                        {isDiaFechado ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                Este dia está fechado para agendamento.
                            </div>
                        ) : !dataEscolhida ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                Escolha uma data para visualizar os horários.
                            </div>
                        ) : horariosLivres.length === 0 ? (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                                Nenhum horário disponível para essa data.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {horariosLivres.map((horario) => (
                                    <button
                                        key={horario}
                                        type="button"
                                        onClick={() => setHorarioEscolhido(horario)}
                                        className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                                            horarioSelecionadoValido === horario
                                                ? "border-destaque bg-destaque text-white"
                                                : "border-destaque/30 bg-primary text-tertiary hover:bg-secondary"
                                        }`}
                                    >
                                        {horario}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
                    <div className="text-sm text-gray-600">
                        {horarioSelecionadoValido ? `Horário selecionado: ${horarioSelecionadoValido}` : "Nenhum horário selecionado"}
                    </div>

                    <button
                        type="button"
                        onClick={processarAgendamento}
                        disabled={!nome.trim() || !dataEscolhida || !horarioSelecionadoValido || isDiaFechado}
                        className="rounded-xl bg-destaque px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        Agendar no WhatsApp
                    </button>
                </div>
            </div>
        </section>
    );
}