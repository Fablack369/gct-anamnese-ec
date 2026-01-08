import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import FormSection from '@/components/FormSection';
import HealthQuestion from '@/components/HealthQuestion';
import SignaturePad from '@/components/SignaturePad';
import ProgressStepper from '@/components/ProgressStepper';
import { useFormProgress } from '@/hooks/useFormProgress';
import { User, Heart, FileText, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FadeIn, StaggerContainer } from '@/components/ui/Transitions';

interface HealthAnswers {
  queloides: { value: boolean | null; details: string };
  problemasPele: { value: boolean | null; details: string };
  alergias: { value: boolean | null; details: string };
  roacutan: { value: boolean | null; details: string };
  doencasCronicas: { value: boolean | null; details: string };
  doencasInfecciosas: { value: boolean | null; details: string };
  gravidaAmamentando: { value: boolean | null; details: string };
}

const AnamneseForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Section refs for progress tracking
  const personalRef = useRef<HTMLElement>(null);
  const healthRef = useRef<HTMLElement>(null);
  const signatureRef = useRef<HTMLElement>(null);

  const { currentStep } = useFormProgress({
    sectionRefs: [personalRef, healthRef, signatureRef],
    offset: 250,
  });

  // Personal data
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');

  // Health answers
  const [healthAnswers, setHealthAnswers] = useState<HealthAnswers>({
    queloides: { value: null, details: '' },
    problemasPele: { value: null, details: '' },
    alergias: { value: null, details: '' },
    roacutan: { value: null, details: '' },
    doencasCronicas: { value: null, details: '' },
    doencasInfecciosas: { value: null, details: '' },
    gravidaAmamentando: { value: null, details: '' },
  });

  // Signature and terms
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [termoAceito, setTermoAceito] = useState(false);

  const updateHealthAnswer = (key: keyof HealthAnswers, value: boolean) => {
    setHealthAnswers(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const updateHealthDetails = (key: keyof HealthAnswers, details: string) => {
    setHealthAnswers(prev => ({
      ...prev,
      [key]: { ...prev[key], details }
    }));
  };

  const hasRiskCondition = () => {
    return (
      healthAnswers.queloides.value === true ||
      healthAnswers.roacutan.value === true ||
      healthAnswers.doencasInfecciosas.value === true
    );
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !telefone.trim()) {
      toast.error('Preencha os campos obrigatórios: Nome e Telefone');
      return;
    }

    if (!signatureDataUrl) {
      toast.error('Por favor, adicione sua assinatura digital');
      return;
    }

    if (!termoAceito) {
      toast.error('Você precisa aceitar o termo de responsabilidade');
      return;
    }

    setLoading(true);

    try {
      // Upload signature to storage
      const signatureBlob = await fetch(signatureDataUrl).then(r => r.blob());

      // Sanitize filename to avoid encoding issues
      const sanitizedName = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9]/g, "_")   // Replace special chars with underscore
        .toLowerCase();

      const fileName = `assinatura_${Date.now()}_${sanitizedName}.png`;

      console.log('Tentando upload de assinatura:', { fileName, size: signatureBlob.size, type: signatureBlob.type });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assinaturas')
        .upload(fileName, signatureBlob, {
          contentType: 'image/png',
          upsert: false // Prevent overwriting just in case
        });

      if (uploadError) {
        console.error('Erro detalhado do upload:', uploadError);
        throw new Error(`Erro no upload da assinatura: ${uploadError.message}`);
      }

      console.log('Upload realizado com sucesso:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('assinaturas')
        .getPublicUrl(fileName);

      // Create client
      // Save data using RPC transaction
      const { error: rpcError } = await supabase.rpc('salvar_ficha_anamnese', {
        p_cliente: {
          nome: nome.trim(),
          data_nascimento: dataNascimento || null,
          cpf: cpf || null,
          telefone: telefone.trim(),
          instagram: instagram || null,
        },
        p_anamnese: {
          respostas: healthAnswers,
          url_assinatura: publicUrl,
          termo_aceito: termoAceito,
          tem_risco: hasRiskCondition(),
        }
      });

      if (rpcError) throw rpcError;

      setSubmitted(true);
      setSubmitted(true);
      toast.success('Ficha de anamnese enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar:', error);
      toast.error(error.message || 'Erro ao enviar a ficha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background">
        <div className="max-w-md md:max-w-lg w-full text-center space-y-6 md:space-y-8 animate-scale-in">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-success" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Ficha Enviada!
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Sua ficha de anamnese foi enviada com sucesso. O tatuador irá revisar suas informações.
          </p>
          {hasRiskCondition() && (
            <div className="p-4 md:p-5 rounded-xl bg-warning/10 border border-warning/30">
              <div className="flex items-center gap-2 justify-center text-warning">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-medium text-base md:text-lg">Atenção</span>
              </div>
              <p className="text-sm md:text-base text-warning/80 mt-2">
                Identificamos algumas condições que precisam ser discutidas com o tatuador antes do procedimento.
              </p>
            </div>
          )}
          <Button
            variant="gold-outline"
            onClick={() => window.location.reload()}
            className="mt-4 min-h-[48px] px-8"
          >
            Preencher Nova Ficha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-lg supports-[backdrop-filter]:bg-background/60">
        <FadeIn direction="down" className="container mx-auto px-4 md:px-8 py-1 md:py-2 lg:py-5">
          {/* Mobile/Tablet: Horizontal Layout | Desktop: Vertical */}
          <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2 md:gap-3 lg:gap-6">

            {/* Logo + Title Group */}
            <div className="flex flex-row lg:flex-col items-center gap-2 lg:gap-4 flex-shrink-0">
              <img
                src="/gold-class-logo.png"
                alt="Gold Class Tattoo"
                className="w-12 md:w-16 lg:w-40 h-auto object-contain drop-shadow-xl animate-fade-in"
              />
              <div className="text-left lg:text-center">
                <h1 className="text-sm md:text-base lg:text-2xl font-display font-bold text-gradient-gold whitespace-nowrap">
                  Ficha de Anamnese
                </h1>
                <p className="text-xs text-muted-foreground hidden lg:block mt-1">
                  Preencha com atenção para sua segurança
                </p>
              </div>
            </div>

            {/* Progress Stepper */}
            <ProgressStepper currentStep={currentStep} className="max-w-xs lg:max-w-2xl w-auto lg:mx-auto" />
          </div>
        </FadeIn>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-2xl md:max-w-4xl relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
          <StaggerContainer staggerDelay={0.2} className="space-y-8 md:space-y-12">
            {/* Personal Information */}
            {/* Personal Information */}
            <FadeIn>
              <FormSection
                ref={personalRef}
                title="Identificação Pessoal"
                subtitle="Preencha seus dados para identificação"
                icon={<User className="w-5 h-5 md:w-6 md:h-6" />}
              >
                <div className="grid gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="nome" className="text-sm md:text-base">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="h-12 md:h-14 text-base md:text-lg focus-glow bg-black/20 border-white/10 placeholder:text-muted-foreground/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="dataNascimento" className="text-sm md:text-base">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="h-12 md:h-14 text-base md:text-lg focus-glow bg-black/20 border-white/10 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="cpf" className="text-sm md:text-base">CPF</Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        inputMode="numeric"
                        className="h-12 md:h-14 text-base md:text-lg focus-glow bg-black/20 border-white/10 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="telefone" className="text-sm md:text-base">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        inputMode="tel"
                        className="h-12 md:h-14 text-base md:text-lg focus-glow bg-black/20 border-white/10 placeholder:text-muted-foreground/50"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="instagram" className="text-sm md:text-base">Instagram</Label>
                      <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@seu_usuario"
                        className="h-12 md:h-14 text-base md:text-lg"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
            </FadeIn>

            {/* Health History */}
            {/* Health History */}
            <FadeIn>
              <FormSection
                ref={healthRef}
                title="Histórico de Saúde"
                subtitle="Responda com sinceridade para sua segurança"
                icon={<Heart className="w-5 h-5 md:w-6 md:h-6" />}
              >
                <div className="space-y-6 md:space-y-8">
                  <HealthQuestion
                    question="Você tem queloides ou histórico de má cicatrização?"
                    fieldName="queloides"
                    value={healthAnswers.queloides.value}
                    details={healthAnswers.queloides.details}
                    isRisk={true}
                    onChange={(v) => updateHealthAnswer('queloides', v)}
                    onDetailsChange={(d) => updateHealthDetails('queloides', d)}
                  />

                  <HealthQuestion
                    question="Possui problemas de pele como Psoríase ou Dermatite?"
                    fieldName="problemasPele"
                    value={healthAnswers.problemasPele.value}
                    details={healthAnswers.problemasPele.details}
                    onChange={(v) => updateHealthAnswer('problemasPele', v)}
                    onDetailsChange={(d) => updateHealthDetails('problemasPele', d)}
                  />

                  <HealthQuestion
                    question="Possui alergias (látex, pigmentos, medicamentos)?"
                    fieldName="alergias"
                    value={healthAnswers.alergias.value}
                    details={healthAnswers.alergias.details}
                    onChange={(v) => updateHealthAnswer('alergias', v)}
                    onDetailsChange={(d) => updateHealthDetails('alergias', d)}
                  />

                  <HealthQuestion
                    question="Usou Roacutan (Isotretinoína) nos últimos 6 meses?"
                    fieldName="roacutan"
                    value={healthAnswers.roacutan.value}
                    details={healthAnswers.roacutan.details}
                    isRisk={true}
                    onChange={(v) => updateHealthAnswer('roacutan', v)}
                    onDetailsChange={(d) => updateHealthDetails('roacutan', d)}
                  />

                  <HealthQuestion
                    question="Tem diabetes, problemas cardíacos ou epilepsia?"
                    fieldName="doencasCronicas"
                    value={healthAnswers.doencasCronicas.value}
                    details={healthAnswers.doencasCronicas.details}
                    onChange={(v) => updateHealthAnswer('doencasCronicas', v)}
                    onDetailsChange={(d) => updateHealthDetails('doencasCronicas', d)}
                  />

                  <HealthQuestion
                    question="Possui doenças infecciosas (Hepatite, HIV)?"
                    fieldName="doencasInfecciosas"
                    value={healthAnswers.doencasInfecciosas.value}
                    details={healthAnswers.doencasInfecciosas.details}
                    isRisk={true}
                    onChange={(v) => updateHealthAnswer('doencasInfecciosas', v)}
                    onDetailsChange={(d) => updateHealthDetails('doencasInfecciosas', d)}
                  />

                  <HealthQuestion
                    question="Está grávida ou amamentando?"
                    fieldName="gravidaAmamentando"
                    value={healthAnswers.gravidaAmamentando.value}
                    details={healthAnswers.gravidaAmamentando.details}
                    onChange={(v) => updateHealthAnswer('gravidaAmamentando', v)}
                    onDetailsChange={(d) => updateHealthDetails('gravidaAmamentando', d)}
                  />
                </div>
              </FormSection>
            </FadeIn>

            {/* Terms and Signature */}
            {/* Terms and Signature */}
            <FadeIn>
              <FormSection
                ref={signatureRef}
                title="Termo de Responsabilidade"
                subtitle="Leia atentamente e assine digitalmente"
                icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
              >
                <div className="space-y-6 md:space-y-8">
                  <ScrollArea className="h-48 md:h-64 rounded-xl border border-border bg-charcoal-dark p-4 md:p-6">
                    <div className="text-sm md:text-base text-muted-foreground space-y-4 pr-4">
                      <p>
                        <strong className="text-foreground text-base md:text-lg">TERMO DE CONSENTIMENTO E RESPONSABILIDADE PARA REALIZAÇÃO DE TATUAGEM</strong>
                      </p>
                      <p>
                        Eu, abaixo assinado, declaro que:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 md:space-y-3">
                        <li>Tenho mais de 18 anos de idade e estou em plena capacidade civil.</li>
                        <li>Fui informado(a) sobre todos os procedimentos que serão realizados.</li>
                        <li>Estou ciente de que a tatuagem é um procedimento permanente que envolve a inserção de pigmentos na pele.</li>
                        <li>Forneci informações verdadeiras sobre meu histórico de saúde.</li>
                        <li>Não estou sob efeito de álcool, drogas ou medicamentos que possam afetar minha decisão.</li>
                        <li>Comprometo-me a seguir todas as instruções de cuidados pós-procedimento.</li>
                        <li>Estou ciente de que podem ocorrer reações alérgicas, infecções ou complicações, mesmo com todos os cuidados adequados.</li>
                        <li>Isento o tatuador de qualquer responsabilidade por reações adversas decorrentes de informações omitidas por mim.</li>
                        <li>Autorizo a realização do procedimento de tatuagem de livre e espontânea vontade.</li>
                      </ol>
                    </div>
                  </ScrollArea>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-charcoal-dark/50 border border-border/30">
                    <Checkbox
                      id="termo"
                      checked={termoAceito}
                      onCheckedChange={(checked) => setTermoAceito(checked === true)}
                      className="w-5 h-5 md:w-6 md:h-6 mt-0.5"
                    />
                    <Label
                      htmlFor="termo"
                      className="text-sm md:text-base leading-relaxed cursor-pointer"
                    >
                      Li, compreendi e aceito os termos acima, declarando que todas as informações prestadas são verdadeiras.
                    </Label>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <Label className="text-base md:text-lg font-medium">Assinatura Digital *</Label>
                    <SignaturePad onSignatureChange={setSignatureDataUrl} />
                  </div>
                </div>
              </FormSection>
            </FadeIn>

            {/* Risk Warning */}
            {hasRiskCondition() && (
              <FadeIn>
                <div className="animate-slide-up p-4 md:p-5 rounded-xl bg-warning/10 border border-warning/30">
                  <div className="flex items-start gap-3 md:gap-4">
                    <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-warning shrink-0" />
                    <div>
                      <h3 className="font-semibold text-warning text-base md:text-lg">Atenção Especial Necessária</h3>
                      <p className="text-sm md:text-base text-warning/80 mt-1">
                        Com base nas suas respostas, identificamos condições que requerem atenção especial.
                        Converse com o tatuador antes de prosseguir com o procedimento.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Submit Button */}
            <FadeIn>
              <Button
                type="submit"
                variant="gold"
                size="xl"
                className="w-full min-h-[56px] md:min-h-[64px] text-base md:text-lg touch-manipulation"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                    Enviar Ficha de Anamnese
                  </>
                )}
              </Button>
            </FadeIn>
          </StaggerContainer>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 md:mt-16">
        <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 text-center">
          <p className="text-sm md:text-base text-muted-foreground">
            Suas informações são confidenciais e protegidas.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AnamneseForm;
