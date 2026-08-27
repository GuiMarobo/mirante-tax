# Mirante Tax - Especificação do Produto

**Versão** 1.0 · agosto de 2026
**Equipe** Ledger Labs
**Contexto** Solveathon SESCAP 2026 · Contexto 1 (A Carga que Não se Repassa) · Desafios D3 (principal) e D2 (motor de cálculo)

---

## 1. O que é

Mirante Tax é uma ferramenta de projeção de capital de giro para o período de transição da Reforma Tributária do Consumo. Ela mostra, mês a mês até 2033, quanto de caixa uma empresa vai precisar ter, considerando o efeito do split payment sobre o recebimento e a dependência do crédito tributário em relação ao comportamento fiscal do fornecedor.

O usuário operador é o escritório contábil, que roda a carteira inteira. O beneficiário final é a PME que hoje não recebe essa análise por falta de tempo do escritório, não por falta de conhecimento técnico.

### 1.1 O problema em uma frase

> Como poderíamos ajudar empresas do Simples Nacional a ajustar preço e projetar caixa durante a transição da Reforma sem depender de crédito caro para atravessar o aperto?

### 1.2 A tese

Hoje a empresa vende, recebe o valor integral e recolhe o tributo semanas depois. Nesse intervalo, o dinheiro do Fisco está na conta dela e financia a operação. É capital de giro que não aparece como dívida no balanço.

Com o split payment, o tributo é segregado no momento da liquidação financeira. A empresa não perde margem, porque o valor nunca foi dela. Mas perde uma linha de financiamento que usava sem saber que existia.

O efeito não é imediato nem uniforme. Vem em fases até 2033, e é absorvido pela sazonalidade nos primeiros meses. O aperto aparece meses depois da causa, quando as alavancas baratas já expiraram e só resta crédito emergencial.

### 1.3 O que diferencia

Simuladores de carga tributária respondem "quanto vou pagar". Mirante Tax responde "quando o dinheiro vai faltar, quanto, e o que ainda dá para fazer enquanto existe escolha".

Cada alavanca de correção carrega um prazo-limite de decisão. Essa coluna não existe em nenhuma ferramenta concorrente e é o que transforma diagnóstico em ação.

---

## 2. Evidências de campo

Estas informações fundamentam o produto e devem ser preservadas em qualquer material derivado.

### 2.1 Circuito de Sabatina, 08 de agosto de 2026

Três empresários responderam a uma pergunta aberta, sem indução, e nomearam quatro temas:

1. Precificação
2. Cash burn provocado pelo split payment
3. Previsão de caixa vinculada ao crédito do fornecedor
4. Redução de custo operacional para manter preço competitivo

Fontes: Samir Nasser (BRN Holding, varejo/agro/imobiliário), Alexandro Zava (Grupo Voalle, software para ISPs), Jonathas Oliveira (Tetra Auditoria e Consultoria).

Alerta explícito recebido: não tratar todas as empresas igual. Setor, porte e modelo de venda mudam o cálculo.

Achado central: o empresário mais estruturado da sala, com ERP TOTVS, API desenvolvida internamente e equipe contábil própria, descreveu que falta "uma ponte entre o sistema atual e a Reforma".

### 2.2 Validação técnica com profissional contábil

Confirmado:

- Empresa do Simples pode optar por recolher IBS e CBS pelo regime regular, fora do DAS
- A opção é semestral. Janela de 01 a 30 de setembro de 2026 para o primeiro semestre de 2027
- Optando pelo regime regular, a empresa entra nas regras de IBS e CBS, inclusive split payment quando aplicável
- No split, o tributo é segregado no momento da liquidação do pagamento, não no prazo normal de recolhimento
- Permanecer integralmente no Simples limita o crédito aproveitável pelo comprador. A proporção depende da atividade e da tributação, e não há percentual único

Avaliação da solução: plausível, sem software equivalente conhecido no mercado. Ressalva: a precisão plena depende de parâmetros ainda não publicados oficialmente.

### 2.3 Escritório contábil com setor dedicado

Reuniões sobre a Reforma ao longo de todo o ano e uma encarregada específica para o tema. Cada cliente que pergunta recebe um estudo tributário individual, feito manualmente.

Conclusão operacional: o conhecimento existe. O que não escala é aplicá-lo à carteira inteira.

### 2.4 Concorrência mapeada

