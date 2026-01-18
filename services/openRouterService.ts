
const OPENROUTER_API_KEY = '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';

export const generateLegalDefense = async (incidentData: any, lang: string) => {
  const prompt = `Gere um requerimento formal de defesa de contraordenação rodoviária em ${lang === 'pt' ? 'Português' : 'Inglês'}. 
  Dados da infração:
  - Categoria: ${incidentData.category}
  - Gravidade: ${incidentData.severity}
  - Descrição do incidente: ${incidentData.description}
  - Sumário: ${incidentData.aiSummary}
  
  O texto deve ser jurídico, formal, estruturado com factos e fundamentos legais. 
  Assine o documento como: "Equipa Vigilantes da Estrada Norte". 
  Não mencione que esta resposta foi gerada por inteligência artificial.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "arcee/trinity",
      "messages": [
        { "role": "system", "content": "Você é um assistente jurídico especializado em direito rodoviário e contraordenações de trânsito." },
        { "role": "user", "content": prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

export const askVigilanteAssistant = async (question: string, lang: string) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "openchat/openchat-7b",
      "messages": [
        { 
          "role": "system", 
          "content": `Você é o "Vigilante", um assistente virtual especializado em trânsito, multas e no funcionamento da aplicação Vigilante AI. 
          Comunique de forma clara, próxima e útil em ${lang === 'pt' ? 'Português' : 'Inglês'}. 
          Nunca diga que é uma inteligência artificial ou que usa OpenRouter.` 
        },
        { "role": "user", "content": question }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
