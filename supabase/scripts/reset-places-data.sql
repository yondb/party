-- KROK 1: Wyczyść stare dane przed importem OSM
-- Uruchom w Supabase SQL Editor (uwaga: usuwa WSZYSTKIE sloty i miejsca)

-- Sloty zależą od miejsc — usuń najpierw powiązane dane jeśli FK nie kaskaduje
DELETE FROM ratings WHERE slot_id IN (SELECT id FROM slots);
DELETE FROM messages WHERE slot_id IN (SELECT id FROM slots);
DELETE FROM applications WHERE slot_id IN (SELECT id FROM slots);
DELETE FROM notifications WHERE slot_id IN (SELECT id FROM slots);

DELETE FROM slots;
DELETE FROM places;

-- Weryfikacja
SELECT count(*) AS slots_left FROM slots;
SELECT count(*) AS places_left FROM places;
