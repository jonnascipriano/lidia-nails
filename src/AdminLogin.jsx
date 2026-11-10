import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth, persistirSessao } from "./firebaseAuth";
import InstallAppButton from "./InstallAppButton";

const mensagensErro = {
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "Informe um e-mail válido.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "auth/network-request-failed": "Não foi possível conectar. Verifique sua internet e tente novamente.",
    "auth/user-disabled": "Esta conta está desativada. Fale com a administração.",
};

const descreverErro = (erro) =>
    mensagensErro[erro.code] || `Não foi possível concluir a operação: ${erro.message}`;

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setErro("");
        setMensagem("");
        setCarregando(true);
        try {
            await persistirSessao();
            await signInWithEmailAndPassword(auth, email.trim(), senha);
        } catch (erroLogin) {
            setErro(descreverErro(erroLogin));
        } finally {
            setCarregando(false);
        }
    };

    const recuperarSenha = async () => {
        if (!email.trim()) {
            setErro("Informe seu e-mail para receber o link de redefinição.");
            return;
        }

        setErro("");
        setMensagem("");
        setCarregando(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setMensagem("Se houver uma conta para este e-mail, você receberá o link de redefinição.");
        } catch (erroRecuperacao) {
            setErro(descreverErro(erroRecuperacao));
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-primary p-5">
            <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-destaque">Lídia Nails</p>
                <h1 className="mt-3 text-3xl font-bold text-tertiary">Acesso administrativo</h1>
                <p className="mt-2 text-sm text-info">Entre com o e-mail e a senha cadastrados pela administração.</p>

                <label className="mt-6 block text-sm font-medium text-gray-700">
                    E-mail
                    <input
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 outline-none transition focus:border-destaque focus:ring-4 focus:ring-destaque/10"
                        placeholder="seu@email.com"
                    />
                </label>

                <label className="mt-4 block text-sm font-medium text-gray-700">
                    Senha
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 outline-none transition focus:border-destaque focus:ring-4 focus:ring-destaque/10"
                        placeholder="Sua senha"
                    />
                </label>

                {erro && (
                    <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                        {erro}
                    </p>
                )}
                {mensagem && (
                    <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                        {mensagem}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={carregando}
                    className="mt-6 w-full rounded-xl bg-destaque px-6 py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
                >
                    {carregando ? "Aguarde..." : "Entrar"}
                </button>
                <button
                    type="button"
                    onClick={recuperarSenha}
                    disabled={carregando}
                    className="mt-4 w-full text-sm font-medium text-destaque hover:underline disabled:opacity-60"
                >
                    Esqueci minha senha
                </button>
                <div className="mt-5 flex justify-center">
                    <InstallAppButton />
                </div>
            </form>
        </main>
    );
}
