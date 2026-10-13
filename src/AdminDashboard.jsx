import { useState, useEffect } from "react";

export default function AdminDashboard({ onLogout }) {
    // Estados para guardar as configurações
    const [diasFechados, setDiasFechados] = useState([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    
    // Estados para os inputs (o que ela está digitando agora)
    const [novoDia, setNovoDia] = useState("");
    const [novoHorario, setNovoHorario] = useState("");

    // Carrega as configurações salvas assim que a tela abre
    useEffect(() => {
        const configSalva = localStorage.getItem("configSalao");
        if (configSalva) {
            const config = JSON.parse(configSalva);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDiasFechados(config.diasFechados || []);
            setHorariosDisponiveis(config.horariosDisponiveis || []);
        } else {
            // Se for a primeira vez, coloca uns horários padrão
            setHorariosDisponiveis(["08:00"]);
        }
    }, []);

    // Função para salvar no "banco de dados" (localStorage)
    const salvarConfiguracoes = () => {
        const config = { diasFechados, horariosDisponiveis };
        localStorage.setItem("configSalao", JSON.stringify(config));
        alert("Configurações salvas com sucesso!");
    };

    // Funções de Adicionar/Remover
    const adicionarDia = () => {
        if (novoDia && !diasFechados.includes(novoDia)) {
            setDiasFechados([...diasFechados, novoDia].sort());
            setNovoDia("");
        }
    };

    const removerDia = (diaParaRemover) => {
        setDiasFechados(diasFechados.filter(dia => dia !== diaParaRemover));
    };

    const adicionarHorario = () => {
        if (novoHorario && !horariosDisponiveis.includes(novoHorario)) {
            setHorariosDisponiveis([...horariosDisponiveis, novoHorario].sort());
            setNovoHorario("");
        }
    };

    const removerHorario = (horaParaRemover) => {
        setHorariosDisponiveis(horariosDisponiveis.filter(hora => hora !== horaParaRemover));
    };

    return (
        <section className="min-h-screen bg-gray-50 p-5">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-tertiary">Painel de Controle</h1>
                    <p className="text-sm text-gray-500">Olá, Lídia! Gerencie sua agenda aqui.</p>
                </div>
                <button onClick={onLogout} className="text-destaque font-medium underline">
                    Sair
                </button>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                {/* BLOCO 1: DIAS FECHADOS */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-lg text-tertiary mb-4">Dias Fechados (Folgas/Feriados)</h2>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="date" 
                            value={novoDia} 
                            onChange={(e) => setNovoDia(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 flex-1"
                        />
                        <button onClick={adicionarDia} className="bg-destaque text-white px-4 py-2 rounded-lg font-medium">
                            Adicionar
                        </button>
                    </div>

                    <ul className="flex flex-col gap-2">
                        {diasFechados.map(dia => (
                            <li key={dia} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                <span>{dia.split('-').reverse().join('/')}</span>
                                <button onClick={() => removerDia(dia)} className="text-red-500 font-bold px-2">X</button>
                            </li>
                        ))}
                        {diasFechados.length === 0 && <p className="text-sm text-gray-400">Nenhum dia fechado.</p>}
                    </ul>
                </div>

                {/* BLOCO 2: HORÁRIOS */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-lg text-tertiary mb-4">Horários de Atendimento</h2>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="time" 
                            value={novoHorario} 
                            onChange={(e) => setNovoHorario(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 flex-1"
                        />
                        <button onClick={adicionarHorario} className="bg-tertiary text-white px-4 py-2 rounded-lg font-medium">
                            Adicionar
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {horariosDisponiveis.map(hora => (
                            <div key={hora} className="bg-primary text-destaque border border-destaque/30 px-3 py-1 rounded-full flex items-center gap-2">
                                <span>{hora}</span>
                                <button onClick={() => removerHorario(hora)} className="font-bold">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button onClick={salvarConfiguracoes} className="w-full bg-destaque text-white font-bold rounded-lg p-4 mt-8 active:scale-95">
                Salvar Alterações
            </button>
        </section>
    );
}