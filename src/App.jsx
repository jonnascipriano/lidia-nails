import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import ClienteView from "./ClienteView";

const AdminArea = lazy(() => import("./AdminArea"));
const Agendamento = lazy(() => import("./Agendamento"));

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <main className="min-h-screen w-full bg-primary pb-10">
                        <Header />
                        <ClienteView />
                    </main>
                }
            />

            <Route
                path="/agendar"
                element={
                    <Suspense fallback={<div className="p-8 text-center text-tertiary">Carregando...</div>}>
                        <main className="min-h-screen w-full bg-primary pb-10">
                            <Header />
                            <Agendamento />
                        </main>
                    </Suspense>
                }
            />

            <Route
                path="/admin"
                element={
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-tertiary">Carregando...</div>}>
                        <AdminArea />
                    </Suspense>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-tertiary">Carregando...</div>}>
                        <AdminArea />
                    </Suspense>
                }
            />
        </Routes>
    );
}

export default App;
