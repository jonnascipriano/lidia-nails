import { lazy, Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import { auth } from "./firebaseAuth";
import InstallAppButton from "./InstallAppButton";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ResumoDashboard = lazy(() => import("./ResumoDashboard"));
const GastosDashboard = lazy(() => import("./GastosDashboard"));

const abas = [
    { id: "agendar", rotulo: "Agendar", caminho: "/admin" },
    { id: "agenda", rotulo: "Agenda Admin", caminho: "/admin/agenda" },
    { id: "resumo", rotulo: "Resumo", caminho: "/admin/resumo" },
    { id: "gastos", rotulo: "Gastos", caminho: "/admin/gastos" },
];

const carregando = (
    <div className="flex min-h-screen items-center justify-center bg-primary text-tertiary">
        Carregando...
    </div>
);

export default function AdminArea() {
    const location = useLocation();
    const [usuario, setUsuario] = useState(null);
    const [carregandoAuth, setCarregandoAuth] = useState(true);
    const [estadoMigracao, setEstadoMigracao] = useState("idle");
    const [erroMigracao, setErroMigracao] = useState("");
    const [tentativaMigracao, setTentativaMigracao] = useState(0);

    useEffect(() => onAuthStateChanged(
        auth,
        (usuarioAtual) => {
            setUsuario(usuarioAtual);
            setCarregandoAuth(false);
        },
        (erro) => {
            setErroMigracao(`Não foi possível verificar a autenticação: ${erro.message}`);
            setCarregandoAuth(false);
            setEstadoMigracao("error");
        }
    ), []);

    useEffect(() => {
        if (!usuario) return undefined;

        let cancelado = false;
        Promise.resolve()
            .then(() => import("./agendamentosFirebase"))
            .then(({ migrarDadosLocais }) => migrarDadosLocais())
            .then(() => {
                if (!cancelado) {
                    setErroMigracao("");
                    setEstadoMigracao("ready");
                }
            })
            .catch((erro) => {
                if (!cancelado) {
                    setErroMigracao(erro.message);
                    setEstadoMigracao("error");
                }
            });

        return () => {
            cancelado = true;
        };
    }, [usuario, tentativaMigracao]);

    const sair = async () => {
        try {
            await signOut(auth);
        } catch (erro) {
            alert(`Não foi possível sair da conta: ${erro.message}`);
        }
    };

    if (carregandoAuth) return carregando;
    if (!usuario && estadoMigracao !== "error") return <AdminLogin />;

    if (estadoMigracao === "idle" || estadoMigracao === "loading") return carregando;

    if (estadoMigracao === "error") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-primary p-5">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow">
                    <h1 className="text-xl font-bold text-tertiary">Não foi possível carregar os dados</h1>
                    <p role="alert" className="mt-3 text-sm text-red-700">{erroMigracao}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setTentativaMigracao((tentativa) => tentativa + 1)}
                            className="rounded-xl bg-destaque px-4 py-2 font-semibold text-white"
                        >
                            Tentar novamente
                        </button>
                        {usuario && (
                            <button type="button" onClick={sair} className="rounded-xl border px-4 py-2 font-semibold text-tertiary">
                                Sair
                            </button>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    if (!usuario) return <AdminLogin />;

    const abaAtiva = location.pathname === "/dashboard"
        ? "resumo"
        : abas.find((aba) => aba.caminho === location.pathname)?.id || "agendar";

    return (
        <main className="min-h-screen bg-primary text-tertiary">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
                <header className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destaque">Lídia Nails</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Painel de gestão</h1>
                        <p className="mt-1 text-sm text-info">Olá, Lídia. Organize seu dia por aqui.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <InstallAppButton />
                        <button
                            type="button"
                            onClick={sair}
                            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-tertiary transition hover:border-destaque hover:text-destaque"
                        >
                            Sair
                        </button>
                    </div>
                </header>

                <nav
                    aria-label="Seções do painel"
                    className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm"
                >
                    {abas.map((aba) => (
                        <Link
                            key={aba.id}
                            to={aba.caminho}
                            aria-current={abaAtiva === aba.id ? "page" : undefined}
                            className={`min-w-max flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                abaAtiva === aba.id
                                    ? "bg-destaque text-white shadow-sm"
                                    : "text-info hover:bg-primary hover:text-tertiary"
                            }`}
                        >
                            {aba.rotulo}
                        </Link>
                    ))}
                </nav>

                <Suspense fallback={carregando}>
                    {abaAtiva === "agendar" || abaAtiva === "agenda" ? (
                        <AdminDashboard activeTab={abaAtiva} />
                    ) : abaAtiva === "resumo" ? (
                        <ResumoDashboard />
                    ) : (
                        <GastosDashboard />
                    )}
                </Suspense>
            </div>
        </main>
    );
}
