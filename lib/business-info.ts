export const businessInfo = {
  name: "Comercio SAYMON",
  shortName: "SAYMON",
  receiptTitle: "Comprobante interno",
  nonFiscalNotice: "No valido como factura",
  footerNotice: "Registro interno sin validez fiscal",
  address: "",
  phone: "",
  taxId: "",
} as const;

export function getBusinessReceiptLines() {
  return [
    businessInfo.address,
    businessInfo.phone ? `Tel: ${businessInfo.phone}` : "",
    businessInfo.taxId ? `CUIT: ${businessInfo.taxId}` : "",
  ].filter(Boolean);
}
