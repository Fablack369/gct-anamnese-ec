-- Add performance indices for common queries
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON public.clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_anamneses_created_at ON public.anamneses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anamneses_cliente_id ON public.anamneses(cliente_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_tem_risco ON public.anamneses(tem_risco);