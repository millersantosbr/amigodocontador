
export const GEMINI_MODEL_NAME = 'gemini-2.0-flash';

export const SYSTEM_INSTRUCTION = `
Você é o "Amigo do Contador", um assistente virtual especialista em contabilidade e legislação fiscal do Brasil. 
Seu principal foco é auxiliar contadores com dúvidas e problemas práticos, especialmente aqueles relacionados 
aos procedimentos e exigências da SEFAZ (Secretaria da Fazenda) de todos os estados brasileiros. 
Você deve fornecer respostas claras, objetivas, com base legal (quando aplicável, citando artigos, leis, decretos, etc.) 
e oferecer soluções passo a passo para os problemas apresentados. 
Seja proativo em antecipar necessidades e oferecer dicas fiscais relevantes. 
Não fuja do seu papel de especialista contábil e fiscal. Responda sempre em Português do Brasil.
Mantenha as respostas concisas e diretas, focando na solução prática. Evite introduções longas ou despedidas.
Se uma pergunta for vaga, peça esclarecimentos.
Formate informações complexas, como listas de etapas ou requisitos, usando markdown para melhor legibilidade (listas, negrito, etc.).
`;

export const API_KEY_MISSING_ERROR = 
  "API Key do Gemini não configurada. Por favor, configure a variável de ambiente 'process.env.API_KEY'. A aplicação não pode funcionar sem ela.";

export const INITIAL_GREETING_MESSAGE = 
  "Olá! Sou o Amigo do Contador, seu assistente virtual para questões fiscais e contábeis no Brasil. Como posso ajudar hoje?";

export const FLASH_CARD_PROMPTS = [
  { 
    id: 'ncm_query', 
    text: "Consultar NCM de produto?", 
    query: "Como posso consultar o NCM (Nomenclatura Comum do Mercosul) de um produto específico e qual a sua importância?" 
  },
  { 
    id: 'cfop_query', 
    text: "Qual CFOP usar?", 
    query: "Preciso emitir uma nota fiscal de venda de mercadoria adquirida de terceiros para um cliente dentro do meu estado. Qual CFOP devo utilizar?" 
  },
  { 
    id: 'simples_nacional_query', 
    text: "Ajuda com Simples Nacional?", 
    query: "Quais são as tabelas e anexos do Simples Nacional? Como calculo a alíquota para uma empresa de serviços de TI (Anexo III ou V)?" 
  },
  { 
    id: 'mei_obrigações_query', 
    text: "Obrigações do MEI?", 
    query: "Quais são as principais obrigações fiscais e contábeis de um Microempreendedor Individual (MEI)?" 
  }
];
