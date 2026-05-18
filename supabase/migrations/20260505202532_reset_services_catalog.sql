begin;

alter table services drop column if exists description;

truncate table user_service_prices cascade;
truncate table services cascade;

insert into services (
  slug,
  name,
  category,
  default_price,
  default_currency,
  is_active
)
values
-- visas
(
'visa-b1b2',
'B1/B2 Visa Guide',
'main_visa',
200.00,
'USD',
true
),
(
'visa-f1',
'F-1 Visa Guide',
'main_visa',
350.00,
'USD',
true
),
(
'visa-cos',
'Change of Status Guide',
'main_visa',
500.00,
'USD',
true
),
(
'visa-eos',
'Extension of Status Guide',
'main_visa',
200.00,
'USD',
true
),
-- dependents
(
'dependent-b1b2',
'B1/B2 Dependent',
'dependent',
50.00,
'USD',
true
),
(
'dependent-f1',
'F-1 Dependent',
'dependent',
50.00,
'USD',
true
),
(
'dependent-cos',
'COS Dependent',
'dependent',
50.00,
'USD',
true
),
(
'dependent-eos',
'EOS Dependent',
'dependent',
50.00,
'USD',
true
),
-- analysis
(
'analysis-rfe-cos',
'COS RFE Analysis',
'analysis',
50.00,
'USD',
true
),
(
'analysis-rfe-eos',
'EOS RFE Analysis',
'analysis',
50.00,
'USD',
true
),
-- mentoring
(
'mentoring-bronze',
'Silver Mentoring',
'mentoring',
400.00,
'USD',
true
),
(
'mentoring-silver',
'Silver Mentoring',
'mentoring',
400.00,
'USD',
true
),
(
'mentoring-gold',
'Gold Mentoring',
'mentoring',
400.00,
'USD',
true
),
-- consultancy
(
'consultancy-motion-eos',
'EOS Motion Consultancy',
'consultancy',
500.00,
'USD',
true
),
(
'consultancy-motion-cos',
'COS Motion Consultancy',
'consultancy',
500.00,
'USD',
true
),
(
'consultancy-negative-b1b2',
'B1/B2 Visa Denial Consultancy',
'consultancy',
100.00,
'USD',
true
),
(
'consultancy-negative-f1',
'F-1 Visa Denial Consultancy',
'consultancy',
100.00,
'USD',
true
);

commit;
