const OPENROUTER_API_KEY = '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';

export const generateLegalDefense = async (incidentData: any, lang: string) => {
  const prompt = `Gere um requerimento formal de defesa de contraordenação rodoviária em ${lang === 'pt' ? 'Português' : 'Inglês'}. 
  Dados da infração:
  - Categoria: ${incidentData.category}
  - Gravidade: ${incidentData.severity}
  - Descrição: ${incidentData.description}
  - Contexto Adicional: ${incidentData.extraContext || 'Nenhum'}
  
  O texto deve ser jurídico, formal, estruturado com fundamentos legais. 
  Assine como: "Equipa Vigilantes da Estrada Norte".
  Não mencione IA nem OpenRouter.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "arcee/trinity",
      "messages": [
        { "role": "system", "content": "Você é um assistente jurídico especializado em trânsito." },
        { "role": "user", "content": prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Erro ao gerar defesa.";
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
          "content": `Você é o "Vigilante", um assistente de trânsito útil. Fale em ${lang}. Nunca diga que é uma IA.` 
        },
        { "role": "user", "content": question }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "O Vigilante não conseguiu responder agora.";
};