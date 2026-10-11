import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import ClientView from "./ClienteView";

// Variável necessária para ter acesso ao link, em mais específico com final "/admin"
const caminho = window.location.pathname;

function App(){

  // Cria um useState para verificar se a autenticação é verdadeira ou falsa
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Verifica se o final do link contém "/admin", se for, a proprietaria vai digitar a senha, se estiver correta, vai cair no Dashboard do site.
  if (caminho.endsWith('/admin') && isAuthenticated === false){
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)}/>
  } else if (caminho.endsWith('/admin') && isAuthenticated === true){
    return <AdminDashboard onLogout={() => setIsAuthenticated(false)}/>
  }

  // Se nao tiver '/admin' no final do link, significa que é a cliente, e não a proprietaria. Fazendo assim a cliente entrando no site para fazer o agendamento da unha.
  return(
    <>
      <ClientView/>
    </>
  )
}

export default App;