| Categoria | Exemplos | O que fazem | Lacuna |
|---|---|---|---|
| Simuladores de alíquota | diversos, gratuitos | Comparam carga atual com IBS/CBS | Commoditizado. Não projeta caixa |
| Ferramentas de projeção | Taxcel, e-Auditoria, nomos | Projeção robusta com extração de SPED/EFD/ECD | Voltadas ao Lucro Real, operadas por contador, exigem arquivo fiscal completo |
| ERP de PME | Conta Azul, Omie | Emissão de nota com IBS/CBS, caixa atual | Registram o presente. Não projetam o futuro |

Espaço não ocupado: PME sem estrutura fiscal, com a projeção ligada à decisão de regime e ao risco de gerar crédito limitado ao cliente B2B.

---

## 3. Modelo de domínio

### 3.1 Entidades

**Escritorio**
Organização assinante. Contém usuários e carteira de empresas.

**Usuario**
Pertence a um escritório. Papéis: administrador, analista.

**Empresa**
Cliente do escritório. Guarda os parâmetros de entrada da projeção.

**Projecao**
Resultado calculado para uma empresa em um dado conjunto de premissas. Versionada, porque as premissas mudam.

**Alavanca**
Ação disponível para corrigir a curva. Tem impacto, prazo-limite e maturação.

**ParametroGlobal**
Premissas do modelo compartilhadas por todas as empresas. Versionadas por data de vigência.

### 3.2 Campos de Empresa

Entrada obrigatória:

| Campo | Tipo | Descrição |
|---|---|---|
| nome | string | |
| cnae | string | Código CNAE principal |
| regime | enum | simples_unificado, simples_regular, presumido, real |
| faturamentoMensal | decimal | Média mensal |
| comprasMensais | decimal | Média mensal de aquisições que geram crédito |
| custoOperacional | decimal | Folha, ocupação, frete, custos fixos |
| cargaAtual | decimal | Percentual de tributo sobre receita no regime atual |
| caixaAtual | decimal | Saldo disponível |
| prazoRecebimento | int | Dias médios |
| prazoPagamento | int | Dias médios |
| mixBoleto | int | Percentual da receita |
| mixPix | int | Percentual da receita |
| mixCartao | int | Percentual da receita |
| mixFaturado | int | Percentual da receita, sem intermediário financeiro |
| fornecedoresRisco | decimal | Percentual estimado de fornecedores que podem não recolher |
| reducaoAliquota | enum | cheia, red30, red60, zero, custom |
| aliquotaCustom | decimal | Usado quando reducaoAliquota = custom |
| perfilSazonal | enum | ver seção 4.4 |

Campos derivados, calculados e não persistidos:

| Campo | Fórmula |
|---|---|
| aliquotaEfetiva | aliquotaReferencia × fatorReducao, ou aliquotaCustom |
| mixExpostoSplit | mixBoleto + mixPix + mixCartao |
| geracaoCaixaMensal | faturamentoMensal - comprasMensais - custoOperacional - (faturamentoMensal × cargaAtual / 100) |
| pisoOperacional | custoOperacional (padrão: um mês de custo fixo) |
| descasamentoCiclo | prazoRecebimento - prazoPagamento |

### 3.3 Parâmetros globais

| Parâmetro | Padrão | Origem |
|---|---|---|
| aliquotaReferenciaCBS | 8,8% | Alíquota de referência, LC 214/2025 |
| prazoRecuperacaoCredito | 60 dias | Premissa. Requer validação profissional |
| mesEntradaSplit | julho de 2027 | Premissa. Ver seção 8.1 |
| intensidadeReajustePreco | 2,8% | Configurável |
| diasProrrogacaoFornecedor | 15 | Configurável |
| percentualCorteCusto | 3,5% | Configurável |
| descontoPontualidadePerdido | 1,2% | Custo de alongar prazo com fornecedor |
| maturacaoCorteCusto | 4 meses | Premissa. Requer validação |

Fatores de redução de alíquota: cheia = 1,0 · red30 = 0,7 · red60 = 0,4 · zero = 0,0

---

## 4. Motor de cálculo

O motor é determinístico e auditável. Nenhuma etapa usa inferência estatística ou modelo de linguagem. Toda saída deve poder ser reconstruída manualmente a partir das entradas.

### 4.1 Bloco A - Float tributário perdido

Impacto único, no mês de entrada do split.

```
debitoBruto     = faturamentoMensal × aliquotaEfetiva / 100
retidoNoSplit   = debitoBruto × mixExpostoSplit / 100
```

