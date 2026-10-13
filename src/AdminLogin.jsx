// Cria o useState
import { useState } from "react";

// A propriedade dentro da função manda o recado para o App de que a senha está correta.
export default function AdminLogin({onSuccess}){
    const [senha, setSenha] = useState("")

    // Verifica se a senha está correta.
    const handleLogin = (e) => {
        // Evita de recarregar toda a página.
        e.preventDefault();

        if(senha === '1234'){
            onSuccess();
        } else {
            alert("Senha incorreta")
        }
    }

    // Cria um "submit" para que ao clicar no botão, verifique se está correta a senha.
    return (
        <form onSubmit={handleLogin} className="flex flex-col bg-primary min-h-screen justify-center items-center">
            <input 
                type="password"
                value={senha}
                // Função para verificar se está correta somente ao clicar.
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha..."
                className="border-1 rounded-2xl p-2 bg-secondary shadow-2xl"
            />

            <button type="submit" className="bg-destaque py-3 px-7 mt-5 rounded-2xl font-medium text-primary cursor-pointer hover:scale-105 transition-transform duration-300">Validar</button>
        </form>
    )
}