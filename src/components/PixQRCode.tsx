import QRCode from "react-qr-code";

export default function PixQRCode() {
    // Seu código Pix exato
    const pixCode = "00020126940014BR.GOV.BCB.PIX01364e03dde7-f8c8-476c-bcd3-2b7fdd0c0ce60232Doação para um Dev independente.5204000053039865802BR5919Luan Clemente Costa6009SAO PAULO62140510mbFfj5cNHU6304AEF4";

    return (
        <div className="bg-white p-2 rounded shadow-lg inline-block">
            {/* O QRCode gera um SVG, que é leve e não perde qualidade */}
            <QRCode 
                value={pixCode} 
                size={128} 
                level="L" // Nível de correção de erro (L é suficiente e deixa o QR mais limpo)
            />
        </div>
    );
}