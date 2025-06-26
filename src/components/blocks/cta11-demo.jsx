import { Cta11 } from "../ui/cta11";
import { Wallet } from "lucide-react";

const demoData = {
  heading: "Bem-vindo ao Fanatique",
  description: "Junte-se a milhares de torcedores usando nossa plataforma para ter uma experiência única nos estádios.",
  buttons: {
    primary: {
      text: "Conectar Carteira",
      onClick: () => alert("Ação de conectar carteira"),
      icon: <Wallet size={18} />
    },
    secondary: {
      text: "Saiba Mais",
      onClick: () => alert("Ação de saber mais"),
    },
  },
};

function Cta11Demo() {
  return <Cta11 {...demoData} />;
}

export { Cta11Demo }; 