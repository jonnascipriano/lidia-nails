import { 
            IoLogoWhatsapp, 
            IoTimeOutline, 
            IoCutOutline,
            IoColorWandOutline,
            IoWaterOutline,
            IoLayersOutline
        
        } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlinePayment } from "react-icons/md";

export default function Icones({ nome, className }) {
    const icones = {
        setaDireita: <IoIosArrowForward className={className}/>,
        whatsapp: <IoLogoWhatsapp className={className} />,
        relogio: <IoTimeOutline className={className}/>,
        pagamento: <MdOutlinePayment className={className}/>,
        manicure: <IoCutOutline className={className} />,
        pedicure: <IoCutOutline className={className} />,
        manicurePedicure: <IoCutOutline className={className} />,
        esmaltacaoGel: <IoWaterOutline className={className} />,
        softGel: <IoWaterOutline className={className} />,
        manSoftGel: <IoWaterOutline className={className} />,
        fibraVidro: <IoColorWandOutline className={className} />,
        manFibraVidro: <IoColorWandOutline className={className} />,
        banhoGel: <IoWaterOutline className={className} />,
        manBanhoGel: <IoWaterOutline className={className} />,
        postica: <IoLayersOutline className={className} />
    };

    return icones[nome] || null;
}