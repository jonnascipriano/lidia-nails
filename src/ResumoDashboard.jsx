import { useState, useEffect } from "react";

export default function ResumoDashboard() {
    const [resumoHoje, setResumoHoje] = useState({ qtd: 0, valor: 0 });
    const [resumoSemana, setResumoSemana] = useState({ qtd: 0, valor: 0 });
    const [resumoMes, setResumoMes] = useState({ qtd: 0, valor: 0 });

    useEffect(() => {
        const atualizarResumo = () => {
            const agendamentosSalvos = localStorage.getItem("agendamentos");
            const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, "0");
            const dia = String(hoje.getDate()).padStart(2, "0");
            const dataHojeStr = `${ano}-${mes}-${dia}`;
            const agoraEmSegundos = hoje.getHours() * 3600 + hoje.getMinutes() * 60 + hoje.getSeconds();

            const diaSemana = hoje.getDay();
            const diffParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

            const primeiraSegunda = new Date(hoje);
            primeiraSegunda.setDate(hoje.getDate() - diffParaSegunda);

            const anoSeg = primeiraSegunda.getFullYear();
            const mesSeg = String(primeiraSegunda.getMonth() + 1).padStart(2, "0");
            const diaSeg = String(primeiraSegunda.getDate()).padStart(2, "0");
            const dataSegundaStr = `${anoSeg}-${mesSeg}-${diaSeg}`;

            const anoMesStr = `${ano}-${mes}`;

            let calcHoje = { qtd: 0, valor: 0 };
            let calcSemana = { qtd: 0, valor: 0 };
            let calcMes = { qtd: 0, valor: 0 };

            agendamentos.forEach((ag) => {
                if (ag.data > dataHojeStr) return;

                if (ag.data === dataHojeStr) {
                    if (typeof ag.horario !== "string") return;

                    const [horas, minutos] = ag.horario.split(":").map(Number);
                    if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return;

                    const inicioEmSegundos = horas * 3600 + minutos * 60;
                    const duracaoEmSegundos = (Number(ag.duracao) || 0) * 60;
                    if (inicioEmSegundos + duracaoEmSegundos > agoraEmSegundos) return;
                }

                const valorNumerico = Number(ag.valor) || 0;

                if (ag.data === dataHojeStr) {
                    calcHoje.qtd += 1;
                    calcHoje.valor += valorNumerico;
                }

                if (ag.data >= dataSegundaStr && ag.data <= dataHojeStr) {
                    calcSemana.qtd += 1;
                    calcSemana.valor += valorNumerico;
                }

                if (ag.data.startsWith(anoMesStr)) {
                    calcMes.qtd += 1;
                    calcMes.valor += valorNumerico;
                }
            });
            setResumoHoje(calcHoje);
            setResumoSemana(calcSemana);
            setResumoMes(calcMes);
        };

        atualizarResumo();
        const intervalo = setInterval(atualizarResumo, 60 * 1000);
        return () => clearInterval(intervalo);
    }, []);

    return (
        <section className="bg-primary min-h-screen w-full">
            {/* Titulo da página */}
            <div className="p-5">
                <h1>Dashboard</h1>
                <p className="text-tertiary tracking-wide pl-0.5">Resumo do seu negócio.</p>
            </div>

            <div className="flex flex-wrap gap-5 justify-center m-5">
                <div className="w-full">
                    {/* Resumo do dia */}
                    <div className="flex-1 p-5 rounded-2xl bg-gray-800 shadow-2xl flex flex-col gap-2">
                        <p className="text-info font-semibold">Faturamento hoje</p>
                        <h2 className="text-green-300 font-bold text-4xl">R$ {resumoHoje.valor}</h2>
                        <p className="text-destaque">
                            {resumoHoje.qtd} {resumoHoje.qtd === 1 ? "agendamento" : "agendamentos"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-5 w-full justify-center">
                    {/* Resumo da Semana */}
                    <div className="bg-secondary p-5 w-full rounded-2xl shadow-2xl flex flex-col gap-2">
                        <p className="text-sm text-info">Esta Semana</p>
                        <h2 className="text-2xl font-medium">R$ {resumoSemana.valor}</h2>
                        <p className="text-xs text-info">{resumoSemana.qtd} {resumoSemana.qtd === 1 ? "agendamento" : "agendamentos"}</p>
                    </div>
                    {/* Resumo do mês */}
                    <div className="bg-secondary p-5 w-full rounded-2xl shadow-2xl flex flex-col gap-2">
                        <p className="text-sm text-info">Este mês</p>
                        <h2 className="text-2xl font-medium">R$ {resumoMes.valor}</h2>
                        <p className="text-xs text-info">{resumoMes.qtd} {resumoMes.qtd === 1 ? "agendamento" : "agendamentos"}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
