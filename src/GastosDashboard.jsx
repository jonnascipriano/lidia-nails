import { useEffect, useMemo, useState } from "react";
import { criarGasto, excluirGasto, observarGastos } from "./gastosFirebase";

const tiposDeGasto = [
    "Produtos",
    "Materiais de trabalho",
    "Aluguel",
    "Contas",
    "Outros",
];

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

export default function GastosDashboard() {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [tipo, setTipo] = useState(tiposDeGasto[0]);
    const [gastos, setGastos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => observarGastos(
        (lista) => {
            setGastos(lista);
            setCarregando(false);
            setErro("");
        },
        (erroAtual) => {
            setErro(`Não foi possível carregar os gastos: ${erroAtual.message}`);
            setCarregando(false);
        }
    ), []);

    const totalMes = useMemo(() => {
        const mesAtual = obterDataLocal().slice(0, 7);
        return gastos
            .filter((gasto) => gasto.data?.startsWith(mesAtual))
            .reduce((total, gasto) => total + (Number(gasto.valor) || 0), 0);
    }, [gastos]);

    const salvarGasto = async (event) => {
        event.preventDefault();
        if (salvando) return;
        const valorNumerico = Number(valor);
        if (!descricao.trim() || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            setErro("Informe uma descrição e um valor maior que zero.");
            return;
        }

        setSalvando(true);
        setErro("");
        setMensagem("");
        try {
            await criarGasto({
                descricao: descricao.trim(),
                valor: valorNumerico,
                tipo,
                data: obterDataLocal(),
            });
            setDescricao("");
            setValor("");
            setMensagem("Gasto registrado com sucesso.");
        } catch (erroSalvar) {
            setErro(`Não foi possível salvar o gasto: ${erroSalvar.message}`);
        } finally {
            setSalvando(false);
        }
    };

    const removerGasto = async (gasto) => {
        if (!window.confirm(`Excluir o gasto "${gasto.descricao}"?`)) return;
        setErro("");
        try {
            await excluirGasto(gasto.id);
        } catch (erroExcluir) {
            setErro(`Não foi possível excluir o gasto: ${erroExcluir.message}`);
        }
    };

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Gastos</h2>
                <p className="mt-1 text-sm text-info">Registre as despesas do salão e acompanhe seus custos.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                <form onSubmit={salvarGasto} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-base font-semibold">Adicionar gasto</h3>
                    <p className="mt-1 text-sm text-info">Preencha os dados da despesa para salvar no seu controle.</p>

                    <label className="mt-5 block text-sm font-medium">
                        Descrição
                        <input
                            type="text"
                            value={descricao}
                            onChange={(event) => setDescricao(event.target.value)}
                            placeholder="Ex.: esmaltes e lixas"
                            maxLength={120}
                            required
                            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 outline-none transition focus:border-destaque focus:ring-4 focus:ring-destaque/10"
                        />
                    </label>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium">
                            Valor
                            <div className="mt-1.5 flex overflow-hidden rounded-xl border border-stone-300 focus-within:border-destaque focus-within:ring-4 focus-within:ring-destaque/10">
                                <span className="flex items-center border-r border-stone-200 bg-primary px-3 text-sm text-info">R$</span>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={valor}
                                    onChange={(event) => setValor(event.target.value)}
                                    placeholder="0,00"
                                    required
                                    className="min-w-0 flex-1 px-3 py-3 outline-none"
                                />
                            </div>
                        </label>

                        <label className="block text-sm font-medium">
                            Tipo de gasto
                            <select
                                value={tipo}
                                onChange={(event) => setTipo(event.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 outline-none transition focus:border-destaque focus:ring-4 focus:ring-destaque/10"
                            >
                                {tiposDeGasto.map((opcao) => <option key={opcao}>{opcao}</option>)}
                            </select>
                        </label>
                    </div>

                    {erro && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{erro}</p>}
                    {mensagem && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{mensagem}</p>}

                    <button
                        type="submit"
                        disabled={salvando}
                        className="mt-5 w-full rounded-xl bg-destaque px-5 py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                        {salvando ? "Salvando..." : "Salvar gasto"}
                    </button>
                </form>

                <aside className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-rose-50/70 p-5 sm:p-6">
                    <div>
                        <p className="text-sm font-medium text-rose-800">Total de gastos neste mês</p>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-rose-900">{formatarMoeda(totalMes)}</p>
                    </div>
                    <p className="mt-6 text-sm leading-6 text-rose-800/80">
                        O total considera os gastos registrados neste mês. As despesas também aparecem no saldo da aba Resumo.
                    </p>
                </aside>
            </div>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h3 className="text-base font-semibold">Gastos registrados</h3>
                        <p className="mt-1 text-sm text-info">Histórico de despesas cadastradas.</p>
                    </div>
                    <span className="text-sm text-info">{gastos.length} {gastos.length === 1 ? "registro" : "registros"}</span>
                </div>

                {erro && !mensagem && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{erro}</p>}
                {carregando ? (
                    <p className="mt-5 rounded-xl bg-primary p-5 text-center text-sm text-info">Carregando gastos...</p>
                ) : gastos.length === 0 ? (
                    <p className="mt-5 rounded-xl border border-dashed border-stone-300 bg-primary p-6 text-center text-sm text-info">
                        Nenhum gasto registrado ainda.
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-stone-100">
                        {gastos.map((gasto) => (
                            <li key={gasto.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{gasto.descricao}</p>
                                    <p className="mt-1 text-sm text-info">
                                        {gasto.tipo} <span aria-hidden="true">·</span> {gasto.data?.split("-").reverse().join("/") || "Data não informada"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                    <span className="font-semibold text-rose-700">{formatarMoeda(Number(gasto.valor) || 0)}</span>
                                    <button
                                        type="button"
                                        onClick={() => removerGasto(gasto)}
                                        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-info transition hover:bg-rose-50 hover:text-rose-700"
                                        aria-label={`Excluir gasto: ${gasto.descricao}`}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}
