import {Link} from "react-router-dom"
import Card from "./Card";
import Icones from "./Icones";
import servicos from "./servicos";

export default function ClienteView() {
    

    return (
        <section>

            <div className="p-5">
                <h1 className="font-bold text-4xl tracking-wide">Olá! {"\u{1F44B}"}</h1>
                <p className="text-tertiary tracking-wide">O que vamos fazer nas suas unhas?</p>
            </div>

            <ul>
                {servicos.map((servico, index) => (
                    <li key={index}>
                        <Link to="/agendar" state={{servicoSelecionado: servico}}>
                            <Card>
                                <div className="flex items-center gap-4 py-2">
                                    <div className="bg-primary p-4 rounded-2xl flex items-center justify-center">
                                        <Icones nome={servico.icone} className="w-6 h-6 text-destaque" />
                                    </div>

                                    <div>
                                        <h2 className="font-medium text-tertiary">{servico.nome}</h2>
                                        <p className="text-sm flex items-center gap-3">
                                            <span className="text-info flex items-center gap-1">
                                                <Icones nome="relogio" />
                                                {servico.tempoEstimado} min
                                            </span>
                                            <span className="text-destaque flex items-center gap-1 font-medium">
                                                <Icones nome="pagamento" />
                                                R$ {servico.valor}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <Icones nome="setaDireita" />
                            </Card>
                        </Link>
                            
                    </li>
                ))}
            </ul>
        </section>
    );
}
