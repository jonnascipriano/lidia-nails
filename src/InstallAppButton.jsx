import { useEffect, useState } from "react";

function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export default function InstallAppButton() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [installed, setInstalled] = useState(
        () => window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone),
    );

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };
        const handleAppInstalled = () => setInstalled(true);

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) {
            const instructions = isIOS()
                ? 'No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".'
                : 'Abra o menu do navegador e escolha "Instalar app" ou "Adicionar à tela inicial".';
            window.alert(instructions);
            return;
        }

        await installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
    };

    if (installed) return null;

    return (
        <button
            type="button"
            onClick={handleInstall}
            className="rounded-full bg-destaque px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
            Instalar app
        </button>
    );
}
