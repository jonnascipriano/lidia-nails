import { IoLogoWhatsapp, IoTimeOutline, IoCutOutline, IoColorWandOutline, IoWaterOutline, IoLayersOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlinePayment } from "react-icons/md";

const iconMap = {
    setaDireita: IoIosArrowForward,
    whatsapp: IoLogoWhatsapp,
    relogio: IoTimeOutline,
    pagamento: MdOutlinePayment,
    manicure: IoCutOutline,
    pedicure: IoCutOutline,
    manicurePedicure: IoCutOutline,
    esmaltacaoGel: IoWaterOutline,
    softGel: IoWaterOutline,
    manSoftGel: IoWaterOutline,
    fibraVidro: IoColorWandOutline,
    manFibraVidro: IoColorWandOutline,
    banhoGel: IoWaterOutline,
    manBanhoGel: IoWaterOutline,
    postica: IoLayersOutline
};

export default function Icones({ nome, className }) {
    const IconComponent = iconMap[nome];
    return IconComponent ? <IconComponent className={className} /> : null;
}