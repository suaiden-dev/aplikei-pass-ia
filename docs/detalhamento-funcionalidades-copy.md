# Aplikei Pass IA - Detalhamento de Funcionalidades, Produtos e Operacao

Este documento resume, em linguagem de negocio, o que a plataforma entrega hoje para apoiar a criacao de copy (site, anuncios, pages, emails e roteiros comerciais).

## 1) Visao geral do produto

A Aplikei Pass IA e uma plataforma de acompanhamento de processos migratorios com foco em:

- Vistos consulares (B1/B2 e F-1)
- Reaplicacoes apos negativa
- Mudancas internas de status nos EUA (COS e EOS)
- Servicos de mentoria e consultoria especializada

O modelo combina:

- Jornada guiada por etapas (onboarding)
- Revisao tecnica da equipe em pontos criticos
- Area do cliente com status em tempo real
- Chat entre cliente e equipe
- Fluxo comercial com checkout e pagamentos
- Operacao multi-office para escritorios/parceiros

## 2) Perfis de usuario e contexto de uso

### Cliente final

- Contrata o servico
- Preenche formularios
- Faz upload de documentos
- Acompanha o progresso do caso
- Conversa com especialista via chat
- Recebe orientacoes para avancar no processo

### Equipe interna (manager / admin_lawyer / master)

- Acompanha fila de casos e chats
- Realiza revisoes tecnicas por etapa
- Gerencia atendimentos, produtos, cupons, regras e configuracoes
- Opera contexto financeiro e de assinatura

### Seller (comercial)

- Atua na frente comercial e de receita
- Acompanha ganhos e dados operacionais relacionados a office

## 3) Produtos e servicos ofertados

Catalogo principal ativo:

1. `visto-b1-b2` - Turismo e Negocios (B1/B2)
2. `visto-b1-b2-reaplicacao` - Reaplicacao B1/B2
3. `visto-f1` - Visto de Estudante (F-1)
4. `visto-f1-reaplicacao` - Reaplicacao F-1
5. `troca-status` - COS (Change of Status)
6. `extensao-status` - EOS (Extension of Status)
7. `mentoria-individual` - Pacote Bronze (1 simulacao)
8. `mentoria-bronze` - Pacote Prata (2 simulacoes)
9. `mentoria-silver` - Pacote Prata F-1
10. `mentoria-gold` - Pacote Gold (3 simulacoes + suporte VIP)
11. `mentoria-negativa-consular` - Analise de recusa
12. `consultoria-f1-negativa` - Mentoria pos-negativa F-1
13. `consultoria-especialista` - Consultoria personalizada

Obs.: a plataforma tambem suporta aliases comerciais de slug para checkout/roteamento.

## 4) Como a jornada funciona (cliente)

### 4.1 Entrada e compra

- Landing de servicos e pagina detalhada por produto
- Checkout por slug de servico
- Fluxos com cupom/desconto e regras de office
- Suporte a diferentes metodos de pagamento

### 4.2 Onboarding guiado por etapas

Cada servico possui uma esteira de passos, incluindo:

- Formularios do cliente
- Uploads de documentos
- Etapas de analise/revisao da equipe
- Confirmacoes e checkpoints operacionais

Exemplos de marcos da jornada:

- DS-160, I-20, taxa MRV/SEVIS
- I-539 e pacote final (COS/EOS)
- Agendamento e preparo de entrevista consular

### 4.3 Acompanhamento de status

- Painel do cliente com casos ativos
- Progresso por etapa
- Estado do processo (em andamento, revisao, aprovado, negado etc.)

### 4.4 Chat com especialista

- Conversa por processo (thread por `process_id`)
- Suporte ativo/encerrado
- Upload de anexo no chat
- Roteamento com contexto de office para operacao interna

## 5) Funcionalidades operacionais (equipe)

### 5.1 Gestao de chats

- Lista de conversas por processo
- Filtro de visao por office (manager)
- Indicadores de nao lidas
- Abrir/encerrar conversa

### 5.2 Gestao de processos/casos

- Lista e detalhe do processo
- Acesso aos dados de etapa e documentos
- Acionamento de revisoes e passos administrativos

### 5.3 Comercial e produto

- Gestao de produtos/servicos
- Cupons e regras de desconto
- Configuracao de precos e parametros por office

### 5.4 Financeiro e faturamento

- Checkout e confirmacao de pagamento
- Painel de receita e transacoes
- Configuracoes de pagamento por office
- Saques/withdrawals
- Assinatura/plano da office

### 5.5 Estrutura de equipe e office

- Ambientes por office
- Cadastro e gestao de time (manager/seller/etc.)
- Regras de acesso por papel

## 6) Arquitetura funcional da plataforma (resumo para copy tecnica)

- Frontend web com area publica, autenticacao e area logada por perfil
- Camada de dados com Supabase (auth, banco, storage, realtime)
- Funcoes server-side para pagamentos/notificacoes/processamento operacional
- Persistencia de processo em `user_services`
- Mensageria de suporte em `chat_messages`

## 7) Diferenciais comerciais para usar em copy

1. Jornada ponta a ponta: da compra ao acompanhamento final do processo
2. Modelo hibrido: automacao + revisao humana especializada
3. Operacao orientada por etapas claras, com visibilidade de progresso
4. Plataforma multi-office para escala de atendimento
5. Produtos para momento inicial, reaplicacao e casos de mudanca interna
6. Canal de suporte contextual por caso (chat com especialista)

## 8) Mensagens-chave sugeridas

### Promessa principal

"Seu processo migratorio com clareza, estrategia e acompanhamento em cada etapa."

### Dores que a plataforma resolve

- Falta de direcao no que fazer primeiro
- Inseguranca com documentacao e formularios
- Dificuldade em reagir apos negativa
- Baixa visibilidade de status durante o processo

### Ganhos percebidos pelo cliente

- Saber exatamente o proximo passo
- Reduzir erros de preenchimento/documentacao
- Ter suporte especializado durante a jornada
- Organizar o processo em uma unica plataforma

## 9) Blocos prontos para uso em landing/campanha

### "Para quem e"

- Pessoas aplicando para B1/B2 ou F-1
- Quem teve negativa e precisa reaplicar com estrategia
- Quem quer trocar ou estender status sem sair dos EUA

### "O que voce recebe"

- Roteiro guiado de etapas
- Revisao tecnica da equipe
- Checklist e organizacao documental
- Suporte via chat por processo

### "Como funciona"

1. Escolha o servico ideal
2. Complete as etapas guiadas na plataforma
3. Receba revisoes e orientacoes da equipe
4. Acompanhe status e proximos passos ate a conclusao

## 10) Limites e cuidados de comunicacao

- Evitar promessa de "aprovacao garantida"
- Posicionar como suporte tecnico e operacional estruturado
- Destacar que resultados dependem de perfil, documentacao e decisao das autoridades

---

Se quiser, eu monto a versao 2 deste material ja em formato de:

1. Landing page (hero + secoes + CTA)
2. Roteiro de video curto (30-60s)
3. Sequencia de email/WhatsApp de conversao
