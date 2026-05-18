-- Seed default plans if they don't exist
INSERT INTO public.subscription_plans (name, description, type, fixed_fee, percentage_fee, min_monthly_fee)
VALUES 
('Plano Fixo', 'Taxa fixa mensal sem comissão por venda.', 'FIXED', 497.00, 0, NULL),
('Plano Percentual', 'Comissão sobre as vendas com valor mínimo mensal.', 'PERCENTAGE', 0, 10.00, 197.00),
('Plano Híbrido', 'Taxa fixa reduzida mais comissão por venda.', 'HYBRID', 197.00, 5.00, NULL)
ON CONFLICT DO NOTHING;
