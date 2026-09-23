-- ============================================================================
--  RumeApp — foto de perfil en user_profiles (módulo "Mi cuenta")
--
--  La foto se guarda como data URL JPEG ya comprimida en el navegador
--  (256px, ~10–30 KB), igual que las fotos de animales. El check de tamaño
--  evita que alguien meta imágenes enormes llamando la API a mano.
--
--  listar_miembros_finca no cambia: la foto solo se muestra al propio user.
--  Idempotente.
-- ============================================================================

alter table user_profiles add column if not exists avatar text;

alter table user_profiles drop constraint if exists user_profiles_avatar_size;
alter table user_profiles add constraint user_profiles_avatar_size
  check (avatar is null or (avatar like 'data:image/%' and length(avatar) <= 200000));
