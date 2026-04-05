export const VERDE = "#00b96b";
export const VERDE_ESCURO = "#009a5a";

export const utilizador = {
  nome: "Ana Machava",
  email: "ana.machava@email.com",
  telefone: "+258 84 456 5456",
  provincia: "Maputo",
  cidade: "Maputo",
  bairro: "Sommershield",
  avatar: "AM",
  membro: "Janeiro 2024",
};

export const resumoCarteira = {
  saldoTotal: 12450,
  saldoDisponivel: 9800,
  saldoPendente: 2650,
  ganhoVendas: 8200,
  ganhoAfiliados: 1600,
  totalDepositado: 5000,
  totalLevantado: 2350,
};

export const transacoes = [
  { id: 1, tipo: "venda",        descricao: "Venda — Relógio Premium",      valor: +4200, data: "02/04/2026" },
  { id: 2, tipo: "afiliado",     descricao: "Comissão Afiliado — Tênis",    valor: +320,  data: "01/04/2026" },
  { id: 3, tipo: "levantamento", descricao: "Levantamento M-Pesa",          valor: -2350, data: "30/03/2026" },
  { id: 4, tipo: "compra",       descricao: "Compra — Perfume Chanel Nº5",  valor: -1850, data: "29/03/2026" },
  { id: 5, tipo: "deposito",     descricao: "Depósito E-Mola",              valor: +5000, data: "25/03/2026" },
];

export const minhasCompras = [
  { id: 1, nome: "Relógio Premium Swiss Made", preco: 4200, estado: "Entregue",    vendedor: "João M."    },
  { id: 2, nome: "Perfume Importado Chanel",   preco: 1850, estado: "Em trânsito", vendedor: "Loja Aroma" },
  { id: 3, nome: "Tênis Nike Air Max 2024",    preco: 3200, estado: "Confirmado",  vendedor: "SportsMoz"  },
];

export const minhasVendas = [
  { id: 1, nome: "Capulana Bordada Artesanal", preco: 450,  vendas: 12, estado: "Activo",  afiliados: true  },
  { id: 2, nome: "Cesto Artesanal de Sisal",   preco: 650,  vendas: 8,  estado: "Activo",  afiliados: false },
  { id: 3, nome: "Conjunto de Cabelo",         preco: 4200, vendas: 3,  estado: "Pausado", afiliados: true  },
];

export const linksAfiliados = [
  { id: 1, produto: "Tênis Nike Air Max",    comissao: 15, cliques: 142, conversoes: 8, ganho: 3840 },
  { id: 2, produto: "Relógio Premium Swiss", comissao: 10, cliques: 89,  conversoes: 3, ganho: 1260 },
];