Interpretação: valor que circulava no caixa entre a venda e o recolhimento e que deixa de passar pela conta da empresa.

### 4.2 Bloco B - Capital preso no ciclo de crédito

Impacto único, no mês de entrada do split.

```
creditoMensal   = comprasMensais × aliquotaEfetiva / 100
capitalPreso    = creditoMensal × (prazoRecuperacaoCredito / 30)
```

Interpretação: o tributo é retido na venda, mas o crédito das compras só é recuperado na apuração seguinte. O descasamento imobiliza capital.

### 4.3 Bloco C - Crédito não realizado

Impacto recorrente, a partir do mês de entrada do split.

```
creditoPerdido  = creditoMensal × fornecedoresRisco / 100
```

Interpretação: o direito ao crédito depende de o fornecedor ter recolhido. Esta é a única variável do modelo fora do controle da empresa.

### 4.4 Consolidação e projeção

```
choqueUnico     = retidoNoSplit + capitalPreso
```

Perfis sazonais. Cada perfil é um vetor de 12 fatores normalizados para média 1,0:

| Perfil | Fatores (jan a dez) |
|---|---|
| varejo | -1.5, -0.9, 0.7, 0.9, 1.0, 0.9, 0.9, 1.0, 1.0, 1.2, 1.6, 5.2 |
| estavel | 0.7, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.3 |
| industria | -1.2, 0.4, 0.9, 1.0, 1.1, 1.0, 0.9, 1.1, 1.5, 1.7, 1.8, 1.8 |
| servicos | 0.3, 0.7, 1.1, 1.1, 1.1, 1.1, 1.0, 1.1, 1.1, 1.2, 1.2, 1.0 |
| construcao | -2.0, -1.0, 0.8, 1.2, 1.4, 1.3, 1.2, 1.4, 1.5, 1.6, 1.8, 2.8 |
| alimentacao | -0.8, 0.2, 0.9, 1.0, 1.1, 1.2, 1.4, 1.2, 1.1, 1.2, 1.3, 2.2 |
| eletronicos | -0.6, 0.2, 0.8, 0.9, 1.5, 1.0, 0.9, 1.0, 1.1, 1.1, 2.3, 1.8 |

Nota: os perfis sazonais são construídos por plausibilidade e não medidos. Devem ser calibrados com dados reais de carteira antes de uso em produção.

Algoritmo de projeção, 24 a 84 meses:

```
saldo[0] = caixaAtual

para cada mês i:
    fatorSazonal = perfil[i % 12] normalizado
    geracao      = geracaoCaixaMensal × fatorSazonal
    pontual      = 0

    se i == mesEntradaSplit:
        pontual -= choqueUnico

    se i >= mesEntradaSplit:
        geracao -= creditoPerdido

    aplicar alavancas ativas (ver 4.5)

    saldo[i] = saldo[i-1] + geracao + pontual
```

### 4.5 Alavancas

| Alavanca | Efeito | Momento | Prazo de decisão | Custo associado |
|---|---|---|---|---|
| Reajuste de preço | `+ faturamento × intensidade × (1 - aliquota/100)` | recorrente, imediato | janeiro do ano de vigência | elasticidade não modelada |
| Prorrogação de prazo com fornecedor | `+ compras × dias / 30` | único, no mês do split | dois meses antes do split | `- compras × descontoPontualidade / 100` recorrente |
| Corte de custo operacional | `+ custoOperacional × percentual / 100` | recorrente, após maturação | maturação antes do split | risco operacional não modelado |
| Escolha de regime | altera aliquotaEfetiva e exposição ao split | recorrente | janela semestral (setembro) | altera crédito gerado ao cliente |

O prazo de decisão é atributo de primeira classe. Toda alavanca deve exibir até quando vale decidir, e a interface deve destacar quando o prazo é anterior ao mês crítico.

### 4.6 Classificação de risco

```
mesesAbaixoPiso  = contagem de saldos < pisoOperacional
ficaNegativo     = existe saldo < 0
primeiroCritico  = índice do primeiro saldo < pisoOperacional
```

| Nível | Critério |
|---|---|
| Crítico | ficaNegativo, ou mesesAbaixoPiso >= 8 |
| Alto | mesesAbaixoPiso entre 4 e 7 |
| Médio | mesesAbaixoPiso entre 1 e 3 |
| Baixo | mesesAbaixoPiso = 0 |

### 4.7 Cenários

