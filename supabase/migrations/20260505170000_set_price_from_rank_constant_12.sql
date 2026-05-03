-- trigger_set_price : coût jour 1 uniforme à 12 (l’ancien barème rank était une erreur métier).
CREATE OR REPLACE FUNCTION public.set_price_from_rank() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fantasy_cost := 12;
  RETURN NEW;
END;
$$;
