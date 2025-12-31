
-- Create clients table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  cpf TEXT,
  telefone TEXT NOT NULL,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anamneses table
CREATE TABLE public.anamneses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}',
  url_assinatura TEXT,
  termo_aceito BOOLEAN NOT NULL DEFAULT false,
  tem_risco BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

-- Public insert policy for clients (anyone can submit the form)
CREATE POLICY "Allow public insert on clientes"
ON public.clientes
FOR INSERT
TO anon
WITH CHECK (true);

-- Public insert policy for anamneses
CREATE POLICY "Allow public insert on anamneses"
ON public.anamneses
FOR INSERT
TO anon
WITH CHECK (true);

-- Authenticated users can read all clients
CREATE POLICY "Authenticated can read clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can read all anamneses
CREATE POLICY "Authenticated can read anamneses"
ON public.anamneses
FOR SELECT
TO authenticated
USING (true);

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('assinaturas', 'assinaturas', true);

-- Allow public uploads to signatures bucket
CREATE POLICY "Allow public upload to assinaturas"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'assinaturas');

-- Allow public read from signatures bucket
CREATE POLICY "Allow public read from assinaturas"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'assinaturas');

-- Allow authenticated read from signatures bucket
CREATE POLICY "Allow authenticated read from assinaturas"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'assinaturas');
