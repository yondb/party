-- Szybki seed miejsc (mapa działa od razu). Uruchom w SQL Editor po reset-places-data.sql.
-- Import OSM (npm run import:places) możesz puścić później — nadpisze/uzupełni po osm_id.

INSERT INTO public.places (name, category, lat, lng, city, district, osm_id) VALUES
  ('Łazienki Królewskie', 'running', 52.2152, 21.0354, 'warsaw', 'Mokotów', 'seed-lazienki'),
  ('Pole Mokotowskie', 'running', 52.2089, 21.0202, 'warsaw', 'Mokotów', 'seed-pole-mokotowskie'),
  ('Park Skaryszewski', 'running', 52.2410, 21.0850, 'warsaw', 'Praga', 'seed-skaryszewski'),
  ('Bulwary Wiślane', 'cycling', 52.2401, 21.0285, 'warsaw', 'Śródmieście', 'seed-bulwary'),
  ('Park Szczęśliwicki', 'cycling', 52.2250, 20.9800, 'warsaw', 'Ochota', 'seed-szczesliwicki'),
  ('Plaża Górczewska', 'gym', 52.2245, 20.9120, 'warsaw', 'Bemowo', 'seed-gorczewska'),
  ('Park Praski', 'gym', 52.2520, 21.0420, 'warsaw', 'Praga', 'seed-praski'),
  ('Torwar', 'tennis', 52.2280, 21.0420, 'warsaw', 'Mokotów', 'seed-torwar'),
  ('OSiR Mokotów', 'tennis', 52.1980, 21.0650, 'warsaw', 'Mokotów', 'seed-osir-mokotow'),
  ('Hala Koszykówka Mokotów', 'basketball', 52.1950, 21.0700, 'warsaw', 'Mokotów', 'seed-basket-mokotow'),
  ('Park Moczydło', 'basketball', 52.1920, 20.9950, 'warsaw', 'Ursynów', 'seed-moczydlo'),
  ('Kampinoski Park Narodowy', 'hiking', 52.3500, 20.7500, 'warsaw', 'Kampinos', 'seed-kampinos'),
  ('Kabaty', 'hiking', 52.1300, 21.0700, 'warsaw', 'Ursynów', 'seed-kabaty'),
  ('Padel Park Warszawa', 'padel', 52.2100, 21.0200, 'warsaw', 'Wola', 'seed-padel-wola')
ON CONFLICT (osm_id) DO NOTHING;

SELECT category, count(*) FROM places GROUP BY category ORDER BY category;
