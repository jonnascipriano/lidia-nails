import { Link } from "react-router-dom";

export default function Agendamento() {
    return (
        <section className="flex min-h-[70vh] items-center justify-center p-5">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl" aria-hidden="true">
                    💅
                </div>
                <h1 className="mt-5 text-2xl font-bold text-tertiary">Agendamento online pausado</h1>
                <p className="mt-3 text-gray-600">
                    Para marcar seu horário, fale diretamente com a Lídia pelo WhatsApp.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <a
                        href="https://wa.me/5588992137098"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-destaque px-5 py-3 font-semibold text-white transition hover:brightness-95"
                    >
                        Chamar no WhatsApp
                    </a>
                    <Link to="/" className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-tertiary transition hover:bg-gray-50">
                        Voltar aos serviços
                    </Link>
                </div>
            </div>
        </section>
    );
}
