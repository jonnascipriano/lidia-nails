import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoginLanding from "./LoginLanding";

const AdminArea = lazy(() => import("./AdminArea"));

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginLanding />} />
            <Route path="/agendar" element={<LoginLanding />} />

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
