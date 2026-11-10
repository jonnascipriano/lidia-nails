import { Link } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";

export default function LoginLanding() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-primary p-5">
            <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-destaque">Lídia Nails</p>
                <h1 className="mt-3 text-3xl font-bold text-tertiary">Acesso administrativo</h1>
                <p className="mt-2 text-sm text-info">Acesse o painel para gerenciar sua agenda e acompanhar o salão.</p>
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
