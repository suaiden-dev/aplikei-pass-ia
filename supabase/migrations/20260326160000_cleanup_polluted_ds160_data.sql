-- Limpeza de dados poluídos de outros projetos (COS/I-539) que não deveriam estar no banco de dados da DS-160.
-- Este script remove as respostas de formulário que pertencem a fluxos antigos ou de outros projetos.

DELETE FROM onboarding_responses 
WHERE step_slug IN ('personal', 'history', 'process')
   OR step_slug LIKE 'cos-%';
