import { useLocation } from "react-router-dom";
import ButtonSwitch from "./ButtonSwitch";
import imgUnha from "./assets/img/unha.png";

export default function Header(){
    const {pathname} = useLocation()

    return(
        <header className="flex justify-between px-5 py-4 items-center bg-secondary">
            <div className="flex items-center gap-2">
                {/* <img src=""/> */}
                <p>{'<logo>'}</p>
                <span className="text-hd-logo font-bold text-2xl">Lídia Oliveira</span>
            </div>

                {
                    pathname === "/" && (
                        <img src={imgUnha} alt="img de unha"/>
                    )
                }

                {
                    pathname === "/dashboard" && (
                        <ButtonSwitch>Ver como cliente</ButtonSwitch>
                    )
                }
        </header>
    )
}