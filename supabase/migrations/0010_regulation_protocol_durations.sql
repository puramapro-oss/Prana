-- Adjust the original catalogue only when its timing and previous duration
-- still match the seeded version. Labels can be translated independently.
with corrections (slug, previous_seconds, actual_seconds, timing) as (
  values
    ('stop-stress', 90, 88, '[{"type":"breath","inhale":4,"hold":7,"exhale":8,"repeats":4},{"type":"ground","duration_seconds":12}]'::jsonb),
    ('physiological-sigh', 30, 46, '[{"type":"say","duration_seconds":6},{"type":"breath","inhale":3,"exhale":5,"repeats":5}]'::jsonb),
    ('panic-relief', 180, 166, '[{"type":"say","duration_seconds":6},{"type":"breath","inhale":5,"exhale":5,"repeats":16}]'::jsonb),
    ('box-breathing', 120, 128, '[{"type":"breath","inhale":4,"hold":4,"exhale":4,"hold_after":4,"repeats":8}]'::jsonb),
    ('morning-energize', 90, 87, '[{"type":"stretch","duration_seconds":15},{"type":"breath","inhale":2,"exhale":1,"repeats":20},{"type":"say","duration_seconds":12}]'::jsonb),
    ('sleep-express', 180, 158, '[{"type":"breath","inhale":4,"hold":7,"exhale":8,"repeats":7},{"type":"visualize","duration_seconds":25}]'::jsonb),
    ('wim-hof-light', 180, 151, '[{"type":"say","duration_seconds":6},{"type":"breath","inhale":1,"exhale":1,"repeats":30},{"type":"rest","duration_seconds":30},{"type":"breath","inhale":5,"hold":15,"exhale":5,"repeats":1},{"type":"rest","duration_seconds":30}]'::jsonb)
)
update prana.regulation_protocols as protocol
   set duration_seconds = corrections.actual_seconds
  from corrections
 where protocol.slug = corrections.slug
   and protocol.duration_seconds = corrections.previous_seconds
   and corrections.timing = (
     select jsonb_agg(
       case when jsonb_typeof(step) = 'object' then step - 'label' else step end
       order by ordinal
     )
       from jsonb_array_elements(
         case when jsonb_typeof(protocol.steps) = 'array' then protocol.steps else '[]'::jsonb end
       ) with ordinality as program(step, ordinal)
   );