Toda projeção roda em três variações de alíquota e é apresentada como faixa:

| Cenário | Alíquota CBS | Origem |
|---|---|---|
| Conservador | 8,4% | LC 214/2025, art. 347, considerando desconto de 0,1 p.p. |
| Base | 8,8% | Alíquota de referência |
| Pessimista | 9,21% | Estimativa do Comitê Gestor do IBS |

Nenhuma tela deve apresentar valor único sem indicar a faixa. Esta é uma regra de produto, não uma preferência visual.

---

## 5. Telas

### 5.1 Carteira

Lista de empresas do escritório, ordenada por urgência.

Elementos por linha: nome, ramo, faturamento, nível de risco, barra de 24 a 84 segmentos representando os meses (segmento colorido = mês abaixo do piso), contagem de meses no risco, menor saldo, mês do primeiro cruzamento.

Cabeçalho: contadores agregados por nível de risco.

Ações: abrir empresa, criar empresa, importar carteira por CSV.

Objetivo funcional: responder "por onde eu começo" em menos de cinco segundos.

### 5.2 Empresa - projeção

Três blocos verticais.

**Memória de cálculo.** Tabela com débito bruto, retido na liquidação, crédito preso, choque único, crédito não realizado, geração de caixa e descasamento do ciclo. Cada linha exibe a fórmula aplicada com os valores substituídos.

**Curva.** Gráfico de linha, eixo temporal mensal. Elementos obrigatórios: faixa de cenários sombreada, linha do cenário base, linha tracejada do piso operacional, zona sombreada abaixo do piso, marcador vertical no mês de entrada do split, ponto destacado no primeiro cruzamento do piso.

Quando há alavancas ativas, a curva base vira linha tracejada de referência e a curva ajustada assume o traço sólido.

**Veredito.** Bloco textual com o mês crítico, o menor saldo e uma explicação em linguagem de negócio. Quando há alavancas ativas, comparar com o cenário sem ação.

### 5.3 Empresa - alavancas

Lista de alavancas com toggle. Cada uma exibe nome, valor do efeito recalculado para o porte da empresa, unidade (recorrente ou único), prazo de decisão e custo associado.

Ao ativar, a curva se atualiza sem recarregar a tela.

Regra de interface: quando o prazo de decisão de uma alavanca é anterior ao mês crítico, destacar visualmente. É o argumento central do produto.

### 5.4 Empresa - edição de parâmetros

Formulário agrupado em identificação, operação, mix de recebimento, tributação e ajustes finos.

Validação obrigatória: o mix de recebimento deve somar 100%. Exibir aviso quando não somar.

Campo de notas livre por empresa, para registro do que precisa ser confirmado com o cliente.

### 5.5 Parâmetros globais

Edição das premissas do modelo. Cada campo exibe origem e o que ainda carece de validação profissional.

Bloco fixo declarando as lacunas conhecidas: prazo de recuperação do crédito, percentual de fornecedores em risco, maturação do corte de custo, elasticidade de preço não modelada.

### 5.6 Relatório

Saída em PDF para o escritório entregar ao cliente. Contém: identificação da empresa, memória de cálculo, curva, alavancas com prazos, premissas declaradas e espaço para assinatura do responsável técnico.

Regra: o relatório é sempre revisado e assinado pelo escritório. O produto não emite parecer.

---

## 6. Design system

### 6.1 Conceito

Referência visual: carta topográfica e instrumento de medição de campo. Curvas de nível, cotas de elevação, marcações de distância. A metáfora do mirante é o ponto alto de onde se enxerga o terreno à frente.

Tom: instrumento profissional. O público avaliador é composto por contadores e consultores tributários.

### 6.2 Cores

| Token | Hex | Uso |
|---|---|---|
| fundo | 0E1A24 | Base |
| superficie | 16242F | Cards |
| superficieElevada | 1E3040 | Blocos destacados |
| linha | 2C4254 | Réguas, separadores, grid |
| textoPrimario | F0F4F7 | |
| textoSecundario | 8FA3B3 | Rótulos, apoio |
| acento | D4A24C | Numeração, cotas, um dado por tela |
| alerta | C4552F | Mês crítico, piso, risco |
| confirmacao | 4A9188 | Cenário coberto, faixa de projeção |

### 6.3 Tipografia

