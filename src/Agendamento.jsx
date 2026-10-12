import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Agendamento() {
    const location = useLocation();
    const servico = location.state?.servicoSelecionado;

    // Estados para guardar o que a cliente digitou/escolheu
    const [nome, setNome] = useState("");
    const [dataEscolhida, setDataEscolhida] = useState("");
    const [horarioEscolhido, setHorarioEscolhido] = useState("");

    // No topo do arquivo, não esqueça de importar o useEffect junto com o useState:
    // import { useState, useEffect } from "react";

    const [configSalao, setConfigSalao] = useState({ diasFechados: [], horariosDisponiveis: [] });

    useEffect(() => {
        // Puxa as configurações reais que a Lídia salvou no Admin
        const configSalva = localStorage.getItem("configSalao");
        if (configSalva) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setConfigSalao(JSON.parse(configSalva));
        }
    }, []);

    // Verifica se a data que a cliente escolheu está na lista de dias fechados
    const isDiaFechado = configSalao.diasFechados.includes(dataEscolhida);

    if (!servico) {
        return (
            <div className="min-h-screen p-5 flex flex-col items-center justify-center">
                <p>Nenhum serviço selecionado.</p>
                <Link to="/" className="text-destaque font-bold mt-4">Voltar ao Catálogo</Link>
            </div>
        );
    }

    return (
        <section className="min-h-screen p-5">
            <Link to="/" className="text-tertiary mb-6 inline-block font-medium">
                ← Voltar
            </Link>

            <h1 className="text-2xl font-bold text-tertiary mb-2">Agendar Serviço</h1>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
                <h2 className="font-bold text-destaque">{servico.nome}</h2>
                <p className="text-tertiary text-sm">Valor: R$ {servico.valor} | Tempo: {servico.tempoEstimado} min</p>
            </div>

            <form className="flex flex-col gap-5">
                {/* NOME */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-tertiary">Seu Nome</label>
                    <input 
                        type="text" 
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-destaque"
                    />
                </div>

                {/* DATA */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-tertiary">Escolha a Data</label>
                    <input 
                        type="date" 
                        value={dataEscolhida}
                        onChange={(e) => {
                            setDataEscolhida(e.target.value);
                            setHorarioEscolhido(""); // Reseta o horário se trocar de dia
                        }}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-destaque"
                    />
                </div>

                {/* HORÁRIOS (Só aparece se a cliente escolheu uma data válida) */}
                {dataEscolhida && (
                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-sm font-medium text-tertiary">Horários Disponíveis</label>
                        
                        {isDiaFechado ? (
                            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center font-medium border border-red-200">
                                O salão estará fechado neste dia. Por favor, escolha outra data!
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {configSalao.horariosDisponiveis.map((hora) => (
                                    <button
                                        key={hora}
                                        type="button"
                                        onClick={() => setHorarioEscolhido(hora)}
                                        className={`p-3 rounded-lg border font-medium transition-colors ${
                                            horarioEscolhido === hora 
                                            ? "bg-destaque text-white border-destaque" // Selecionado
                                            : "bg-white text-tertiary border-gray-300 hover:border-destaque" // Não selecionado
                                        }`}
                                    >
                                        {hora}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* BOTÃO CONFIRMAR */}
                <button 
                    type="button" 
                    disabled={!nome || !dataEscolhida || !horarioEscolhido} // Desativa se faltar algo
                    className="bg-destaque text-white font-bold rounded-lg p-4 mt-6 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirmar Agendamento
                </button>
            </form>
        </section>
    );
}