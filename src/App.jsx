import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import ClienteView from "./ClienteView";
import Agendamento from "./Agendamento";

function App() {
    // Cria um useState para verificar se a autenticação é verdadeira ou falsa
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
            <Routes>
                <Route
                    path="/"
                    element={
                        <main className="bg-primary min-h-screen w-full pb-10">
                            <Header />
                            <ClienteView />
                        </main>
                    }
                />

                <Route
                    path="/agendar"
                    element={
                        <main className="bg-primary min-h-screen w-full pb-10">
                            <Header />
                            <Agendamento />
                        </main>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        isAuthenticated ? (
                            <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
                        ) : (
                            <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
                        )
                    }
                />
            </Routes>
    );
}

export default App;