| Uso | Fonte | Peso | Observação |
|---|---|---|---|
| Display | Archivo | 700 | tracking -0.02em |
| Corpo | Inter | 400, 600 | |
| Números e rótulos | IBM Plex Mono | 500 | numerais tabulares obrigatórios |

Hierarquia por contraste de tamanho, nunca por cor.

### 6.4 Componentes

**Marcador de cota.** Linha de 1px na cor linha, com rótulo numérico em Mono à esquerda. Elemento assinatura do sistema. Usar para separar seções e marcar níveis em gráficos.

**Bloco de dado numérico.** Número grande em Mono acento, rótulo em Mono maiúsculo abaixo, descrição em Inter secundário. Sem caixa.

**Card.** Fundo na cor superfície, sem borda, sem faixa lateral colorida.

**Numeração.** Mono acento, formato 01, 02, 03, alinhada acima do título.

### 6.5 Proibições

Não usar linha de destaque abaixo de títulos. Não usar barra de cor no topo, rodapé ou lateral. Não usar faixa colorida em um dos lados de cards. Não usar fundo creme, bege ou branco. Não usar gradientes. Não usar ícones genéricos de escritório. Não usar travessão longo em texto, apenas hífen simples.

---

## 7. Arquitetura técnica

### 7.1 Stack recomendada

**Backend** NestJS com TypeScript. PostgreSQL. Prisma ou TypeORM.
**Frontend** Angular com TypeScript. Gráficos em SVG nativo ou D3.
**Infraestrutura** Container único para o MVP.

Justificativa: a stack acompanha a experiência da equipe, o que reduz risco de execução no prazo do Sprint Day.

### 7.2 Estrutura de módulos

```
src/
  motor/                  cálculo puro, sem dependência de framework
    aliquota.service.ts
    float.service.ts
    credito.service.ts
    projecao.service.ts
    alavanca.service.ts
    risco.service.ts
  empresas/
  escritorios/
  parametros/
  relatorios/
  auth/
```

Regra de arquitetura: o módulo `motor` não importa nada de infraestrutura. Recebe objetos simples e devolve objetos simples. Isso garante testabilidade e permite auditoria do cálculo isoladamente.

### 7.3 API

```
GET    /escritorios/:id/carteira          lista com risco calculado
POST   /empresas                           cria
GET    /empresas/:id                       detalhe com parâmetros
PATCH  /empresas/:id                       atualiza parâmetros
POST   /empresas/:id/projecao              calcula com alavancas opcionais
GET    /parametros                         premissas vigentes
PATCH  /parametros                         atualiza premissas
POST   /empresas/:id/relatorio             gera PDF
POST   /escritorios/:id/importar           CSV de carteira
```

Contrato de `POST /empresas/:id/projecao`:

```json
{
  "alavancas": { "preco": true, "fornecedor": false, "custo": true },
  "cenarios": ["conservador", "base", "pessimista"],
  "horizonteMeses": 24
}
```

Resposta:

```json
{
  "memoriaCalculo": {
    "debitoBruto": 17600,
    "retidoNoSplit": 14608,
    "creditoMensal": 11440,
    "capitalPreso": 22880,
    "choqueUnico": 37488,
    "creditoPerdido": 915,
    "formulas": { "debitoBruto": "200000 × 8.8 / 100" }
  },
  "cenarios": {
    "base": { "saldos": [], "mesesAbaixoPiso": 4, "primeiroCritico": 6, "menorSaldo": 31997 }
  },
  "risco": { "nivel": "Alto", "ordem": 3 },
  "premissas": [
    { "campo": "prazoRecuperacaoCredito", "valor": 60, "origem": "premissa", "validado": false }
  ]
}
```

Toda resposta de projeção deve incluir `memoriaCalculo` com as fórmulas aplicadas e `premissas` com o status de validação. Isso não é opcional: é o que sustenta a auditabilidade.

### 7.4 Testes obrigatórios

O módulo `motor` exige cobertura de testes unitários com casos conhecidos. Cada fórmula das seções 4.1 a 4.3 deve ter teste com valores fixos e resultado esperado calculado manualmente.

Teste de regressão: os oito perfis de referência (seção 9) devem produzir a mesma classificação de risco a cada build.

---

## 8. Premissas e lacunas

Esta seção deve ser mantida atualizada e refletida na interface. Declarar o que não se sabe é parte do produto.

### 8.1 Premissas sem fonte pública

