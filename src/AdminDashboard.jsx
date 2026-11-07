import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ButtonSwitch from "./ButtonSwitch";
import { calcularHorarioTermino } from "./horarios";
import servicos from "./servicos";
import {
    atualizarAgendamento,
    criarAgendamento,
    excluirAgendamento,
    observarAgendamentos,
} from "./agendamentosFirebase";

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

const converterParaMinutos = (horario) => {
    const [horas, minutos] = horario.split(":").map(Number);
    return horas * 60 + minutos;
};

const obterDataISO = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const compararAgendamentos = (a, b) => {
    if (a.data === b.data) return a.horario.localeCompare(b.horario);
    return a.data.localeCompare(b.data);
};

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
    const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
    const [anterioresExpandidos, setAnterioresExpandidos] = useState(false);
    const [valorEditado, setValorEditado] = useState("");
    const [observacaoEdicao, setObservacaoEdicao] = useState("");
    const [nomeClienteManual, setNomeClienteManual] = useState("");
    const [dataManual, setDataManual] = useState(() => obterDataISO(new Date()));
    const [horarioManual, setHorarioManual] = useState("");
    const [servicoManual, setServicoManual] = useState(servicos[0].nome);
    const [valorManual, setValorManual] = useState(String(servicos[0].valor));
    const [duracaoManual, setDuracaoManual] = useState(String(servicos[0].tempoEstimado));
    const [mensagemCadastroManual, setMensagemCadastroManual] = useState("");
    const [agendamentos, setAgendamentos] = useState([]);
    const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(true);
    const [erroAgendamentos, setErroAgendamentos] = useState("");
    const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);

    useEffect(() => observarAgendamentos(
        (lista) => {
            setAgendamentos(lista);
            setCarregandoAgendamentos(false);
            setErroAgendamentos("");
        },
        (erro) => {
            setErroAgendamentos(`Não foi possível carregar os agendamentos: ${erro.message}`);
            setCarregandoAgendamentos(false);
        }
    ), []);

    // === LÓGICA DE RESUMO FINANCEIRO ===
    const hojeData = new Date();
    const dataHojeStr = obterDataISO(hojeData);

    const diaSemana = hojeData.getDay();
    const diffParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
    const segunda = new Date(hojeData);
    segunda.setDate(hojeData.getDate() - diffParaSegunda);
    const dataSegundaStr = obterDataISO(segunda);
    
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
    const dataDomingoStr = obterDataISO(domingo);

    let faturamentoHoje = 0;
    let faturamentoSemana = 0;
    let qtdHoje = 0;
    let qtdSemana = 0;

    agendamentos.forEach(ag => {
        const valorNum = Number(ag.valor) || 0;
        if (ag.data === dataHojeStr) {
            faturamentoHoje += valorNum;
            qtdHoje++;
        }
        if (ag.data >= dataSegundaStr && ag.data <= dataDomingoStr) {
            faturamentoSemana += valorNum;
            qtdSemana++;
        }
    });

    // === AGRUPAMENTO DE AGENDAMENTOS POR DIA ===
    const agendamentosAgrupados = agendamentos.reduce((grupos, agendamento) => {
        if (!grupos[agendamento.data]) {
            grupos[agendamento.data] = [];
        }
        grupos[agendamento.data].push(agendamento);
        return grupos;
    }, {});
    const datasComAgendamento = Object.keys(agendamentosAgrupados);
    const datasProximasComAgendamento = datasComAgendamento
        .filter((data) => data >= dataHojeStr)
        .sort();
    const datasAnterioresComAgendamento = datasComAgendamento
        .filter((data) => data < dataHojeStr)
        .sort()
        .reverse();
    const gruposDeDatas = [
        { titulo: "Próximos agendamentos", datas: datasProximasComAgendamento },
        { titulo: "Agendamentos anteriores", datas: datasAnterioresComAgendamento },
    ].filter((grupo) => grupo.datas.length > 0);

    // === FUNÇÕES DE AÇÃO COM MELHORIAS ===
    const salvarConfiguracoes = () => {
        const config = { diasFechados, horariosDisponiveis, diasCustomizados };
        localStorage.setItem("configSalao", JSON.stringify(config));
        alert("Configurações salvas com sucesso!");
    };

    const adicionarDia = () => {
        if (!novoDia) {
            alert("Por favor, selecione uma data primeiro.");
            return;
        }
        if (diasFechados.includes(novoDia)) {
            alert("Este dia já está na lista de dias fechados.");
            return;
        }
        setDiasFechados([...diasFechados, novoDia].sort());
        setNovoDia("");
    };

    const removerDia = (diaParaRemover) => {
        setDiasFechados(diasFechados.filter((dia) => dia !== diaParaRemover));
    };

    const adicionarHorario = () => {
        if (!novoHorario) {
            alert("Por favor, selecione um horário primeiro.");
            return;
        }
        if (horariosDisponiveis.includes(novoHorario)) {
            alert("Este horário já existe na lista padrão.");
            return;
        }
        setHorariosDisponiveis(ordenarHorarios([...horariosDisponiveis, novoHorario]));
        setNovoHorario("");
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
        if (!dataCustom) return alert("Selecione uma data antes de adicionar um horário.");
        if (!horarioExtra) return alert("Selecione o horário que deseja adicionar.");

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

    // Nova lógica de remover para evitar bugs (compara os dados em vez de usar o INDEX)
    const removerAgendamento = async (agendamentoParaRemover) => {
        const confirmacao = window.confirm("Tem certeza que deseja remover este agendamento? Ele voltará a ficar disponível para outras clientes.");
        if (confirmacao) {
            try {
                await excluirAgendamento(agendamentoParaRemover.id);
            } catch (erro) {
                alert(`Não foi possível remover o agendamento: ${erro.message}`);
            }
        }
    };

    const iniciarEdicaoAgendamento = (agendamento) => {
        setAgendamentoEmEdicao(agendamento);
        setValorEditado(String(agendamento.valor ?? 0));
        setObservacaoEdicao("");
    };

    const cancelarEdicaoAgendamento = () => {
        setAgendamentoEmEdicao(null);
        setValorEditado("");
        setObservacaoEdicao("");
    };

    const salvarEdicaoAgendamento = async (agendamento) => {
        const novoValor = Number(valorEditado);
        if (!valorEditado.trim() || !Number.isFinite(novoValor) || novoValor < 0) {
            alert("Informe um valor válido para o serviço.");
            return;
        }
        if (!observacaoEdicao.trim()) {
            alert("Informe o motivo da alteração do valor.");
            return;
        }

        const historicoEdicoes = [
            ...(Array.isArray(agendamento.historicoEdicoes) ? agendamento.historicoEdicoes : []),
            {
                valorAnterior: Number(agendamento.valor) || 0,
                valorNovo: novoValor,
                observacao: observacaoEdicao.trim(),
                editadoEm: new Date().toISOString(),
            },
        ];
        try {
            await atualizarAgendamento(agendamento.id, { valor: novoValor, historicoEdicoes });
            cancelarEdicaoAgendamento();
        } catch (erro) {
            alert(`Não foi possível salvar a alteração: ${erro.message}`);
        }
    };

    const adicionarAgendamentoManual = async (event) => {
        event.preventDefault();
        if (salvandoAgendamento) return;
        const valor = Number(valorManual);
        const duracao = Number(duracaoManual);
        const horariosDoDiaManual = Object.prototype.hasOwnProperty.call(diasCustomizados, dataManual)
            ? diasCustomizados[dataManual]
            : horariosDisponiveis;
        const inicioNovoAgendamento = horarioManual ? converterParaMinutos(horarioManual) : -1;
        const fimNovoAgendamento = inicioNovoAgendamento + duracao;
        const temConflito = agendamentos.some((agendamento) => {
            if (agendamento.data !== dataManual) return false;
            const inicioAgendado = converterParaMinutos(agendamento.horario);
            const fimAgendado = inicioAgendado + (Number(agendamento.duracao) || 15);
            return inicioNovoAgendamento < fimAgendado && fimNovoAgendamento > inicioAgendado;
        });

        if (!nomeClienteManual.trim() || !dataManual || !horarioManual) {
            alert("Informe o nome, a data e o horário do atendimento.");
            return;
        }
        if (!Number.isFinite(valor) || valor < 0 || !Number.isInteger(duracao) || duracao <= 0) {
            alert("Informe um valor válido e uma duração maior que zero.");
            return;
        }
        if (dataManual >= dataHojeStr) {
            if (diasFechados.includes(dataManual)) {
                alert("O salão está fechado nesta data.");
                return;
            }
            if (!horariosDoDiaManual.includes(horarioManual)) {
                alert("Selecione um horário disponível para esta data.");
                return;
            }
            if (temConflito) {
                alert("Este horário conflita com outro atendimento. Escolha um horário disponível.");
                return;
            }
        }

        const novoAgendamento = {
            data: dataManual,
            horario: horarioManual,
            duracao,
            nomeCliente: nomeClienteManual.trim(),
            servico: servicoManual,
            valor,
            origem: "manual",
        };
        setSalvandoAgendamento(true);
        try {
            await criarAgendamento(novoAgendamento);
            setNomeClienteManual("");
            setHorarioManual("");
            setMensagemCadastroManual(
                dataManual >= dataHojeStr
                    ? "Agendamento realizado e incluído na agenda."
                    : "Atendimento registrado e incluído na agenda e nos resumos financeiros."
            );
        } catch (erro) {
            alert(`Não foi possível salvar o agendamento no Firebase: ${erro.message}`);
        } finally {
            setSalvandoAgendamento(false);
        }
    };

    const selecionarServicoManual = (nomeServico) => {
        const servicoSelecionado = servicos.find((servico) => servico.nome === nomeServico);
        if (!servicoSelecionado) return;

        setServicoManual(servicoSelecionado.nome);
        setValorManual(String(servicoSelecionado.valor));
        setDuracaoManual(String(servicoSelecionado.tempoEstimado));
        setHorarioManual("");
    };

    const horariosBaseManual = dataManual
        ? Object.prototype.hasOwnProperty.call(diasCustomizados, dataManual)
            ? diasCustomizados[dataManual]
            : horariosDisponiveis
        : [];
    const horariosDisponiveisManuais = dataManual >= dataHojeStr && !diasFechados.includes(dataManual)
        ? horariosBaseManual.filter((horario) => {
            const inicioNovoAgendamento = converterParaMinutos(horario);
            const fimNovoAgendamento = inicioNovoAgendamento + (Number(duracaoManual) || 15);
            return !agendamentos.some((agendamento) => {
                if (agendamento.data !== dataManual) return false;
                const inicioAgendado = converterParaMinutos(agendamento.horario);
                const fimAgendado = inicioAgendado + (Number(agendamento.duracao) || 15);
                return inicioNovoAgendamento < fimAgendado && fimNovoAgendamento > inicioAgendado;
            });
        })
        : [];
    const agendamentoManualFuturo = dataManual >= dataHojeStr;

    const horariosDoDiaSelecionado = dataCustom
        ? Object.prototype.hasOwnProperty.call(diasCustomizados, dataCustom)
            ? diasCustomizados[dataCustom]
            : horariosDisponiveis
        : [];
    const horariosParaEditar = ordenarHorarios([...horariosDisponiveis, ...horariosDoDiaSelecionado]);
    const agendamentosDoDiaSelecionado = agendamentos.filter((agendamento) => agendamento.data === dataCustom);
    
    const horariosOcupadosDoDia = new Set(
        horariosParaEditar.filter((horario) => {
            const inicioHorario = converterParaMinutos(horario);
            const fimHorario = inicioHorario + 15;

            return agendamentosDoDiaSelecionado.some((agendamento) => {
                const inicioAgendado = converterParaMinutos(agendamento.horario);
                const duracaoAgendada = Number(agendamento.duracao) || 15;
                const fimAgendado = inicioAgendado + duracaoAgendada;
                return inicioHorario < fimAgendado && fimHorario > inicioAgendado;
            });
        })
    );

    const diasProximos = Array.from({ length: 14 }, (_, indice) => {
        const data = new Date();
        data.setHours(12, 0, 0, 0);
        data.setDate(data.getDate() + indice);

        return {
            valor: obterDataISO(data),
            rotulo: indice === 0 ? "Hoje" : indice === 1 ? "Amanhã" : data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
            data: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            quantidadeAgendamentos: agendamentos.filter((agendamento) => agendamento.data === obterDataISO(data)).length,
        };
    });

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

                {/* ===== NOVA SESSÃO: PREVISÃO DE FATURAMENTO ===== */}
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-gradient-to-r from-gray-800 to-gray-900 p-6 shadow-md text-white">
                        <p className="text-sm text-gray-300 font-medium">Previsão para Hoje</p>
                        <h2 className="mt-2 text-4xl font-bold text-green-400">R$ {faturamentoHoje}</h2>
                        <p className="mt-1 text-sm text-gray-400">{qtdHoje} {qtdHoje === 1 ? 'agendamento' : 'agendamentos'} para hoje</p>
                    </div>
                    <div className="rounded-[24px] border border-destaque/20 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500 font-medium">Previsão da Semana <span className="text-xs font-normal">(Seg a Dom)</span></p>
                        <h2 className="mt-2 text-4xl font-bold text-destaque">R$ {faturamentoSemana}</h2>
                        <p className="mt-1 text-sm text-gray-500">{qtdSemana} {qtdSemana === 1 ? 'agendamento' : 'agendamentos'} esta semana</p>
                    </div>
                </div>

                <details className="group mb-8 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                    <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-tertiary">Configurações da agenda</h2>
                            <p className="mt-1 text-sm text-gray-500">Dias fechados, horários e ajustes por data</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                            <span className="rounded-full bg-pink-50 px-3 py-1.5 text-destaque">
                                {diasFechados.length} {diasFechados.length === 1 ? "dia fechado" : "dias fechados"}
                            </span>
                            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">
                                {horariosDisponiveis.length} horários padrão
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">
                                {Object.keys(diasCustomizados).length} dias ajustados
                            </span>
                            <span className="ml-1 text-sm text-destaque transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
                        </div>
                    </summary>

                    <div className="mt-5 border-t border-gray-100 pt-5">
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
                    <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-600">Acesso rápido aos próximos dias</p>
                        <div className="flex flex-wrap gap-2">
                            {diasProximos.map((dia) => {
                                const selecionado = dataCustom === dia.valor;
                                return (
                                    <button
                                        key={dia.valor}
                                        type="button"
                                        onClick={() => setDataCustom(dia.valor)}
                                        aria-pressed={selecionado}
                                        className={`min-w-20 rounded-xl border px-3 py-2 text-center transition ${
                                            selecionado
                                                ? "border-destaque bg-destaque text-white"
                                                : "border-gray-200 bg-white text-tertiary hover:border-destaque/50 hover:bg-primary"
                                        }`}
                                    >
                                        <span className="block text-xs font-medium uppercase">{dia.rotulo}</span>
                                        <span className="mt-0.5 block text-sm font-semibold">{dia.data}</span>
                                        {dia.quantidadeAgendamentos > 0 && (
                                            <span className={`mt-1 block text-xs ${selecionado ? "text-white/80" : "text-destaque"}`}>
                                                {dia.quantidadeAgendamentos} {dia.quantidadeAgendamentos === 1 ? "agendamento" : "agendamentos"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {dataCustom ? (
                        <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                Horários de {dataCustom.split("-").reverse().join("/")}
                            </p>
                            <p className="mb-4 text-xs text-gray-500">
                                Os horários removidos e adicionados abaixo afetam somente esta data. Reservas ocupam os horários seguintes conforme a duração do serviço.
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
                                        const estaOcupado = horariosOcupadosDoDia.has(hora);
                                        return (
                                            <button
                                                key={`${dataCustom}-${hora}`}
                                                type="button"
                                                onClick={() => {
                                                    if (!estaOcupado) {
                                                        alterarDisponibilidadeDoHorario(dataCustom, hora, !estaDisponivel);
                                                    }
                                                }}
                                                disabled={estaOcupado}
                                                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                                    estaOcupado
                                                        ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-800"
                                                        : estaDisponivel
                                                        ? "border-green-200 bg-green-50 text-green-800 hover:bg-red-50 hover:text-red-700"
                                                        : "border-gray-200 bg-white text-gray-400 hover:bg-green-50 hover:text-green-800"
                                                }`}
                                                title={
                                                    estaOcupado
                                                        ? "Este horário está ocupado por uma reserva durante a duração do serviço"
                                                        : estaDisponivel
                                                            ? "Remover somente deste dia"
                                                            : "Restaurar neste dia"
                                                }
                                            >
                                                {hora} · {estaOcupado
                                                    ? "Ocupado"
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

                <div className="mt-8 rounded-2xl bg-indigo-50 p-4 border border-indigo-100 flex items-center justify-between">
                    <p className="text-sm text-indigo-800 font-medium">Lembre-se de salvar para aplicar as alterações de horários e folgas na agenda das clientes.</p>
                    <button onClick={salvarConfiguracoes} className="rounded-xl bg-destaque px-6 py-3 font-bold text-white shadow-md transition hover:scale-[1.02]">
                        Salvar Alterações
                    </button>
                </div>
                    </div>
                </details>

                <div className="mt-8 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-tertiary">Agendar cliente</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Agende um novo atendimento ou registre um atendimento anterior. Os horários futuros seguem a disponibilidade da agenda.
                        </p>
                    </div>
                    <form onSubmit={adicionarAgendamentoManual} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <label className="block min-w-0 text-sm font-medium text-gray-700">
                            Nome da cliente
                            <input
                                type="text"
                                value={nomeClienteManual}
                                onChange={(event) => setNomeClienteManual(event.target.value)}
                                required
                                className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                                placeholder="Nome da cliente"
                            />
                        </label>
                        <label className="block min-w-0 text-sm font-medium text-gray-700">
                            Data do atendimento
                            <input
                                type="date"
                                value={dataManual}
                                onChange={(event) => {
                                    setDataManual(event.target.value);
                                    setHorarioManual("");
                                    setMensagemCadastroManual("");
                                }}
                                required
                                className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                            />
                        </label>
                        <label className="block min-w-0 text-sm font-medium text-gray-700">
                            Serviço
                            <select
                                value={servicoManual}
                                onChange={(event) => selecionarServicoManual(event.target.value)}
                                className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                            >
                                {servicos.map((servico) => (
                                    <option key={servico.nome} value={servico.nome}>{servico.nome}</option>
                                ))}
                            </select>
                        </label>
                        <div className="min-w-0 sm:col-span-2 xl:col-span-3">
                            {agendamentoManualFuturo ? (
                                <>
                                    <div className="mb-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">Escolha um dia</p>
                                        <div
                                            className="flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2"
                                            role="group"
                                            aria-label="Próximos dias para agendamento"
                                        >
                                            {diasProximos.map((dia) => {
                                                const selecionado = dataManual === dia.valor;
                                                const fechado = diasFechados.includes(dia.valor);
                                                return (
                                                    <button
                                                        key={dia.valor}
                                                        type="button"
                                                        onClick={() => {
                                                            setDataManual(dia.valor);
                                                            setHorarioManual("");
                                                            setMensagemCadastroManual("");
                                                        }}
                                                        disabled={fechado}
                                                        aria-pressed={selecionado}
                                                        className={`min-w-[76px] shrink-0 rounded-xl border px-3 py-2 text-center transition ${
                                                            fechado
                                                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                                                : selecionado
                                                                    ? "border-destaque bg-destaque text-white"
                                                                    : "border-gray-200 bg-white text-tertiary hover:border-destaque/50 hover:bg-primary"
                                                        }`}
                                                    >
                                                        <span className="block text-xs font-medium uppercase">{dia.rotulo}</span>
                                                        <span className="mt-0.5 block text-sm font-semibold">{dia.data}</span>
                                                        {fechado && <span className="mt-1 block text-xs">Fechado</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">Horários disponíveis</p>
                                    {diasFechados.includes(dataManual) ? (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                            O salão está fechado nesta data.
                                        </div>
                                    ) : horariosDisponiveisManuais.length === 0 ? (
                                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                                            Nenhum horário disponível para essa data.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] gap-2" role="group" aria-label="Horários disponíveis">
                                            {horariosDisponiveisManuais.map((horario) => (
                                                <button
                                                    key={horario}
                                                    type="button"
                                                    onClick={() => setHorarioManual(horario)}
                                                    aria-pressed={horarioManual === horario}
                                                    className={`w-full rounded-xl border px-2 py-2 text-sm font-medium transition ${
                                                        horarioManual === horario
                                                            ? "border-destaque bg-destaque text-white"
                                                            : "border-destaque/30 bg-primary text-tertiary hover:bg-secondary"
                                                    }`}
                                                >
                                                    {horario}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-3 text-sm text-gray-600" aria-live="polite">
                                        {horarioManual
                                            ? `Horário selecionado: ${horarioManual} · Término previsto: ${calcularHorarioTermino(horarioManual, Number(duracaoManual))}`
                                            : "Selecione um horário para continuar."}
                                    </p>
                                </>
                            ) : (
                                <label className="block min-w-0 max-w-sm text-sm font-medium text-gray-700">
                                    Horário do atendimento anterior
                                    <input
                                        type="time"
                                        value={horarioManual}
                                        onChange={(event) => setHorarioManual(event.target.value)}
                                        required
                                        className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                                    />
                                </label>
                            )}
                        </div>
                        <label className="block min-w-0 text-sm font-medium text-gray-700">
                            Valor cobrado (R$)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={valorManual}
                                onChange={(event) => setValorManual(event.target.value)}
                                required
                                className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                            />
                        </label>
                        <label className="block min-w-0 text-sm font-medium text-gray-700">
                            Duração (minutos)
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={duracaoManual}
                                onChange={(event) => setDuracaoManual(event.target.value)}
                                required
                                className="mt-1 box-border w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 p-3"
                            />
                        </label>
                        <div className="flex min-w-0 flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between xl:col-span-3">
                            <p role="status" className="min-w-0 break-words text-sm text-green-700">{mensagemCadastroManual}</p>
                            <button
                                type="submit"
                                disabled={salvandoAgendamento}
                                className="w-full shrink-0 rounded-xl bg-destaque px-6 py-3 font-semibold text-white transition hover:scale-[1.02] sm:w-auto"
                            >
                                {salvandoAgendamento
                                    ? "Salvando..."
                                    : agendamentoManualFuturo ? "Agendar cliente" : "Registrar atendimento"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ===== NOVA SESSÃO: AGENDAMENTOS AGRUPADOS POR DIA ===== */}
                <div className="mt-8 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-tertiary">Agenda de Clientes</h2>

                    {erroAgendamentos ? (
                        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {erroAgendamentos}
                        </div>
                    ) : carregandoAgendamentos ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                            Carregando agendamentos...
                        </div>
                    ) : datasComAgendamento.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                            Ainda não há clientes agendadas.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {gruposDeDatas.map((grupo) => {
                                const isGrupoAnterior = grupo.titulo === "Agendamentos anteriores";
                                const quantidadeAgendamentos = grupo.datas.reduce(
                                    (total, data) => total + agendamentosAgrupados[data].length,
                                    0
                                );

                                return (
                                <section key={grupo.titulo} className="space-y-4">
                                    {isGrupoAnterior ? (
                                        <button
                                            type="button"
                                            aria-expanded={anterioresExpandidos}
                                            aria-controls="lista-agendamentos-anteriores"
                                            onClick={() => setAnterioresExpandidos((expandido) => !expandido)}
                                            className="flex w-full items-center justify-between border-b border-gray-200 pb-2 text-left text-sm font-bold uppercase tracking-wide text-gray-500 transition hover:text-destaque"
                                        >
                                            <span>{grupo.titulo} ({quantidadeAgendamentos})</span>
                                            <span className="text-destaque">
                                                {anterioresExpandidos ? "Ver menos −" : "Ver mais +"}
                                            </span>
                                        </button>
                                    ) : (
                                        <h3 className="border-b border-gray-200 pb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                                            {grupo.titulo}
                                        </h3>
                                    )}
                                    {(!isGrupoAnterior || anterioresExpandidos) && (
                                    <div
                                        id={isGrupoAnterior ? "lista-agendamentos-anteriores" : undefined}
                                        className="space-y-4"
                                    >
                                    {grupo.datas.map((dataGrupo) => {
                                const dataLocal = new Date(`${dataGrupo}T12:00:00`);
                                const dataFormatada = dataLocal.toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                });
                                const isHoje = dataGrupo === dataHojeStr;
                                const amanha = new Date(hojeData);
                                amanha.setDate(amanha.getDate() + 1);
                                const isAmanha = dataGrupo === obterDataISO(amanha);
                                
                                return (
                                    <div key={dataGrupo}>
                                        <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-2">
                                            <h4 className="text-lg font-bold capitalize text-tertiary">{dataFormatada}</h4>
                                            {isHoje && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">HOJE</span>}
                                            {isAmanha && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">AMANHÃ</span>}
                                            <span className="text-sm text-gray-500">
                                                {agendamentosAgrupados[dataGrupo].length} {agendamentosAgrupados[dataGrupo].length === 1 ? "cliente" : "clientes"}
                                            </span>
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {[...agendamentosAgrupados[dataGrupo]].sort(compararAgendamentos).map((agendamento, index) => {
                                                const estaEditando = agendamentoEmEdicao === agendamento;
                                                const historicoEdicoes = Array.isArray(agendamento.historicoEdicoes)
                                                    ? agendamento.historicoEdicoes
                                                    : [];
                                                return (
                                                <div key={`${dataGrupo}-${index}`} className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-primary p-4 transition hover:border-destaque/50">
                                                    <button 
                                                        onClick={() => removerAgendamento(agendamento)}
                                                        className="absolute right-3 top-3 p-1 text-sm font-bold text-gray-400 hover:text-red-500"
                                                        title="Remover Agendamento"
                                                    >
                                                        ✕
                                                    </button>
                                                    <span className="self-start rounded-md bg-destaque px-2 py-1 text-xs font-bold text-white">
                                                        Início: {agendamento.horario}
                                                    </span>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        Término previsto: {calcularHorarioTermino(agendamento.horario, Number(agendamento.duracao) || 15) || "—"}
                                                    </p>
                                                    <h3 className="mt-1 text-lg font-bold text-tertiary">{agendamento.nomeCliente}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Serviço:</span> {agendamento.servico}
                                                    </p>
                                                    <p className="text-sm font-medium text-green-600 mt-1">
                                                        R$ {agendamento.valor}
                                                    </p>
                                                    {historicoEdicoes.length > 0 && (
                                                        <p className="text-xs text-gray-600">
                                                            <span className="font-semibold">Motivo da última edição:</span>{" "}
                                                            {historicoEdicoes[historicoEdicoes.length - 1].observacao}
                                                        </p>
                                                    )}
                                                    {estaEditando ? (
                                                        <div className="mt-2 space-y-2 border-t border-gray-200 pt-3">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Novo valor (R$)
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={valorEditado}
                                                                    onChange={(event) => setValorEditado(event.target.value)}
                                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2"
                                                                />
                                                            </label>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Motivo da alteração
                                                                <textarea
                                                                    value={observacaoEdicao}
                                                                    onChange={(event) => setObservacaoEdicao(event.target.value)}
                                                                    rows={2}
                                                                    required
                                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2"
                                                                    placeholder="Descreva o adicional solicitado"
                                                                />
                                                            </label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => salvarEdicaoAgendamento(agendamento)}
                                                                    className="rounded-lg bg-destaque px-3 py-2 text-sm font-semibold text-white"
                                                                >
                                                                    Salvar
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={cancelarEdicaoAgendamento}
                                                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => iniciarEdicaoAgendamento(agendamento)}
                                                            className="mt-2 self-start rounded-lg border border-destaque px-3 py-1.5 text-sm font-semibold text-destaque transition hover:bg-destaque hover:text-white"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                                    })}
                                    </div>
                                    )}
                                </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}