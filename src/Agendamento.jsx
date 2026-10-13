import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

// Função mágica que transforma "14:30" em minutos (870) para o computador calcular
const converterParaMinutos = (horaString) => {
    const [horas, minutos] = horaString.split(":").map(Number);
    return horas * 60 + minutos;
};

export default function Agendamento() {
    const location = useLocation();
    const servico = location.state?.servicoSelecionado;

    const [nome, setNome] = useState("");
    const [dataEscolhida, setDataEscolhida] = useState("");
    const [horarioEscolhido, setHorarioEscolhido] = useState("");

    // O que vem do painel da Lídia
    const [configSalao, setConfigSalao] = useState({ diasFechados: [], horariosDisponiveis: [] });
    // O que vem das clientes que já agendaram
    const [agendamentosJaFeitos, setAgendamentosJaFeitos] = useState([]);

    useEffect(() => {
        // Puxa as regras de folga e horários do painel
        const configSalva = localStorage.getItem("configSalao");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (configSalva) setConfigSalao(JSON.parse(configSalva));

        // Puxa os agendamentos antigos para saber o que já está ocupado
        const agendamentosSalvos = localStorage.getItem("agendamentos");
        if (agendamentosSalvos) setAgendamentosJaFeitos(JSON.parse(agendamentosSalvos));
    }, []);

    if (!servico) {
        return (
            <div className="min-h-screen p-5 flex flex-col items-center justify-center">
                <p>Nenhum serviço selecionado.</p>
                <Link to="/" className="text-destaque font-bold mt-4">
                    Voltar ao Catálogo
                </Link>
            </div>
        );
    }
    // Verifica se a lista existe antes de tentar procurar a data nela
    const isDiaFechado = Array.isArray(configSalao.diasFechados) && configSalao.diasFechados.includes(dataEscolhida);

    // FILTRO INTELIGENTE DE HORÁRIOS
    const horariosLivres = configSalao.horariosDisponiveis.filter((horaCandidata) => {
        // Calcula que horas esse serviço começa e termina
        const inicioNovoServico = converterParaMinutos(horaCandidata);
        const fimNovoServico = inicioNovoServico + servico.tempoEstimado;

        // Pega só os agendamentos que já existem no dia que a cliente clicou
        const agendamentosDoDia = agendamentosJaFeitos.filter((a) => a.data === dataEscolhida);

        // Verifica se existe algum conflito de tempo
        const temConflito = agendamentosDoDia.some((agendado) => {
            const inicioAgendado = converterParaMinutos(agendado.horario);
            const fimAgendado = inicioAgendado + agendado.duracao;

            // Se o novo começar antes do antigo terminar E o novo terminar depois do antigo começar, é choque!
            return inicioNovoServico < fimAgendado && fimNovoServico > inicioAgendado;
        });

        // Só mantém o botão na tela se NÃO tiver conflito
        return !temConflito;
    });

    const processarAgendamento = () => {
        // 1. Bloqueia o horário na tela da cliente (para não clicar duas vezes sem querer)
        const novoAgendamento = {
            data: dataEscolhida,
            horario: horarioEscolhido,
            duracao: servico.tempoEstimado,
            nomeCliente: nome,
            servico: servico.nome,
            valor: servico.valor,
        };

        const todosAgendamentos = [...agendamentosJaFeitos, novoAgendamento];
        localStorage.setItem("agendamentos", JSON.stringify(todosAgendamentos));
        setAgendamentosJaFeitos(todosAgendamentos);

        // ==========================================
        // 2. INTEGRAÇÃO COM O WHATSAPP
        // ==========================================

        // ATENÇÃO: Coloque o número real da Lídia aqui (55 + DDD + Número)
        const numeroLidia = "5588992137098";

        // Transforma a data de YYYY-MM-DD para DD/MM/YYYY
        const dataFormatada = dataEscolhida.split("-").reverse().join("/");

        // Monta o texto que vai chegar no celular da Lídia
        const mensagem =
            `Olá, Lídia! Gostaria de agendar um horário. 💅\n\n` +
            `*Serviço:* ${servico.nome}\n` +
            `*Nome:* ${nome}\n` +
            `*Data:* ${dataFormatada}\n` +
            `*Horário:* ${horarioEscolhido}\n` +
            `*Valor:* R$ ${servico.valor}\n\n` +
            `Podemos confirmar?`;

        // Transforma o texto num link seguro e abre o WhatsApp numa nova aba
        const urlWhatsApp = `https://wa.me/${numeroLidia}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsApp, "_blank");

        // 3. Limpa os campos para o próximo agendamento
        setHorarioEscolhido("");
        setNome("");
    };

    return (
        <section className="min-h-screen p-5">
            <Link to="/" className="text-tertiary mb-6 inline-block font-medium">
                ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-tertiary mb-2">Agendar Serviço</h1>

            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
                <h2 className="font-bold text-destaque">{servico.nome}</h2>
                <p className="text-tertiary text-sm">
                    Valor: R$ {servico.valor} | Tempo: {servico.tempoEstimado} min
                </p>
            </div>

            <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-tertiary">Seu Nome</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        className="border rounded-lg p-3 focus:outline-none focus:border-destaque"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-tertiary">Escolha a Data</label>
                    <input
                        type="date"
                        value={dataEscolhida}
                        onChange={(e) => {
                            setDataEscolhida(e.target.value);
                            setHorarioEscolhido("");
                        }}
                        className="border rounded-lg p-3 focus:outline-none focus:border-destaque"
                    />
                </div>

                {dataEscolhida && (
                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-sm font-medium text-tertiary">Horários Disponíveis</label>

                        {isDiaFechado ? (
                            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center border border-red-200">
                                O salão estará fechado neste dia.
                            </div>
                        ) : horariosLivres.length === 0 ? (
                            <div className="bg-orange-50 text-orange-600 p-4 rounded-lg text-center border border-orange-200">
                                Todos os horários esgotados para esta data!
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {/* Aqui trocamos configSalao.horariosDisponiveis por horariosLivres! */}
                                {horariosLivres.map((hora) => (
                                    <button
                                        key={hora}
                                        type="button"
                                        onClick={() => setHorarioEscolhido(hora)}
                                        className={`p-3 rounded-lg border font-medium transition-colors ${
                                            horarioEscolhido === hora
                                                ? "bg-destaque text-white border-destaque"
                                                : "bg-white text-tertiary border-gray-300 hover:border-destaque"
                                        }`}
                                    >
                                        {hora}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={processarAgendamento}
                    disabled={!nome || !dataEscolhida || !horarioEscolhido}
                    className="bg-destaque text-white font-bold rounded-lg p-4 mt-6 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    Confirmar Agendamento
                </button>
            </form>
        </section>
    );
}
