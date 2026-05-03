-- Ajout d'une sixième équipe par défaut pour pouvoir générer correctement les matchs de championnat
INSERT INTO teams (name, wins, losses, points)
SELECT 'Team Epsilon', 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Team Epsilon');
