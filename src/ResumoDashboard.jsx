import { useState, useEffect } from "react";
import { calcularHorarioTermino } from "./horarios";
import { observarAgendamentos } from "./agendamentosFirebase";
import { observarGastos } from "./gastosFirebase";

const obterDataLocal = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
}).format(valor);

export default function ResumoDashboard() {
    const [resumoHoje, setResumoHoje] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [resumoSemana, setResumoSemana] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [resumoMes, setResumoMes] = useState({ qtd: 0, valor: 0, qtdTotal: 0, valorTotal: 0 });
    const [agendamentosPorDia, setAgendamentosPorDia] = useState({});
    const [erroAgendamentos, setErroAgendamentos] = useState("");
    const [agendamentos, setAgendamentos] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [erroGastos, setErroGastos] = useState("");

    useEffect(() => {
        return observarAgendamentos(
            (lista) => {
                setAgendamentos(lista);
                setErroAgendamentos("");
            },
            (erro) => setErroAgendamentos(`Não foi possível carregar os agendamentos: ${erro.message}`)
        );
    }, []);

    useEffect(() => observarGastos(
        (lista) => {
            setGastos(lista);
            setErroGastos("");
        },
        (erro) => setErroGastos(`Não foi possível carregar os gastos: ${erro.message}`)
    ), []);

    const mesAtual = obterDataLocal().slice(0, 7);
    const totalGastosMes = gastos
        .filter((gasto) => gasto.data?.startsWith(mesAtual))
        .reduce((total, gasto) => total + (Number(gasto.valor) || 0), 0);

    useEffect(() => {
        const atualizarResumo = () => {
            const agendamentosOrdenados = [...agendamentos].sort((a, b) => {
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

            agendamentosOrdenados.forEach((ag) => {
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
    }, [agendamentos]);

    const datasOrdenadas = Object.keys(agendamentosPorDia).sort();
    const hojeISO = obterDataLocal();

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Resumo</h2>
                <p className="mt-1 text-sm text-info">Acompanhe atendimentos, faturamento e despesas do salão.</p>
            </div>

            {erroGastos && (
                <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{erroGastos}</p>
            )}

                {/* Cards de Métricas */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Resumo Hoje */}
                    <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                                Hoje
                            </span>
                            <p className="mt-4 text-sm text-info">Faturamento realizado</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-800">{formatarMoeda(resumoHoje.valor)}</h3>
                            <p className="mt-2 text-xs text-info">
                                {resumoHoje.qtd} de {resumoHoje.qtdTotal} {resumoHoje.qtdTotal === 1 ? "atendimento concluído" : "atendimentos concluídos"}
                            </p>
                        </div>
                        <div className="mt-5 flex justify-between border-t border-emerald-200 pt-3 text-xs text-info">
                            <span>Previsão total hoje</span>
                            <strong className="text-tertiary">{formatarMoeda(resumoHoje.valorTotal)}</strong>
                        </div>
                    </div>

                    {/* Resumo da Semana */}
                    <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                        <div>
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-800">
                                Esta semana
                            </span>
                            <p className="mt-4 text-sm text-info">Faturamento realizado</p>
                            <h3 className="mt-1 text-2xl font-bold">{formatarMoeda(resumoSemana.valor)}</h3>
                            <p className="mt-2 text-xs text-info">
                                {resumoSemana.qtd} {resumoSemana.qtd === 1 ? "atendimento realizado" : "atendimentos realizados"}
                            </p>
                        </div>
                        <div className="mt-5 flex justify-between border-t border-stone-100 pt-3 text-xs text-info">
                            <span>Previsão total</span>
                            <strong className="text-destaque">{formatarMoeda(resumoSemana.valorTotal)}</strong>
                        </div>
                    </div>

                    {/* Resumo do Mês */}
                    <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                        <div>
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destaque">
                                Este mês
                            </span>
                            <p className="mt-4 text-sm text-info">Faturamento realizado</p>
                            <h3 className="mt-1 text-2xl font-bold">{formatarMoeda(resumoMes.valor)}</h3>
                            <p className="mt-2 text-xs text-info">
                                {resumoMes.qtd} {resumoMes.qtd === 1 ? "atendimento realizado" : "atendimentos realizados"}
                            </p>
                        </div>
                        <div className="mt-5 flex justify-between border-t border-stone-100 pt-3 text-xs text-info">
                            <span>Previsão total</span>
                            <strong className="text-destaque">{formatarMoeda(resumoMes.valorTotal)}</strong>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                        <div>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-800">
                                Saldo do mês
                            </span>
                            <p className="mt-4 text-sm text-info">Realizado menos gastos</p>
                            <h3 className={`mt-1 text-2xl font-bold ${resumoMes.valor - totalGastosMes >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
                                {formatarMoeda(resumoMes.valor - totalGastosMes)}
                            </h3>
                            <p className="mt-2 text-xs text-info">Gastos cadastrados: {formatarMoeda(totalGastosMes)}</p>
                        </div>
                    </div>
                </div>

                {/* Lista de Agendamentos por Dia */}
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-6 text-xl font-bold text-tertiary">Histórico e Próximos Agendamentos</h2>

                    {erroAgendamentos ? (
                        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {erroAgendamentos}
                        </div>
                    ) : datasOrdenadas.length === 0 ? (
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
                                                            Início: {ag.horario}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-500">
                                                            {ag.duracao ? `${ag.duracao} min` : "15 min"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        Término previsto: {calcularHorarioTermino(ag.horario, Number(ag.duracao) || 15) || "—"}
                                                    </p>

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
        </section>
    );
}