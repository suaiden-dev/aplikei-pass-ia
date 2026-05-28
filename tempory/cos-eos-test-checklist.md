# COS + EOS Test Checklist

## Setup
- [x] Ambiente local sobe sem erros (`npm run dev`)
- [x] Usuário de teste com role `customer` consegue acessar onboarding
- [x] Usuário de teste com role `manager` consegue acessar cases e detalhes
- [x] Dados mínimos de processo criados para `troca-status` (COS)
- [x] Dados mínimos de processo criados para `extensao-status` (EOS)

## COS - Fluxo Principal
- [x] Step `cos_application_form` salva rascunho corretamente
- [x] Step `cos_application_form` conclui e avança etapa
- [x] Step `cos_documents` aceita uploads obrigatórios
- [x] Step `cos_documents` persiste arquivos em `step_data.docs`
- [x] Step `cos_i20_upload` aparece para alvo F-1
- [x] Step `cos_i20_upload` não bloqueia fluxo quando não aplicável
- [x] Step `cos_sevis_fee` aparece para alvo F-1
- [x] Step `cos_presentation_letter` salva respostas
- [x] Step `cos_official_forms` gera I-539 PDF (`i539PdfUrl`)
- [x] Step `cos_final_forms` gera G-1145/G-1450 (`g1145PdfUrl`/`g1450PdfUrl`)
- [x] Step `cos_final_package` gera pacote final (`finalPackagePdfUrl`)

## EOS - Fluxo Principal
- [ ] Step inicial mostra **Formulário Inicial** (não I-539)
- [ ] Step `eos_documents` aceita uploads e salva em `docs`
- [ ] Step `eos_i20_upload` respeita regra de aplicabilidade
- [ ] Step `eos_sevis_fee` respeita regra de aplicabilidade
- [ ] Step `eos_cover_letter` salva respostas e gera HTML
- [ ] Step `eos_official_forms` exibe título **Formulário I-539**
- [ ] Step `eos_official_forms` gera I-539 PDF válido
- [ ] Step `eos_final_review` gera formulários finais
- [ ] Step `eos_final_package` gera pacote final

## Validações de Formulário (I-539)
- [ ] `Unit Number` aceita tamanho válido sem erro
- [ ] `SSN` aceita formato `XXX-XX-XXXX`
- [ ] `I-94 Number` exige exatamente 11 dígitos
- [ ] `I-94 Number` não vem pré-preenchido com data
- [ ] Dependentes não herdando `i94Date` para `i94Number`
- [ ] Erros de validação aparecem em campo inválido
- [ ] Submissão bloqueada quando campos obrigatórios faltam

## Homologação (Autofill)
- [ ] Botão `Preencher Homologação` aparece no I-539
- [ ] Botão preenche `SSN` com formato válido
- [ ] Botão preenche `I-94` com 11 dígitos
- [ ] Botão respeita campos já preenchidos
- [ ] Botão aparece no RFE instruction
- [ ] Botão aparece no Motion instruction
- [ ] Botão aparece na etapa de Revisão Final (G-1145/G-1450)
- [ ] Preenchimento de homologação não quebra máscaras/campos de data

## Cases (Manager/Admin)
- [ ] Ordem das steps em `cases` está consistente com `product_step.order`
- [ ] Mesma ordem em listagem e detalhe do case
- [ ] Sem botões duplicados de ação global no detalhe
- [ ] Apenas ações do card da etapa aparecem
- [ ] Botões de marcação de item exibem texto **Select**
- [ ] Botões de `Select` marcam/desmarcam item para correção
- [ ] Modal de correção abre com itens selecionados

## Aprovação/Rejeição
- [ ] Aprovar step admin_action avança `current_step`
- [ ] Solicitar correção salva `admin_feedback` e `rejected_items`
- [ ] Rejeição final encerra processo com status esperado
- [ ] Aprovação final encerra processo como aprovado
- [ ] Notificações para cliente/admin disparam nos eventos principais

## Recovery - RFE
- [ ] Trigger de RFE abre fluxo correto
- [ ] Step de instrução RFE salva dados
- [ ] Proposta RFE é enviada e exibida para aceite
- [ ] Pagamento RFE move para etapa seguinte correta
- [ ] Resultado RFE (`approved`/`rfe`/`denied`) atualiza fluxo
- [ ] Novo ciclo RFE mantém histórico sem quebrar steps

## Recovery - Motion
- [ ] Trigger de Motion abre fluxo correto
- [ ] Step de instrução Motion salva dados
- [ ] Proposta Motion é enviada e exibida para aceite
- [ ] Pagamento Motion move para etapa seguinte correta
- [ ] Resultado Motion (`approved`/`denied`) atualiza fluxo
- [ ] Histórico de Motion aparece corretamente no detalhe

## Dependentes
- [ ] Adicionar dependente funciona
- [ ] Remover dependente funciona
- [ ] Dados de dependente persistem entre recarregamentos
- [ ] I-539A é gerado quando há dependentes
- [ ] I-94 de dependente não preenche com data

## Documentos e Storage
- [ ] Upload de documento gera path válido no bucket esperado
- [ ] Download/preview de documentos funciona no admin
- [ ] Links públicos de PDF gerados funcionam
- [ ] Pacote final inclui I-539, I-539A (se houver), I-94, cover letter

## Regressão Rápida
- [ ] Sem erro de runtime no console durante todo o fluxo COS
- [ ] Sem erro de runtime no console durante todo o fluxo EOS
- [ ] Navegação voltar/avançar entre steps sem perda indevida de dados
- [ ] Refresh da página mantém estado persistido do step
- [ ] Fluxo em português e inglês exibe labels corretos

## Evidências
- [ ] Capturas de tela dos pontos críticos anexadas
- [ ] IDs de processos testados documentados
- [ ] Resultado final de cada cenário (PASS/FAIL) registrado
