import { Link } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";

export default function LoginLanding() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff8f5] via-white to-[#f8f1ff] p-5">
            <section className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-lg ring-1 ring-gray-100">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-destaque">Lídia Nails</p>
                <h1 className="mt-3 text-3xl font-bold text-tertiary">Acesso administrativo</h1>
                <p className="mt-2 text-sm text-gray-500">Acesse o painel para gerenciar a agenda.</p>
                <Link
                    to="/admin"
                    className="mt-6 block w-full rounded-xl bg-destaque px-6 py-3 font-semibold text-white transition hover:brightness-95"
                >
                    Ir para login
                </Link>
                <div className="mt-5 flex justify-center">
                    <InstallAppButton />
                </div>
            </section>
        </main>
    );
}
