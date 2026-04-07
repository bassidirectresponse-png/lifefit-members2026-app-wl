-- =============================================
-- Seed: 4 semanas + 5 aulas cada
-- Execute DEPOIS do schema.sql
-- =============================================

-- Semana 1
insert into public.modulos (id, numero_semana, titulo, subtitulo, descricao, cor_destaque, ordem)
values (
  'a1000000-0000-0000-0000-000000000001',
  1,
  'Despertar do Corpo',
  'O ritual de reconexão com seu corpo e suas vontades reais',
  'Nesta primeira semana, vamos desacelerar. Antes de mudar o que você come ou como se move, precisamos ouvir o que seu corpo realmente pede. Exercícios de escuta corporal, journaling matinal e um protocolo de hidratação consciente que vai transformar suas manhãs.',
  '#EC4899',
  1
);

-- Semana 2
insert into public.modulos (id, numero_semana, titulo, subtitulo, descricao, cor_destaque, ordem)
values (
  'a1000000-0000-0000-0000-000000000002',
  2,
  'Alimentação Intuitiva',
  'Comer com presença e prazer — sem contar calorias, sem culpa',
  'Esqueça dietas restritivas. Nesta semana, você vai aprender a montar pratos que nutrem e satisfazem, usando o método do prato intuitivo. Receitas simples, lista de compras prática e um desafio de mindful eating que muda sua relação com a comida.',
  '#F472B6',
  2
);

-- Semana 3
insert into public.modulos (id, numero_semana, titulo, subtitulo, descricao, cor_destaque, ordem)
values (
  'a1000000-0000-0000-0000-000000000003',
  3,
  'Movimento com Alma',
  'Encontre o exercício que você vai amar — e manter',
  'Nada de treinos punitivos. Vamos descobrir juntas qual movimento faz seus olhos brilharem: pode ser dança, caminhada ao ar livre, yoga restaurativa ou funcional leve. O segredo é consistência com prazer. Inclui 3 práticas guiadas em áudio.',
  '#9D174D',
  3
);

-- Semana 4
insert into public.modulos (id, numero_semana, titulo, subtitulo, descricao, cor_destaque, ordem)
values (
  'a1000000-0000-0000-0000-000000000004',
  4,
  'Sono & Restauração',
  'O pilar esquecido do emagrecimento natural',
  'Seu corpo emagrece enquanto dorme — se você dormir bem. Nesta semana, montamos juntas o seu ritual noturno perfeito: ambiente, horários, chás, técnicas de respiração e um tracker de qualidade do sono que vai abrir seus olhos.',
  '#EC4899',
  4
);

-- =============================================
-- Aulas — Semana 1: Despertar do Corpo
-- =============================================

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_url, duracao_min, ordem) values
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
 'Boas-vindas ao seu ritual', 'Um vídeo pessoal de boas-vindas explicando como funciona o Life Fit Members e o que esperar das próximas semanas.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 8, 1),

('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
 'Guia: Escuta Corporal Matinal', 'Um PDF ilustrado com o passo a passo do exercício de escuta corporal para fazer todos os dias ao acordar. Imprima e deixe na mesinha de cabeceira.', 'pdf', null, 5, 2),

('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
 'Meditação Guiada: Corpo Presente', 'Uma meditação de 12 minutos focada em body scan e presença. Perfeita para fazer ao acordar, ainda deitada na cama.', 'audio', null, 12, 3),

('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
 'Seu Protocolo de Hidratação', 'Artigo completo sobre como, quando e quanto hidratar — muito além de "beba 2 litros de água". Inclui receitas de águas aromatizadas e chás funcionais.', 'texto', null, 10, 4);

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_extra, duracao_min, ordem) values
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
 'Checklist da Semana 1', 'Sua lista de tarefas para esta semana. Marque cada item conforme for completando — sem pressa, no seu ritmo.', 'checklist',
 '{"items": [{"texto": "Fazer o exercício de escuta corporal por 3 manhãs"}, {"texto": "Ouvir a meditação guiada pelo menos 2 vezes"}, {"texto": "Preparar pelo menos 1 água aromatizada da lista"}, {"texto": "Escrever no diário: como me sinto hoje?"}, {"texto": "Tirar uma foto do pôr-do-sol esta semana"}]}',
 5, 5);

