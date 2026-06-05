alter type public.forma_pago_venta add value if not exists 'tarjeta_credito';
alter type public.forma_pago_venta add value if not exists 'tarjeta_debito';
alter type public.forma_pago_venta add value if not exists 'transferencia';
