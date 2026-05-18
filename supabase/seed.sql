-- Seed das duas unidades, categorias, serviços e equipe.

insert into units (slug, name, shopping_name, address, floor, phone, whatsapp, lat, lng, image_url) values
  ('casa-i-teresina-shopping', 'Casa I', 'Teresina Shopping', 'Av. Marechal Castelo Branco, 911', 'Piso L3', '(86) 3122-5226', '5586981000001', -5.0815, -42.7748, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80'),
  ('casa-ii-rio-poty', 'Casa II', 'Shopping Rio Poty', 'Av. Raul Lopes, 1000 — Loja 267', 'Piso superior', '(86) 3230-1293', '5586981000002', -5.0858, -42.7857, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80')
on conflict (slug) do nothing;

insert into service_categories (slug, index, title, short_title, description, long_description) values
  ('cortes', 1, 'Cortes de assinatura', 'Cortes', 'Da tesouraterapia ao visagismo personalizado.', 'Cada um dos nossos cortes é antecedido por uma leitura visagística completa.'),
  ('tratamentos', 2, 'Tratamentos intensivos', 'Tratamentos', 'Rituais Kérastase, nanoqueratinização e restaurações profundas.', 'Protocolos estendidos de diagnóstico e cuidado clínico do fio.'),
  ('mudanca-de-forma', 3, 'Mudança de forma', 'Mudança de forma', 'Photon Hair, taninoplastia, selagem, botox capilar.', 'Tecnologia adequada para cada cabelo.'),
  ('coloracao', 4, 'Coloração', 'Coloração', 'Coloração total, retoque de raiz e tonalização.', 'Master Wella e Llongueras Barcelona conduzem cada coloração.'),
  ('clareamento', 5, 'Clareamento avançado', 'Clareamento', 'Mechas e luzes com aplicação por mapeamento.', 'Decoloração em duas etapas com neutralização.'),
  ('unhas', 6, 'Unhas & extensões', 'Unhas', 'Manicure, pedicure, acrigel, fibra de vidro.', 'Nail bar com esterilização hospitalar e técnicas atualizadas.'),
  ('estetica', 7, 'Estética facial', 'Estética', 'Limpeza de pele, design de sobrancelha, micropigmentação.', 'Cosméticos profissionais e visagismo facial.'),
  ('depilacao', 8, 'Depilação', 'Depilação', 'Cera quente premium.', 'Cera importada de baixa temperatura.'),
  ('especiais', 9, 'Especiais & noivas', 'Especiais', 'Maquiagem digital, penteados, megahair.', 'Atendimentos por hora marcada exclusiva.')
on conflict (slug) do nothing;

-- O seed completo de serviços e equipe é mantido em sincronia com src/lib/data/*.ts.
-- Para popular, rode a função supabase/functions/sync-seed em ambiente local.