-- =============================================
-- Aulas — Semana 2: Alimentação Intuitiva
-- =============================================

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_url, duracao_min, ordem) values
('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
 'O Método do Prato Intuitivo', 'Vídeo-aula principal da semana: como montar refeições equilibradas sem pesar, medir ou contar nada. Visual, prático e libertador.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 18, 1),

('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
 'Cardápio Semanal Flexível', 'Um PDF lindo com sugestões de café da manhã, almoço, jantar e lanches. Não é cardápio rígido — são ideias pra quando bater o "o que vou comer hoje?"', 'pdf', null, 15, 2),

('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
 'Mindful Eating: Comer com Presença', 'Áudio guiado para uma refeição consciente. Coloque os fones, sirva seu prato e deixe-se guiar. Uma experiência que muda tudo.', 'audio', null, 15, 3),

('b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002',
 'Por Que Dietas Restritivas Falham', 'Um artigo profundo sobre a ciência por trás do efeito sanfona e por que a abordagem intuitiva é mais sustentável. Com referências e dados.', 'texto', null, 12, 4);

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_extra, duracao_min, ordem) values
('b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002',
 'Checklist da Semana 2', 'Seus rituais alimentares da semana.', 'checklist',
 '{"items": [{"texto": "Montar 3 pratos usando o método intuitivo"}, {"texto": "Fazer 1 refeição usando o áudio de mindful eating"}, {"texto": "Ir à feira ou mercado com a lista do PDF"}, {"texto": "Registrar como se sentiu após cada refeição consciente"}, {"texto": "Preparar um lanche saudável que te dê prazer"}]}',
 5, 5);

-- =============================================
-- Aulas — Semana 3: Movimento com Alma
-- =============================================

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_url, duracao_min, ordem) values
('b3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003',
 'Descubra Seu Movimento Ideal', 'Vídeo com um quiz interativo para identificar qual tipo de atividade física combina com sua personalidade, rotina e preferências.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 14, 1),

('b3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003',
 'Yoga Restaurativa — Prática Guiada', 'Áudio de uma sessão de yoga restaurativa de 20 minutos. Perfeita para dias em que seu corpo pede gentileza.', 'audio', null, 20, 2),

('b3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003',
 'Caminhada Consciente — Áudio Guia', 'Coloque os fones e saia para caminhar. Este áudio transforma uma caminhada comum em uma prática de meditação em movimento.', 'audio', null, 25, 3),

('b3000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003',
 'App Recomendado: Nike Training Club', 'Treinos gratuitos e adaptáveis para todos os níveis. Nosso app favorito para quem quer variar os treinos sem gastar nada.', 'link', 'https://www.nike.com/ntc-app', null, 4);

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_extra, duracao_min, ordem) values
('b3000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003',
 'Checklist da Semana 3', 'Seus movimentos da semana.', 'checklist',
 '{"items": [{"texto": "Fazer o quiz e descobrir seu tipo de movimento"}, {"texto": "Praticar a yoga restaurativa pelo menos 2 vezes"}, {"texto": "Fazer 1 caminhada consciente com o áudio guia"}, {"texto": "Experimentar 1 treino no app recomendado"}, {"texto": "Dançar uma música inteira na sua sala (vale qualquer ritmo!)"}]}',
 5, 5);

-- =============================================
-- Aulas — Semana 4: Sono & Restauração
-- =============================================

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_url, duracao_min, ordem) values
('b4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004',
 'A Ciência do Sono e Emagrecimento', 'Vídeo-aula reveladora: como a qualidade do sono impacta diretamente seus hormônios de fome, saciedade e metabolismo.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 16, 1),

('b4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004',
 'Guia: Monte Seu Ritual Noturno', 'PDF completo com o passo a passo para criar uma rotina pré-sono poderosa. Inclui receitas de chás relaxantes e técnicas de respiração.', 'pdf', null, 10, 2),

('b4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
 'Meditação para Dormir', 'Áudio de 18 minutos com uma meditação de relaxamento progressivo. Projetada para ser a última coisa que você ouve antes de dormir.', 'audio', null, 18, 3),

('b4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004',
 'O Ambiente Perfeito para Dormir', 'Um artigo sobre como transformar seu quarto em um santuário do sono: temperatura, iluminação, aromas e pequenos investimentos que valem a pena.', 'texto', null, 8, 4);

insert into public.aulas (id, modulo_id, titulo, descricao, tipo, conteudo_extra, duracao_min, ordem) values
('b4000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004',
 'Checklist da Semana 4', 'Seus rituais noturnos da semana.', 'checklist',
 '{"items": [{"texto": "Definir um horário fixo para começar a desligar telas"}, {"texto": "Preparar pelo menos 2 chás da lista antes de dormir"}, {"texto": "Ouvir a meditação para dormir por 3 noites"}, {"texto": "Fazer uma mudança no quarto (blackout, temperatura, aroma)"}, {"texto": "Registrar a qualidade do sono por 5 dias seguidos"}]}',
 5, 5);
