import axios from "axios";

// Interfaces para tipagem
interface Product {
  name: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Payment {
  method: string;
  value: number;
}

interface NFCe {
  company: {
    name: string;
    cnpj: string;
    address: string;
  };
  products: Product[];
  total: {
    itemsCount: number;
    totalValue: number;
  };
  payment: Payment[];
  info: {
    number: string;
    series: string;
    emissionDate: string;
    protocol: string;
    accessKey: string;
  };
  customer: {
    cpf: string;
    name: string;
  };
}

export const parseNFCe = async (url: string): Promise<NFCe> => {
  try {
    // Fazer a requisição HTTP
    const response = await axios.get(url);
    const htmlContent = response.data;

    // Criar um DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    console.log(doc);

    // Função auxiliar para limpar texto
    const cleanText = (text: string) => text.trim().replace(/\s+/g, " ");
    console.log(cleanText);
    // Extrair informações da empresa
    const company = {
      name: cleanText(doc.querySelector("#u20")?.textContent || ""),
      cnpj: cleanText(
        doc.querySelector(".text")?.textContent?.replace("CNPJ:", "") || ""
      ),
      address: cleanText(doc.querySelectorAll(".text")[1]?.textContent || ""),
    };

    console.log(company);
    // Extrair produtos
    const products: Product[] = [];
    const itemRows = doc.querySelectorAll("#tabResult tr");
    console.log(itemRows);
    itemRows.forEach((row) => {
      const name = cleanText(row.querySelector(".txtTit2")?.textContent || "");
      const code = cleanText(
        row.querySelector(".RCod")?.textContent?.replace(/[()]/g, "") || ""
      ).replace("Código:", "");
      const quantityText = cleanText(
        row.querySelector(".Rqtd")?.textContent?.replace("Qtde.:", "") || ""
      );
      const quantity = parseFloat(quantityText);
      const unit = cleanText(
        row.querySelector(".RUN")?.textContent?.replace("UN:", "") || ""
      );
      const unitPriceText = cleanText(
        row.querySelector(".RvlUnit")?.textContent?.replace("Vl. Unit.:", "") ||
          ""
      );
      const unitPrice = parseFloat(unitPriceText);
      const totalPriceText = cleanText(
        row.querySelector(".valor")?.textContent || ""
      );
      const totalPrice = parseFloat(totalPriceText);

      if (name) {
        products.push({
          name,
          code,
          quantity,
          unit,
          unitPrice,
          totalPrice,
        });
      }
    });

    // Extrair total
    const total = {
      itemsCount: parseInt(
        cleanText(
          doc.querySelector("#totalNota .totalNumb")?.textContent || "0"
        )
      ),
      totalValue: parseFloat(
        cleanText(doc.querySelector("#totalNota .txtMax")?.textContent || "0")
      ),
    };

    // Extrair pagamentos
    const payments: Payment[] = [];
    const paymentMethod = cleanText(
      doc.querySelector("#linhaTotal .tx")?.textContent || ""
    );
    const paymentValue = parseFloat(
      cleanText(
        doc.querySelector("#linhaTotal .totalNumb:last-child")?.textContent ||
          "0"
      )
    );

    if (paymentMethod) {
      payments.push({
        method: paymentMethod,
        value: paymentValue,
      });
    }

    // Extrair informações gerais
    const info = {
      number: cleanText(
        doc
          .querySelector("li strong:nth-child(2)")
          ?.textContent?.replace("Número:", "") || ""
      ),
      series: cleanText(
        doc
          .querySelector("li strong:nth-child(4)")
          ?.textContent?.replace("Série:", "") || ""
      ),
      emissionDate: cleanText(
        doc
          .querySelector("li strong:nth-child(6)")
          ?.textContent?.replace("Emissão:", "") || ""
      ),
      protocol: cleanText(
        doc
          .querySelector("li strong:nth-child(8)")
          ?.textContent?.replace("Protocolo de Autorização:", "") || ""
      ),
      accessKey: cleanText(doc.querySelector(".chave")?.textContent || ""),
    };

    // Extrair informações do consumidor
    const customer = {
      cpf: cleanText(
        doc.querySelector("li strong")?.nextSibling?.textContent || ""
      ),
      name: cleanText(
        doc.querySelectorAll("li strong")[1]?.nextSibling?.textContent || ""
      ),
    };

    return {
      company,
      products,
      total,
      payment: payments,
      info,
      customer,
    };
  } catch (error) {
    console.error("Erro ao fazer parse da NFC-e:", error);
    throw error;
  }
};

// Exemplo de uso
export const fetchNFCeData = async (qrCodeContent: string) => {
  try {
    const nfceData = await parseNFCe(qrCodeContent);
    console.log("Dados da NFC-e:", nfceData);
    return nfceData;
  } catch (error) {
    console.error("Erro ao buscar dados da NFC-e:", error);
    throw error;
  }
};
