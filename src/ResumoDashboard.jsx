import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ResumoDashboard() {
    const [resumoHoje, setResumoHoje] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [resumoSemana, setResumoSemana] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [resumoMes, setResumoMes] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [agendamentosPorDia, setAgendamentosPorDia] = useState({});

    useEffect(() => {
        const atualizarResumo = () => {
            const agendamentosSalvos = localStorage.getItem("agendamentos");
            const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

            // Ordena agendamentos por data e horário
            agendamentos.sort((a, b) => {
                if (a.data === b.data) return a.horario.localeCompare(b.horario);
                return a.data.localeCompare(b.data);
            });

            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, "0");
            const dia = String(hoje.getDate()).padStart(2, "0");
            const dataHojeStr = `${ano}-${mes}-${dia}`;
            const agoraEmSegundos = hoje.getHours() * 3600 + hoje.getMinutes() * 60 + hoje.getSeconds();

            // Cálculo da semana (Segunda a Domingo)
            const diaSemana = hoje.getDay();
            const diffParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
            const primeiraSegunda = new Date(hoje);
            primeiraSegunda.setDate(hoje.getDate() - diffParaSegunda);

            const anoSeg = primeiraSegunda.getFullYear();
            const mesSeg = String(primeiraSegunda.getMonth() + 1).padStart(2, "0");
            const diaSeg = String(primeiraSegunda.getDate()).padStart(2, "0");
            const dataSegundaStr = `${anoSeg}-${mesSeg}-${diaSeg}`;

            const domingo = new Date(primeiraSegunda);
            domingo.setDate(primeiraSegunda.getDate() + 6);
            const anoDom = domingo.getFullYear();
            const mesDom = String(domingo.getMonth() + 1).padStart(2, "0");
            const diaDom = String(domingo.getDate()).padStart(2, "0");
            const dataDomingoStr = `${anoDom}-${mesDom}-${diaDom}`;

            const anoMesStr = `${ano}-${mes}`;

            let calcHoje = { qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 };
            let calcSemana = { qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 };
            let calcMes = { qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 };

            const grupos = {};

            agendamentos.forEach((ag) => {
                // Agrupamento de agendamentos por data
                if (!grupos[ag.data]) {
                    grupos[ag.data] = [];
                }
                grupos[ag.data].push(ag);

                const valorNumerico = Number(ag.valor) || 0;

                // Verificação se o horário de HOJE já passou
                let atendeuHoje = false;
                if (ag.data === dataHojeStr && typeof ag.horario === "string") {
                    const [horas, minutos] = ag.horario.split(":").map(Number);
                    if (Number.isFinite(horas) && Number.isFinite(minutos)) {
                        const inicioEmSegundos = horas * 3600 + minutos * 60;
                        const duracaoEmSegundos = (Number(ag.duracao) || 15) * 60;
                        if (inicioEmSegundos + duracaoEmSegundos <= agoraEmSegundos) {
                            atendeuHoje = true;
                        }
                    }
                }

                // Cálculo HOJE
                if (ag.data === dataHojeStr) {
                    calcHoje.qtdTotal += 1;
                    calcHoje.valorTotal += valorNumerico;
                    if (atendeuHoje) {
                        calcHoje.qtd += 1;
                        calcHoje.valor += valorNumerico;
                    }
                }

                // Cálculo SEMANA (Seg a Dom)
                if (ag.data >= dataSegundaStr && ag.data <= dataDomingoStr) {
                    calcSemana.qtdTotal += 1;
                    calcSemana.valorTotal += valorNumerico;
                    if (ag.data < dataHojeStr || (ag.data === dataHojeStr && atendeuHoje)) {
                        calcSemana.qtd += 1;
                        calcSemana.valor += valorNumerico;
                    }
                }

                // Cálculo MÊS
                if (ag.data.startsWith(anoMesStr)) {
                    calcMes.qtdTotal += 1;
                    calcMes.valorTotal += valorNumerico;
                    if (ag.data < dataHojeStr || (ag.data === dataHojeStr && atendeuHoje)) {
                        calcMes.qtd += 1;
                        calcMes.valor += valorNumerico;
                    }
                }
            });

            setResumoHoje(calcHoje);
            setResumoSemana(calcSemana);
            setResumoMes(calcMes);
            setAgendamentosPorDia(grupos);
        };

        atualizarResumo();
        const intervalo = setInterval(atualizarResumo, 60 * 1000);
        return () => clearInterval(intervalo);
    }, []);

    const datasOrdenadas = Object.keys(agendamentosPorDia).sort();
    const hojeISO = new Date().toISOString().split("T")[0];

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#fff8f5] via-[#fff] to-[#f8f1ff] p-5">
            <div className="mx-auto max-w-7xl">
                {/* Cabeçalho de Navegação */}
                <header className="mb-8 flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-destaque">Lídia Nails</p>
                        <h1 className="mt-2 text-3xl font-bold text-tertiary">Dashboard Financeiro</h1>
                        <p className="mt-1 text-sm text-gray-500">Acompanhamento do faturamento e métricas de agendamentos.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="rounded-full bg-tertiary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tertiary/90"
                        >
                            Painel Admin
                        </Link>
                    </div>
                </header>

                {/* Cards de Métricas */}
                <div className="mb-8 grid gap-5 md:grid-cols-3">
                    {/* Resumo Hoje */}
                    <div className="rounded-[26px] bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-lg flex flex-col justify-between">
                        <div>
                            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 uppercase tracking-wider">
                                Hoje
                            </span>
                            <p className="mt-4 text-sm text-gray-300">Faturamento Realizado</p>
                            <h2 className="mt-1 text-4xl font-extrabold text-green-400">R$ {resumoHoje.valor}</h2>
                            <p className="mt-2 text-xs text-gray-400">
                                {resumoHoje.qtd} de {resumoHoje.qtdTotal} {resumoHoje.qtdTotal === 1 ? "atendimento concluído" : "atendimentos concluídos"}
                            </p>
                        </div>
                        <div className="mt-6 border-t border-gray-700/60 pt-3 flex justify-between text-xs text-gray-300">
                            <span>Previsão Total Hoje:</span>
                            <strong className="text-white">R$ {resumoHoje.valorTotal}</strong>
                        </div>
                    </div>

                    {/* Resumo da Semana */}
                    <div className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                Esta Semana (Seg a Dom)
                            </span>
                            <p className="mt-4 text-sm text-gray-500">Realizado na Semana</p>
                            <h2 className="mt-1 text-3xl font-bold text-tertiary">R$ {resumoSemana.valor}</h2>
                            <p className="mt-2 text-xs text-gray-500">
                                {resumoSemana.qtd} {resumoSemana.qtd === 1 ? "atendimento realizado" : "atendimentos realizados"}
                            </p>
                        </div>
                        <div className="mt-6 border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-600">
                            <span>Previsão Total da Semana:</span>
                            <strong className="text-destaque">R$ {resumoSemana.valorTotal}</strong>
                        </div>
                    </div>

                    {/* Resumo do Mês */}
                    <div className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-destaque uppercase tracking-wider">
                                Este Mês
                            </span>
                            <p className="mt-4 text-sm text-gray-500">Realizado no Mês</p>
                            <h2 className="mt-1 text-3xl font-bold text-tertiary">R$ {resumoMes.valor}</h2>
                            <p className="mt-2 text-xs text-gray-500">
                                {resumoMes.qtd} {resumoMes.qtd === 1 ? "atendimento realizado" : "atendimentos realizados"}
                            </p>
                        </div>
                        <div className="mt-6 border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-600">
                            <span>Previsão Total do Mês:</span>
                            <strong className="text-destaque">R$ {resumoMes.valorTotal}</strong>
                        </div>
                    </div>
                </div>

                {/* Lista de Agendamentos por Dia */}
                <div className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-tertiary">Histórico e Próximos Agendamentos</h2>

                    {datasOrdenadas.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                            Nenhum agendamento registrado no sistema.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {datasOrdenadas.map((dataGrupo) => {
                                const dataFormatada = dataGrupo.split("-").reverse().join("/");
                                const isHoje = dataGrupo === hojeISO;
                                const listaDoDia = agendamentosPorDia[dataGrupo];

                                return (
                                    <div key={dataGrupo}>
                                        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                                            <h3 className="text-lg font-bold text-tertiary">{dataFormatada}</h3>
                                            {isHoje && (
                                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                                    HOJE
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {listaDoDia.map((ag, idx) => (
                                                <div
                                                    key={`${dataGrupo}-${idx}`}
                                                    className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-primary p-4 transition hover:border-destaque/40"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="rounded-md bg-destaque px-2.5 py-1 text-xs font-bold text-white">
                                                            {ag.horario}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-500">
                                                            {ag.duracao ? `${ag.duracao} min` : "15 min"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-base font-bold text-tertiary">{ag.nomeCliente}</h4>
                                                        <p className="text-sm text-gray-600">{ag.servico}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-sm font-bold text-green-600">
                                                        <span>R$ {ag.valor}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}