| Premissa | Valor usado | Situação |
|---|---|---|
| Prazo de recuperação do crédito | 60 dias | Requer validação com escritório contábil |
| Percentual de fornecedores em risco | configurável, padrão 8% | Sem fonte pública. Deve ser informado pela empresa |
| Maturação do corte de custo | 4 meses | Requer calibragem com casos reais |
| Perfis sazonais | construídos por plausibilidade | Requer calibragem com dados de carteira |
| Mês de entrada do split | julho de 2027 | Em 2027 o split é opcional e restrito a operações entre empresas |

### 8.2 Não modelado

Elasticidade de preço. O modelo trata o reajuste como se o volume não reagisse, o que não corresponde à realidade. É a maior lacuna reconhecida.

Procedimento de split. A regulamentação prevê procedimento padrão, que verifica débitos e desconta parcelas já extintas, e procedimento simplificado, com percentual preestabelecido. O motor atual usa o débito bruto, o que pode superestimar a retenção no procedimento padrão.

### 8.3 Risco declarado

Alíquotas e regras de crédito seguem em consolidação. A validação profissional apontou que a precisão plena depende de parâmetros ainda não publicados.

Mitigação: motor parametrizado e versionado, saída em faixas, curadoria normativa como atividade contínua do negócio. A arquitetura fica pronta antes dos parâmetros, o que permite operar no dia em que forem publicados.

---

## 9. Perfis de referência

Oito perfis com ciclos financeiros distintos, usados para teste de regressão e demonstração. Valores fictícios, construídos para cobrir os extremos.

| Perfil | Faturamento | Compras | Custo op. | Caixa | Receb. | Pag. | Mix split | Forn. risco | Alíquota | Sazonal |
|---|---|---|---|---|---|---|---|---|---|---|
| Distribuidora de alimentos | 200.000 | 130.000 | 52.000 | 62.000 | 45 | 30 | 83% | 8% | cheia | varejo |
| Indústria de transformação | 480.000 | 290.000 | 148.000 | 178.000 | 60 | 45 | 91% | 6% | cheia | industria |
| Padaria | 180.000 | 74.000 | 82.000 | 55.000 | 2 | 28 | 93% | 10% | red60 | alimentacao |
| Consultoria | 140.000 | 11.000 | 98.000 | 58.000 | 30 | 15 | 76% | 4% | red30 | servicos |
| Construtora | 620.000 | 380.000 | 192.000 | 205.000 | 75 | 30 | 72% | 14% | cheia | construcao |
| Software por assinatura | 175.000 | 21.000 | 116.000 | 295.000 | 5 | 20 | 96% | 3% | cheia | estavel |
| Comércio eletrônico | 310.000 | 208.000 | 79.000 | 92.000 | 62 | 30 | 97% | 9% | cheia | ecommerce |
| Transporte de carga | 265.000 | 118.000 | 126.000 | 98.000 | 40 | 25 | 79% | 7% | cheia | estavel |

Achado esperado do conjunto: o risco não acompanha o faturamento. Acompanha o descasamento entre prazo de recebimento e prazo de pagamento, porque é ele que define quanto a empresa dependia do float tributário para fechar o mês.

Este achado deve ser reproduzível. Se uma mudança no motor quebrar essa relação, é regressão.

---

## 10. Escopo do MVP

Prazo de execução: Sprint Day em 27 de agosto de 2026, um dia.

### 10.1 Obrigatório

- Cadastro e edição de empresa com todos os campos da seção 3.2
- Motor completo, blocos A, B e C, com memória de cálculo exposta
- Projeção de 24 meses com três cenários
- Curva com piso operacional, mês crítico e faixa
- Três alavancas com prazo de decisão
- Tela de carteira com classificação de risco
- Tela de parâmetros globais editáveis
- Declaração de premissas visível na interface

### 10.2 Se houver tempo

- Importação de carteira por CSV
- Comparativo entre regime unificado e regular
- Geração de PDF
- Horizonte estendido até 2033

### 10.3 Fora de escopo

- Integração com ERP
- Extração de SPED
- Autenticação multiusuário
- Cobertura de todos os CNAEs e regimes

### 10.4 Demonstração

A sequência de demonstração deve caber em vinte segundos:

1. Abrir a carteira, mostrar as empresas ordenadas por risco
2. Abrir a empresa mais crítica
3. Mostrar a curva cruzando o piso, com o mês destacado
4. Ativar uma alavanca, a curva se desloca
5. Apontar que o prazo de decisão da alavanca vence antes do mês crítico

Essa última linha é o produto inteiro.