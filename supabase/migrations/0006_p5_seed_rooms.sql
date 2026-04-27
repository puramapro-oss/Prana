-- ============================================================
-- PRANA P5 — seed 8 rooms officielles
-- Idempotent : upsert by slug.
-- daily_action_template = jsonb array of {day, title, action, why, energy}
-- ============================================================

-- 1) sleep-reset · 14j
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'sleep-reset', 'Réinitialiser ton sommeil', 'Sleep Reset',
  'Sur 14 jours, tu apaises ton système nerveux le soir et tu retrouves un sommeil naturel. Une seule action chaque soir, jamais deux.',
  'Over 14 days, you calm your nervous system in the evening and rebuild natural sleep. One action a night, never two.',
  14, 'sleep', true, false,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Heure de coucher fixe', 'action', 'Choisis une heure de coucher pour les 14 prochains jours. Inscris-la quelque part visible.', 'why', 'Le système nerveux adore la prévisibilité.', 'energy', 'low'),
    jsonb_build_object('day', 2, 'title', 'Écrans coupés 60 min avant', 'action', 'Ce soir, ferme tous les écrans 60 min avant ton heure de coucher. Pose le téléphone hors de la chambre.', 'why', 'La lumière bleue retarde la mélatonine de 90 min.', 'energy', 'low'),
    jsonb_build_object('day', 3, 'title', 'Respiration 4-7-8', 'action', '6 cycles de 4-7-8 dans le lit, lumière éteinte. Inspire 4s · retiens 7s · expire 8s.', 'why', 'L''expiration longue active le parasympathique.', 'energy', 'low'),
    jsonb_build_object('day', 4, 'title', 'Décharge mentale', 'action', '3 minutes : écris tout ce qui te passe par la tête. Pas d''ordre, pas de tri.', 'why', 'Vider la tête sur papier libère la place pour dormir.', 'energy', 'low'),
    jsonb_build_object('day', 5, 'title', 'Pas de café après 14h', 'action', 'Aujourd''hui, dernier café avant 14h. Note l''effet sur ton endormissement.', 'why', 'La caféine a une demi-vie de 6h.', 'energy', 'low'),
    jsonb_build_object('day', 6, 'title', 'Lumière naturelle au réveil', 'action', '10 min de lumière du jour dans les 30 min après le réveil.', 'why', 'Cale ton horloge interne sur 24h.', 'energy', 'low'),
    jsonb_build_object('day', 7, 'title', 'Bilan semaine 1', 'action', 'Note 1 phrase : qu''est-ce qui change dans ton sommeil ?', 'why', 'Conscientiser les progrès renforce la motivation.', 'energy', 'low'),
    jsonb_build_object('day', 8, 'title', 'Pré-sommeil 30 min', 'action', 'Crée un rituel court : douche tiède OU thé OU 10 pages d''un livre.', 'why', 'Le rituel signale au corps "on bascule".', 'energy', 'low'),
    jsonb_build_object('day', 9, 'title', 'Chambre = sommeil', 'action', 'Pas de travail dans la chambre aujourd''hui. La chambre = sommeil + intimité.', 'why', 'Conditionnement Pavlov inversé.', 'energy', 'low'),
    jsonb_build_object('day', 10, 'title', 'Scan corporel', 'action', '5 min de scan corporel allongé : pieds → tête, relâche chaque zone.', 'why', 'Aide à entrer dans le sommeil profond.', 'energy', 'low'),
    jsonb_build_object('day', 11, 'title', 'Réveil sans alarme', 'action', 'Mets-toi au lit assez tôt pour te réveiller naturellement demain.', 'why', 'Test de la qualité de tes 8h.', 'energy', 'low'),
    jsonb_build_object('day', 12, 'title', 'Magnesium ou pas', 'action', 'Si tu en as : essaie 200mg de magnésium glycinate 1h avant le coucher.', 'why', 'Cofacteur du parasympathique. Optionnel.', 'energy', 'low'),
    jsonb_build_object('day', 13, 'title', 'Sieste ou pas', 'action', 'Pas de sieste après 15h aujourd''hui. Si fatigue, marche 10 min dehors.', 'why', 'Préserve la pression de sommeil pour la nuit.', 'energy', 'low'),
    jsonb_build_object('day', 14, 'title', 'Ta routine est prête', 'action', 'Choisis 3 actions des 14 jours qui resteront dans ta vie. Écris-les.', 'why', 'Tu installes un nouveau réflexe.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 2) focus-7d · 7j
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'focus-7d', 'Focus tunnel · 7 jours', 'Focus Tunnel · 7 days',
  '7 jours pour reconstruire ta capacité de concentration. Une seule session profonde par jour, pas plus.',
  '7 days to rebuild your focus muscle. One deep session per day, no more.',
  7, 'focus', true, false,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', '25 min sans téléphone', 'action', 'Mets ton téléphone dans une autre pièce. Travaille 25 min sur 1 seule tâche.', 'why', 'Le cerveau a besoin de 15 min pour rentrer dans le flow.', 'energy', 'medium'),
    jsonb_build_object('day', 2, 'title', '2× 25 min', 'action', 'Deux sessions de 25 min, pause 10 min entre. Sur la MÊME tâche.', 'why', 'Continuité > volume.', 'energy', 'medium'),
    jsonb_build_object('day', 3, 'title', 'Ton heure efficace', 'action', 'Note ton heure la plus claire mentalement aujourd''hui. Demain tu y caleras ta session.', 'why', 'Tu as 3-4h de focus profond par jour, à dépenser au bon moment.', 'energy', 'low'),
    jsonb_build_object('day', 4, 'title', 'Session sur ton heure d''or', 'action', '50 min de focus à ton heure efficace. Mode avion.', 'why', 'Tu testes le combo bon timing + bonnes conditions.', 'energy', 'high'),
    jsonb_build_object('day', 5, 'title', 'Single-tabbing', 'action', 'Travaille avec UN SEUL onglet ouvert pendant 30 min. Ferme tout le reste.', 'why', 'Chaque onglet ouvert = un coût cognitif silencieux.', 'energy', 'medium'),
    jsonb_build_object('day', 6, 'title', 'Distractions cataloguées', 'action', 'Quand une pensée surgit pendant ta session, écris-la sur papier (jamais sur écran). Reviens à la tâche.', 'why', 'Externaliser libère la mémoire de travail.', 'energy', 'medium'),
    jsonb_build_object('day', 7, 'title', 'Bilan + protocole perso', 'action', 'Quelle session a été ta meilleure ? Reproduis exactement ces conditions demain.', 'why', 'Tu as ton propre protocole de focus, basé sur 7 jours de données.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 3) dopamine-detox · 14j
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'dopamine-detox', 'Calmer ta dopamine', 'Dopamine Detox',
  '14 jours pour rééquilibrer ton circuit de récompense. Tu retrouves le plaisir du simple.',
  '14 days to rebalance your reward circuit. You rediscover joy in the simple.',
  14, 'mind', true, false,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Audit honnête', 'action', 'Liste les 3 apps que tu ouvres en boucle sans raison. Pas pour culpabiliser, juste savoir.', 'why', 'On ne peut pas changer ce qu''on ne voit pas.', 'energy', 'low'),
    jsonb_build_object('day', 2, 'title', 'Notifications coupées', 'action', 'Ce matin, désactive toutes les notifs sauf SMS et appels.', 'why', 'Chaque notif = micro-shoot de dopamine.', 'energy', 'low'),
    jsonb_build_object('day', 3, 'title', 'Premier 1h hors ligne', 'action', 'Aujourd''hui, 1h sans aucun écran. Marche, livre, ennui.', 'why', 'L''ennui est l''antichambre de la créativité.', 'energy', 'low'),
    jsonb_build_object('day', 4, 'title', 'Petit-déj sans écran', 'action', 'Mange ton petit-déj sans téléphone, sans podcast, juste toi et la nourriture.', 'why', 'Ré-apprendre à être seul avec soi sans s''ennuyer.', 'energy', 'low'),
    jsonb_build_object('day', 5, 'title', 'Temps de scroll mesuré', 'action', 'Vérifie ton temps d''écran sur les apps réseaux. Note le total.', 'why', 'La donnée est ton alliée.', 'energy', 'low'),
    jsonb_build_object('day', 6, 'title', '1 app supprimée', 'action', 'Désinstalle UNE app qui te bouffe le plus. Tu peux la remettre dans 7 jours si tu veux.', 'why', 'La friction tue 80% de l''usage.', 'energy', 'medium'),
    jsonb_build_object('day', 7, 'title', 'Sans téléphone le matin', 'action', 'Ne touche pas ton téléphone pendant la première heure du réveil.', 'why', 'Premier shoot de dopamine = premier mouvement de ta journée.', 'energy', 'medium'),
    jsonb_build_object('day', 8, 'title', 'Lecture longue', 'action', '20 min de lecture papier. Sans téléphone à portée.', 'why', 'Réentraîner l''attention sur du lent.', 'energy', 'low'),
    jsonb_build_object('day', 9, 'title', 'Marche sans podcast', 'action', '20 min de marche sans rien dans les oreilles.', 'why', 'Laisse ton cerveau respirer.', 'energy', 'medium'),
    jsonb_build_object('day', 10, 'title', 'Repas en pleine présence', 'action', 'Un repas aujourd''hui : que tu manges, sans rien d''autre. Goûte vraiment.', 'why', 'La présence est gratuite et enrichissante.', 'energy', 'low'),
    jsonb_build_object('day', 11, 'title', 'Soirée sans Netflix', 'action', 'Pas de série/film ce soir. Lis, dessine, parle, marche.', 'why', 'Test : qu''est-ce que tu fais quand tu n''as plus l''écran ?', 'energy', 'medium'),
    jsonb_build_object('day', 12, 'title', 'Une joie simple', 'action', 'Trouve un truc simple qui te fait du bien (thé chaud, fenêtre ouverte). Goûte 2 min.', 'why', 'Recalibrer ton seuil de plaisir.', 'energy', 'low'),
    jsonb_build_object('day', 13, 'title', 'Bilan sensoriel', 'action', 'Note 3 changements depuis le jour 1 (sommeil, attention, humeur).', 'why', 'Voir le progrès = renforcer la pratique.', 'energy', 'low'),
    jsonb_build_object('day', 14, 'title', 'Tes nouvelles règles', 'action', 'Choisis 3 règles que tu gardes après les 14 jours.', 'why', 'Tu sors avec un protocole personnel.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 4) anti-anxiety · 21j (premium)
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'anti-anxiety', 'Apaiser l''anxiété · 21 jours', 'Anti-Anxiety · 21 days',
  '21 jours d''outils concrets pour réguler ton système nerveux. Pas de magie, des micro-pratiques répétées.',
  '21 days of practical tools to regulate your nervous system. No magic, just repeated micro-practices.',
  21, 'mind', true, true,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Cartographier le corps', 'action', 'Quand tu es anxieux·se aujourd''hui, note où tu le sens dans le corps.', 'why', 'L''anxiété parle d''abord par le corps.', 'energy', 'low'),
    jsonb_build_object('day', 2, 'title', 'Respiration cohérence', 'action', '5 min de respiration 5-5 (5s inspire / 5s expire).', 'why', 'Cale ton rythme cardiaque sur la respiration.', 'energy', 'low'),
    jsonb_build_object('day', 3, 'title', '5-4-3-2-1', 'action', 'Quand l''anxiété monte : nomme 5 choses que tu vois, 4 que tu touches, 3 que tu entends, 2 que tu sens, 1 que tu goûtes.', 'why', 'Ramener au présent par les sens.', 'energy', 'low'),
    jsonb_build_object('day', 4, 'title', 'Vagal humming', 'action', 'Hum (mmm) lent et grave pendant 1 min, 3 fois aujourd''hui.', 'why', 'Stimule le nerf vague directement.', 'energy', 'low'),
    jsonb_build_object('day', 5, 'title', 'Eau froide', 'action', 'Eau froide sur le visage 30s ce matin.', 'why', 'Active le réflexe de plongée du nerf vague.', 'energy', 'low'),
    jsonb_build_object('day', 6, 'title', 'Marche bilatérale', 'action', '15 min de marche, attention sur le mouvement gauche-droite des bras.', 'why', 'Stimulation bilatérale apaise l''hippocampe.', 'energy', 'medium'),
    jsonb_build_object('day', 7, 'title', 'Micro-bilan', 'action', 'Quel outil t''a le plus aidé ? Garde-le sous le coude.', 'why', 'Construire ta boîte à outils.', 'energy', 'low'),
    jsonb_build_object('day', 8, 'title', 'Journal d''anxiété', 'action', 'Aujourd''hui, à chaque pic d''anxiété : note l''heure + déclencheur + intensité 1-10.', 'why', 'Voir les patterns sur papier change tout.', 'energy', 'low'),
    jsonb_build_object('day', 9, 'title', 'Café réduit', 'action', 'Coupe ton café en 2 aujourd''hui. Note l''effet.', 'why', 'La caféine amplifie l''anxiété physiologique.', 'energy', 'low'),
    jsonb_build_object('day', 10, 'title', 'Sucre observé', 'action', 'Observe ce que tu manges aujourd''hui. Note les pics de sucre rapide.', 'why', 'Les pics glycémiques miment l''anxiété.', 'energy', 'low'),
    jsonb_build_object('day', 11, 'title', 'Nature 20 min', 'action', '20 min dehors dans un parc ou forêt.', 'why', 'Le système nerveux récupère 8x plus vite en présence de verdure.', 'energy', 'medium'),
    jsonb_build_object('day', 12, 'title', 'Limites sociales', 'action', 'Identifie une situation/personne qui t''anxie. Réfléchis à une limite à poser.', 'why', 'L''anxiété est souvent un signal d''alerte.', 'energy', 'medium'),
    jsonb_build_object('day', 13, 'title', 'Restructure cognitive', 'action', 'Une pensée anxieuse aujourd''hui → demande-toi : qu''est-ce qui est factuellement vrai ? Quel est le pire réaliste ?', 'why', 'L''anxiété anticipe le pire imaginé, rarement le vrai.', 'energy', 'medium'),
    jsonb_build_object('day', 14, 'title', 'Bilan semaine 2', 'action', 'Note 1 changement physiologique depuis le jour 1.', 'why', 'Le corps mémorise les nouveaux réflexes.', 'energy', 'low'),
    jsonb_build_object('day', 15, 'title', 'Mouvement intense court', 'action', '5 min d''effort intense (pompes, course sur place).', 'why', 'Décharger le cortisol stocké.', 'energy', 'high'),
    jsonb_build_object('day', 16, 'title', 'Connexion humaine', 'action', 'Appelle ou vois quelqu''un de safe pendant 20 min.', 'why', 'Le système nerveux apaisé d''un autre régule le tien.', 'energy', 'medium'),
    jsonb_build_object('day', 17, 'title', 'Sommeil priorité', 'action', 'Couche-toi 30 min plus tôt ce soir, sans exception.', 'why', 'Le manque de sommeil augmente l''anxiété de 30%.', 'energy', 'low'),
    jsonb_build_object('day', 18, 'title', 'No to one thing', 'action', 'Dis non à UNE chose qui t''ennuie aujourd''hui.', 'why', 'Chaque non protège ton système nerveux.', 'energy', 'medium'),
    jsonb_build_object('day', 19, 'title', 'Méditation 10 min', 'action', '10 min assis·e, attention sur la respiration. Si tu t''égares, reviens. C''est ça la pratique.', 'why', 'Tu réentraînes ton attention à choisir.', 'energy', 'low'),
    jsonb_build_object('day', 20, 'title', 'Tes 3 outils', 'action', 'Choisis tes 3 outils préférés des 20 derniers jours. Note-les.', 'why', 'Tu construis ton kit anti-crise personnel.', 'energy', 'low'),
    jsonb_build_object('day', 21, 'title', 'Pacte avec toi', 'action', 'Écris ce que tu fais à la prochaine montée d''anxiété. 3 lignes max.', 'why', 'L''engagement écrit augmente la probabilité de tenir de 5x.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 5) launch-sprint · 7j
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'launch-sprint', 'Sprint lancement · 7 jours', 'Launch Sprint · 7 days',
  '7 jours pour sortir un projet du tiroir et le mettre dans le monde. Action quotidienne ciblée.',
  '7 days to take a project from drawer to world. One targeted action a day.',
  7, 'execute', true, false,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'La promesse en 1 phrase', 'action', 'Écris en 1 phrase : qu''est-ce que mon projet PROMET de changer ?', 'why', 'Si tu ne peux pas le résumer en 1 phrase, tu n''es pas prêt·e.', 'energy', 'medium'),
    jsonb_build_object('day', 2, 'title', 'Le minimum viable', 'action', 'Liste 3 features. Coche LA SEULE qui doit être présente au lancement.', 'why', 'Lancer = couper, pas ajouter.', 'energy', 'medium'),
    jsonb_build_object('day', 3, 'title', '5 personnes cibles', 'action', 'Identifie 5 personnes pour qui c''est PARFAIT. Avec leur prénom.', 'why', 'Marketing pour 100k = bouillie. Marketing pour 5 = clarté.', 'energy', 'medium'),
    jsonb_build_object('day', 4, 'title', 'Demo 60 secondes', 'action', 'Enregistre une démo de 60s du résultat final. Smartphone, brut.', 'why', 'Une démo vaut 1000 mots de copywriting.', 'energy', 'high'),
    jsonb_build_object('day', 5, 'title', 'Parler à 3 humains', 'action', 'Envoie ta démo à 3 personnes de tes 5 cibles. Demande : qu''est-ce qui n''est pas clair ?', 'why', 'Tu corriges sur du vrai feedback, pas tes hypothèses.', 'energy', 'medium'),
    jsonb_build_object('day', 6, 'title', 'Page d''accueil minimale', 'action', 'Une page web simple : promesse + démo + bouton.', 'why', 'Pas de design léché. Juste comprenable.', 'energy', 'high'),
    jsonb_build_object('day', 7, 'title', 'Lancement public', 'action', 'Poste-le. Sur 1 réseau. À tes 5 personnes en privé en parallèle. C''est lancé.', 'why', 'Mieux fait que parfait.', 'energy', 'high')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 6) morning-calm · 30j (premium)
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'morning-calm', 'Matins calmes · 30 jours', 'Morning Calm · 30 days',
  '30 jours pour transformer tes matins. Une micro-action quotidienne, jamais plus de 2 min.',
  '30 days to transform your mornings. One micro-action a day, never more than 2 min.',
  30, 'morning', true, true,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Pieds au sol', 'action', 'Pose tes deux pieds nus sur le sol pendant 30s avant de te lever.', 'why', 'Ancrage corporel avant tout.', 'energy', 'low'),
    jsonb_build_object('day', 2, 'title', 'Verre d''eau', 'action', 'Bois un grand verre d''eau dans les 5 min après le réveil.', 'why', 'Tu sors de 8h sans boire.', 'energy', 'low'),
    jsonb_build_object('day', 3, 'title', '3 respirations', 'action', '3 grandes respirations en regardant par la fenêtre.', 'why', 'Oxygéner avant tout effort cognitif.', 'energy', 'low'),
    jsonb_build_object('day', 4, 'title', '1 chose pour toi', 'action', 'Identifie 1 chose que tu fais ce matin POUR TOI, pas pour les autres.', 'why', 'Ton matin t''appartient.', 'energy', 'low'),
    jsonb_build_object('day', 5, 'title', 'Étirement chat', 'action', 'À 4 pattes, dos rond puis dos creux. 5 fois.', 'why', 'Réveil de la colonne.', 'energy', 'low'),
    jsonb_build_object('day', 6, 'title', 'Pas de tel 30 min', 'action', '30 premières minutes : pas d''écran. Tu peux écouter de la musique.', 'why', 'Protéger le sas du réveil.', 'energy', 'low'),
    jsonb_build_object('day', 7, 'title', 'Bilan semaine 1', 'action', 'Quel matin t''a le plus plu cette semaine ? Pourquoi ?', 'why', 'Reproduire ce qui marche.', 'energy', 'low'),
    jsonb_build_object('day', 8, 'title', 'Lumière naturelle 5 min', 'action', '5 min sur le balcon ou devant fenêtre ouverte.', 'why', 'Cale l''horloge interne.', 'energy', 'low'),
    jsonb_build_object('day', 9, 'title', 'Petit-déj choisi', 'action', 'Mange quelque chose que tu aimes vraiment. Pas par défaut.', 'why', 'Tu programmes la journée par ce premier choix.', 'energy', 'low'),
    jsonb_build_object('day', 10, 'title', 'Jambes mollets sol', 'action', 'Allongé·e, jambes posées sur le mur 3 min.', 'why', 'Drainage + apaisement nerveux.', 'energy', 'low'),
    jsonb_build_object('day', 11, 'title', 'Intention courte', 'action', 'Écris 1 phrase : aujourd''hui, je veux _______.', 'why', 'Diriger l''attention dès le matin.', 'energy', 'low'),
    jsonb_build_object('day', 12, 'title', 'Sourire forcé 30s', 'action', '30s de sourire forcé devant le miroir.', 'why', 'Le sourire active la sérotonine, même fake.', 'energy', 'low'),
    jsonb_build_object('day', 13, 'title', 'Marche 5 min', 'action', 'Marche 5 min dehors avant la première tâche.', 'why', 'Le mouvement avant le travail bouge l''énergie.', 'energy', 'medium'),
    jsonb_build_object('day', 14, 'title', 'Nouveau son', 'action', 'Mets une musique que tu n''as jamais écoutée le matin.', 'why', 'Sortir des automatismes.', 'energy', 'low'),
    jsonb_build_object('day', 15, 'title', 'Bilan mi-parcours', 'action', 'Compare ton matin d''aujourd''hui avec celui d''il y a 15 jours.', 'why', 'Voir les changements.', 'energy', 'low'),
    jsonb_build_object('day', 16, 'title', 'Eau froide visage', 'action', '15s d''eau froide sur le visage.', 'why', 'Réveil du nerf vague.', 'energy', 'low'),
    jsonb_build_object('day', 17, 'title', 'Gratitude rapide', 'action', 'Note 1 truc pour lequel tu es reconnaissant·e.', 'why', 'Recâbler le cerveau vers le positif.', 'energy', 'low'),
    jsonb_build_object('day', 18, 'title', 'Pas de news', 'action', 'Pas de news ce matin. Test.', 'why', 'Voir si tu perds quelque chose. Souvent non.', 'energy', 'low'),
    jsonb_build_object('day', 19, 'title', 'Plante observée', 'action', 'Regarde une plante 1 min comme si tu la voyais pour la 1ère fois.', 'why', 'Réentraîner l''attention.', 'energy', 'low'),
    jsonb_build_object('day', 20, 'title', 'Téléphone mode avion', 'action', 'Mode avion jusqu''à ton premier acte conscient.', 'why', 'Sas de protection.', 'energy', 'low'),
    jsonb_build_object('day', 21, 'title', 'Déjeuner sans écran', 'action', 'Mange ton petit-déj sans téléphone.', 'why', 'Présence au goût.', 'energy', 'low'),
    jsonb_build_object('day', 22, 'title', 'Posture droite 1 min', 'action', '1 min debout, dos droit, regard à l''horizon.', 'why', 'Posture = humeur.', 'energy', 'low'),
    jsonb_build_object('day', 23, 'title', 'Bain de bouche présence', 'action', 'Brosse-toi les dents en n''étant QUE là.', 'why', 'Pleine présence dans le banal.', 'energy', 'low'),
    jsonb_build_object('day', 24, 'title', 'Deep breath de 90s', 'action', '90s de respiration profonde, yeux fermés, en silence.', 'why', 'Reset complet.', 'energy', 'low'),
    jsonb_build_object('day', 25, 'title', 'Choisis ta priorité', 'action', 'Avant tout : quelle est LA priorité de cette journée ?', 'why', 'Une priorité claire = une journée claire.', 'energy', 'low'),
    jsonb_build_object('day', 26, 'title', 'Pas de café 24h', 'action', 'Test : matin sans café aujourd''hui.', 'why', 'Voir comment tu fonctionnes sans béquille.', 'energy', 'medium'),
    jsonb_build_object('day', 27, 'title', 'Personne aimée', 'action', 'Envoie un message court à quelqu''un que tu aimes.', 'why', 'Connexion = baseline calme.', 'energy', 'low'),
    jsonb_build_object('day', 28, 'title', 'Liste 3 forces', 'action', 'Note 3 choses que tu fais bien. Honnêtement.', 'why', 'Recâbler le narratif.', 'energy', 'low'),
    jsonb_build_object('day', 29, 'title', 'Test sans plan', 'action', 'Pas de planning ce matin. Vois ce qui émerge.', 'why', 'Confiance dans le flux.', 'energy', 'medium'),
    jsonb_build_object('day', 30, 'title', 'Rituel à toi', 'action', 'Choisis 3 actions des 30 jours. Ton rituel matinal personnel est là.', 'why', 'Tu pars avec un protocole sur-mesure.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 7) deep-work · 21j (premium)
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'deep-work', 'Deep Work · 21 jours', 'Deep Work · 21 days',
  '21 jours pour bâtir une pratique de travail profond inspirée de Cal Newport. Une session par jour, qualité > durée.',
  '21 days to build a deep work practice inspired by Cal Newport. One session a day, quality over duration.',
  21, 'focus', true, true,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', '30 min single-task', 'action', '30 min sur 1 seule tâche, sans distraction. Pas de téléphone, pas d''onglet ouvert.', 'why', 'Construire la base.', 'energy', 'medium'),
    jsonb_build_object('day', 2, 'title', 'Définir la session', 'action', 'Avant ta session : écris ce que tu veux produire. Spécifique.', 'why', 'Une session sans output défini = errance.', 'energy', 'medium'),
    jsonb_build_object('day', 3, 'title', '45 min', 'action', '45 min de focus, même règles.', 'why', 'Augmenter progressivement.', 'energy', 'medium'),
    jsonb_build_object('day', 4, 'title', 'Lieu dédié', 'action', 'Trouve UN endroit que tu réserves au deep work. Va-y.', 'why', 'Ton cerveau associe lieu = mode.', 'energy', 'medium'),
    jsonb_build_object('day', 5, 'title', 'Avant/Après', 'action', 'Note ton niveau d''énergie avant et après. Sur 10.', 'why', 'Le deep work bien fait recharge plus qu''il n''épuise.', 'energy', 'medium'),
    jsonb_build_object('day', 6, 'title', 'Ferme l''email', 'action', 'Pas d''email pendant la session. Du tout.', 'why', 'L''email est l''ennemi du deep work.', 'energy', 'medium'),
    jsonb_build_object('day', 7, 'title', 'Bilan semaine 1', 'action', 'Quel a été ton meilleur output cette semaine ? Quelle session ?', 'why', 'Comprendre ce qui marche pour toi.', 'energy', 'low'),
    jsonb_build_object('day', 8, 'title', '60 min', 'action', '60 min de deep work. Mode avion total.', 'why', 'Atteindre la zone profonde.', 'energy', 'high'),
    jsonb_build_object('day', 9, 'title', 'Déconnexion email matin', 'action', 'Pas d''email avant 11h aujourd''hui.', 'why', 'Le matin = le meilleur deep work.', 'energy', 'medium'),
    jsonb_build_object('day', 10, 'title', '2 sessions', 'action', '2 sessions de 45 min, pause 30 min entre.', 'why', 'Construire l''endurance.', 'energy', 'high'),
    jsonb_build_object('day', 11, 'title', 'Time-block ta semaine', 'action', 'Bloque 5 sessions de deep work cette semaine dans ton agenda.', 'why', 'Si ce n''est pas planifié, ça n''arrive pas.', 'energy', 'medium'),
    jsonb_build_object('day', 12, 'title', 'Friction maximale tel', 'action', 'Mets ton téléphone dans une autre pièce + en mode silencieux.', 'why', 'La friction réduit la tentation.', 'energy', 'medium'),
    jsonb_build_object('day', 13, 'title', 'Notes papier', 'action', 'Pour cette session, prends tes notes sur papier.', 'why', 'Engagement cognitif différent.', 'energy', 'medium'),
    jsonb_build_object('day', 14, 'title', 'Bilan semaine 2', 'action', 'Combien de minutes de vrai deep work cette semaine ? Honnête.', 'why', 'Mesurer pour progresser.', 'energy', 'low'),
    jsonb_build_object('day', 15, 'title', 'Promenade de pensée', 'action', 'Avant ta session : 15 min de marche en pensant au problème.', 'why', 'La marche = mode diffus de réflexion.', 'energy', 'medium'),
    jsonb_build_object('day', 16, 'title', '90 min', 'action', '90 min de deep work. Tu peux le faire.', 'why', 'Cycle ultradien.', 'energy', 'high'),
    jsonb_build_object('day', 17, 'title', 'Pas de réunion matin', 'action', 'Bloque ton matin contre les réunions, juste aujourd''hui.', 'why', 'Le deep work demande des matinées intactes.', 'energy', 'medium'),
    jsonb_build_object('day', 18, 'title', 'Distraction listée', 'action', 'Quand une distraction surgit pendant la session, écris-la sur un papier "à voir plus tard". Reviens.', 'why', 'Externaliser libère la mémoire.', 'energy', 'medium'),
    jsonb_build_object('day', 19, 'title', 'Output public', 'action', 'Partage UN morceau de ton travail à 1 personne aujourd''hui.', 'why', 'Le retour ferme la boucle.', 'energy', 'medium'),
    jsonb_build_object('day', 20, 'title', 'Routine personnalisée', 'action', 'Écris ta propre routine de deep work : où, quand, durée, règles.', 'why', 'Tu pars avec un système à toi.', 'energy', 'low'),
    jsonb_build_object('day', 21, 'title', 'Engagement 30 jours', 'action', 'Engage-toi pour 30 jours de plus avec ta routine. Écris-le.', 'why', 'L''habitude se solidifie après 60-90 jours.', 'energy', 'low')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

-- 8) reset-3d · 3j
insert into prana.rooms (slug, name_fr, name_en, description_fr, description_en, duration_days, category, is_official, is_premium, daily_action_template)
values (
  'reset-3d', 'Reset express · 3 jours', 'Express Reset · 3 days',
  'Tu es au bord. 3 jours d''actions micro pour calmer le système avant de réfléchir.',
  'You''re at the edge. 3 days of micro-actions to calm the system before thinking.',
  3, 'reset', true, false,
  jsonb_build_array(
    jsonb_build_object('day', 1, 'title', 'Stop · respire · marche', 'action', 'Aujourd''hui : 3 fois dans la journée, stop, 5 respirations, marche 2 min.', 'why', 'Casser la spirale.', 'energy', 'low'),
    jsonb_build_object('day', 2, 'title', 'Une seule chose', 'action', 'Identifie LA SEULE chose vraiment urgente aujourd''hui. Le reste attend.', 'why', 'Quand tout brûle, choisir une bouteille d''eau à la fois.', 'energy', 'low'),
    jsonb_build_object('day', 3, 'title', 'Demande aide', 'action', 'Dis à 1 personne : "j''ai besoin d''aide pour ___".', 'why', 'Tu n''es pas seul·e. Le dire ouvre la porte.', 'energy', 'medium')
  )
) on conflict (slug) do update set
  name_fr = excluded.name_fr, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_en = excluded.description_en,
  duration_days = excluded.duration_days, category = excluded.category,
  is_official = excluded.is_official, is_premium = excluded.is_premium,
  daily_action_template = excluded.daily_action_template;

do $$
begin
  raise notice 'PRANA P5 — 8 rooms officielles seedées';
end$$;
