-- ============================================================================
--  RumeApp — solicitud de plan mensual o anual
--
--  Precios en pesos: Ganadero $25.000/mes, Hacienda $55.000/mes, y plan
--  anual con 20% de descuento. La solicitud guarda qué período eligió el
--  cliente para que el aviso al admin diga cuánto debe llegar.
--  Idempotente.
-- ============================================================================

alter table comprobantes_pago
  add column if not exists periodo text not null default 'mensual'
  check (periodo in ('mensual', 'anual'));
