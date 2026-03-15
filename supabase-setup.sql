-- ═══════════════════════════════════════════════════
--  SANS FILTRE — Supabase Tables Setup
--  Exécute ce SQL dans : Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Table des questions de la semaine
CREATE TABLE IF NOT EXISTS weekly_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  category text DEFAULT 'couple',
  debate_point text,
  week_start timestamptz NOT NULL,
  week_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Table des votes (avec nickname pour le leaderboard)
CREATE TABLE IF NOT EXISTS weekly_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES weekly_questions(id) ON DELETE CASCADE,
  vote_value text NOT NULL CHECK (vote_value IN ('oui', 'non')),
  device_id text NOT NULL,
  nickname text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, device_id)
);

-- 3. Table des questions communautaires
CREATE TABLE IF NOT EXISTS community_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  category text DEFAULT 'couple',
  type text DEFAULT 'discuss',
  choices text[],
  submitted_by text,
  approved boolean DEFAULT false,
  votes_up int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Activer Row Level Security (RLS) avec accès public en lecture
ALTER TABLE weekly_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

-- Policies : tout le monde peut lire, tout le monde peut voter/soumettre
CREATE POLICY "Public read weekly_questions" ON weekly_questions FOR SELECT USING (true);
CREATE POLICY "Public read weekly_votes" ON weekly_votes FOR SELECT USING (true);
CREATE POLICY "Public insert weekly_votes" ON weekly_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read community_questions" ON community_questions FOR SELECT USING (true);
CREATE POLICY "Public insert community_questions" ON community_questions FOR INSERT WITH CHECK (true);

-- 5. Insérer une question de la semaine pour tester
INSERT INTO weekly_questions (question, category, debate_point, week_start, week_end)
VALUES (
  'Si ton/ta partenaire te proposait de tout quitter pour vivre à l''autre bout du monde, accepterais-tu sans condition ?',
  'couple',
  'L''amour peut-il tout justifier, même renoncer à sa vie construite ?',
  date_trunc('week', now()),
  date_trunc('week', now()) + interval '7 days'
);

-- 6. IMPORTANT : Activer Realtime pour le mode Live
-- Va dans : Supabase Dashboard > Database > Replication
-- Active "Realtime" pour les tables nécessaires
-- OU exécute :
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_votes;

-- ═══════════════════════════════════════════════════
--  Si tu avais déjà la table weekly_votes SANS la colonne nickname :
--  Exécute cette migration :
-- ═══════════════════════════════════════════════════
-- ALTER TABLE weekly_votes ADD COLUMN IF NOT EXISTS nickname text;
