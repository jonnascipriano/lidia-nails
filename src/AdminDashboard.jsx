import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ButtonSwitch from "./ButtonSwitch";

export default function AdminDashboard({ onLogout }) {
    const [diasFechados, setDiasFechados] = useState([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [novoDia, setNovoDia] = useState("");
    const [novoHorario, setNovoHorario] = useState("");
    
    // NOVO: Estado para guardar a lista de clientes agendadas
    const [agendamentos, setAgendamentos] = useState([]);

    useEffect(() => {
        // Carrega configurações de dias e horários
        const configSalva = localStorage.getItem("configSalao");
        if (configSalva) {
            const config = JSON.parse(configSalva);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDiasFechados(config.diasFechados || []);
            setHorariosDisponiveis(config.horariosDisponiveis || []);
        } else {
            setHorariosDisponiveis(["08:00", "09:00", "10:00", "14:00", "15:00"]);
        }

        // NOVO: Carrega os agendamentos e organiza por data e hora
        const agendamentosSalvos = localStorage.getItem("agendamentos");
        if (agendamentosSalvos) {
            const lista = JSON.parse(agendamentosSalvos);
            const listaOrdenada = lista.sort((a, b) => {
                if (a.data === b.data) {
                    return a.horario.localeCompare(b.horario);
                }
                return a.data.localeCompare(b.data);
            });
            setAgendamentos(listaOrdenada);
        }
    }, []);

    const salvarConfiguracoes = () => {
        const config = { diasFechados, horariosDisponiveis };
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

    // NOVO: Função para apagar um agendamento (quando a cliente desmarcar ou o serviço for concluído)
    const removerAgendamento = (indexParaRemover) => {
        const confirmacao = window.confirm("Tem certeza que deseja remover este agendamento? Ele voltará a ficar disponível para outras clientes.");
        if (confirmacao) {
            const novaLista = agendamentos.filter((_, index) => index !== indexParaRemover);
            setAgendamentos(novaLista);
            localStorage.setItem("agendamentos", JSON.stringify(novaLista));
        }
    };

    return (
        <section className="min-h-screen bg-gray-50 p-5">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-tertiary">Painel de Controle</h1>
                    <p className="text-sm text-gray-500">Olá, Lídia! Gerencie sua agenda aqui.</p>
                </div>
                <Link to="/dashboard">
                    <ButtonSwitch>Dashboard</ButtonSwitch>
                </Link>
                <button onClick={onLogout} className="text-destaque font-medium underline hover:text-red-500 transition-colors">
                    Sair
                </button>
            </header>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* BLOCO 1: DIAS FECHADOS */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-lg text-tertiary mb-4">Dias Fechados (Folgas/Feriados)</h2>
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="date" value={novoDia} onChange={(e) => setNovoDia(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:border-destaque"
                        />
                        <button onClick={adicionarDia} className="bg-destaque text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300">
                            Adicionar
                        </button>
                    </div>
                    <ul className="flex flex-col gap-2">
                        {diasFechados.map(dia => (
                            <li key={dia} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                <span className="font-medium text-tertiary">{dia.split('-').reverse().join('/')}</span>
                                <button onClick={() => removerDia(dia)} className="text-red-500 font-bold px-3 hover:scale-110 transition-transform">X</button>
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
                            type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:border-destaque"
                        />
                        <button onClick={adicionarHorario} className="bg-tertiary text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform duration-300">
                            Adicionar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {horariosDisponiveis.map(hora => (
                            <div key={hora} className="bg-primary text-destaque border border-destaque/30 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="font-medium">{hora}</span>
                                <button onClick={() => removerHorario(hora)} className="font-bold hover:scale-125 transition-transform">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button onClick={salvarConfiguracoes} className="w-full bg-destaque text-white font-bold rounded-lg p-4 mb-8 hover:scale-105 transition-transform duration-300">
                Salvar Alterações de Dias e Horários
            </button>

            {/* BLOCO 3: LISTA DE AGENDAMENTOS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-xl text-tertiary mb-4">Próximos Agendamentos</h2>
                
                {agendamentos.length === 0 ? (
                    <div className="bg-gray-50 text-gray-500 p-6 rounded-lg text-center border border-gray-200">
                        Ainda não há clientes agendadas.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {agendamentos.map((agendamento, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 relative bg-primary">
                                <button 
                                    onClick={() => removerAgendamento(index)}
                                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold p-1"
                                    title="Remover Agendamento"
                                >
                                    ✕
                                </button>
                                <span className="text-xs font-bold text-white bg-destaque px-2 py-1 rounded-md self-start">
                                    {agendamento.data.split('-').reverse().join('/')} às {agendamento.horario}
                                </span>
                                <h3 className="font-bold text-tertiary mt-1 text-lg">{agendamento.nomeCliente}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <span className="font-medium">Serviço:</span> {agendamento.servico}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}