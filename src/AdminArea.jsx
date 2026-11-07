import { lazy, Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useLocation } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import { auth } from "./firebaseAuth";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ResumoDashboard = lazy(() => import("./ResumoDashboard"));
const Header = lazy(() => import("./Header"));

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

    return (
        <Suspense fallback={carregando}>
            {location.pathname === "/admin" ? (
                <AdminDashboard onLogout={sair} />
            ) : (
                <main>
                    <Header />
                    <ResumoDashboard />
                </main>
            )}
        </Suspense>
    );
}
