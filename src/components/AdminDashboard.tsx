import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  PenTool,
  LogOut,
  Search,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  LayoutDashboard,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FadeIn, StaggerContainer } from '@/components/ui/Transitions';
import { maskCPF } from '@/lib/security';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  instagram: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  created_at: string;
}

interface Anamnese {
  id: string;
  cliente_id: string;
  respostas: unknown;
  url_assinatura: string | null;
  termo_aceito: boolean;
  tem_risco: boolean;
  created_at: string;
  clientes: Cliente;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnamnese, setSelectedAnamnese] = useState<Anamnese | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [loadingSignature, setLoadingSignature] = useState(false);
  const [showFullCPF, setShowFullCPF] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportPassword, setExportPassword] = useState('');

  useEffect(() => {
    fetchAnamneses();
  }, []);

  // Fetch signed URL for signature when dialog opens
  useEffect(() => {
    const loadSignature = async () => {
      if (!selectedAnamnese?.url_assinatura) {
        setSignatureUrl(null);
        return;
      }

      setLoadingSignature(true);
      try {
        // Extract filename from public URL
        const urlParts = selectedAnamnese.url_assinatura.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Create signed URL (valid for 1 hour)
        const { data, error } = await supabase.storage
          .from('assinaturas')
          .createSignedUrl(fileName, 3600);

        if (error) throw error;
        setSignatureUrl(data.signedUrl);
      } catch (error) {
        console.error('Error loading signature:', error);
        toast.error('Erro ao carregar assinatura');
        setSignatureUrl(null);
      } finally {
        setLoadingSignature(false);
      }
    };

    loadSignature();
  }, [selectedAnamnese]);

  const fetchAnamneses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anamneses')
        .select(`
          *,
          clientes (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnamneses(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching:', error);
      }
      toast.error('Erro ao carregar fichas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado');
    navigate('/login');
  };

  const handleExport = () => {
    if (anamneses.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    // Show password dialog
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    if (!exportPassword || exportPassword.length < 6) {
      toast.error('Digite uma senha de pelo menos 6 caracteres');
      return;
    }

    // Define CSV headers (Semicolon separated for Excel BR)
    const headers = [
      'Nome',
      'CPF',
      'Telefone',
      'Data de Nascimento',
      'Instagram',
      'Status de Risco',
      'Data Cadastro'
    ];

    // Convert data to CSV format
    const csvContent = anamneses.map(item => {
      const cliente = item.clientes;
      return [
        `"${cliente.nome || ''}"`,
        `"${cliente.cpf || ''}"`,
        `"${cliente.telefone || ''}"`,
        `"${cliente.data_nascimento ? format(new Date(cliente.data_nascimento), 'dd/MM/yyyy') : ''}"`,
        `"${cliente.instagram || ''}"`,
        `"${item.tem_risco ? 'Com Risco' : 'Sem Risco'}"`,
        `"${format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}"`
      ].join(';'); // Using semicolon for Excel compatibility
    });

    // Combine headers and contents
    const csvString = [headers.join(';'), ...csvContent].join('\n');

    // Create download trigger with BOM for UTF-8 (Fix characters in Excel)
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contatos_clientes_${format(new Date(), 'dd-MM-yyyy')}_PROTEGIDO.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close dialog and show success message
    setShowExportDialog(false);
    setExportPassword('');
    toast.success(`CSV exportado! Use a senha para proteger o arquivo: "${exportPassword}"`);
  };

  const filteredAnamneses = anamneses.filter(a =>
    a.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.clientes.telefone.includes(searchTerm)
  );

  const healthQuestionLabels: Record<string, string> = {
    queloides: 'Queloides ou má cicatrização',
    problemasPele: 'Problemas de pele',
    alergias: 'Alergias',
    roacutan: 'Uso de Roacutan',
    doencasCronicas: 'Doenças crônicas',
    doencasInfecciosas: 'Doenças infecciosas',
    gravidaAmamentando: 'Gravidez/Amamentação',
  };

  const riskQuestions = ['queloides', 'roacutan', 'doencasInfecciosas'];

  // Stats
  const totalFichas = anamneses.length;
  const comRisco = anamneses.filter(a => a.tem_risco).length;
  const semRisco = anamneses.filter(a => !a.tem_risco).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <PenTool className="w-5 h-5 text-gold" />
              </div>
              <h1 className="text-xl font-display font-semibold text-white tracking-wide">
                Painel Admin
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hidden md:flex border-gold/20 text-gold hover:bg-gold/10 hover:text-gold"
                disabled={anamneses.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <StaggerContainer>
          {/* Search Bar - Full Width refined */}
          <FadeIn direction="down" className="mb-8 md:mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 bg-[#141414] border-white/5 focus:border-gold/30 text-white rounded-xl placeholder:text-muted-foreground/50"
              />
            </div>
          </FadeIn>

          {/* Stats Cards - Premium Logic */}
          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Total Card */}
            <div className="bg-[#141414] rounded-xl p-5 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#1f1f1f] flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-gold" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block leading-none mb-1">{totalFichas}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total de Fichas</span>
              </div>
            </div>

            {/* Risk Card */}
            <div className="bg-[#141414] rounded-xl p-5 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#2a1f0a] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block leading-none mb-1">{comRisco}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Com Risco</span>
              </div>
            </div>

            {/* Safe Card */}
            <div className="bg-[#141414] rounded-xl p-5 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#0a2a1a] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block leading-none mb-1">{semRisco}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Sem Risco</span>
              </div>
            </div>
          </FadeIn>

          {/* List Header */}
          <FadeIn className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-gold" />
              Fichas Recentes
            </h2>
            <Badge variant="outline" className="border-white/10 text-muted-foreground">
              {filteredAnamneses.length} resultados
            </Badge>
          </FadeIn>

          {/* List Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filteredAnamneses.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-xl border border-white/5">
              <User className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha cadastrada ainda'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnamneses.map((anamnese) => (
                <FadeIn key={anamnese.id}>
                  <button
                    onClick={() => setSelectedAnamnese(anamnese)}
                    className="w-full text-left bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 hover:border-gold/30 rounded-xl p-5 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Status Indicator Line */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${anamnese.tem_risco ? 'bg-warning' : 'bg-success'
                      }`} />

                    <div className="flex items-start justify-between mb-4 pl-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${anamnese.tem_risco ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                        }`}>
                        {anamnese.tem_risco ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`bg-transparent border ${anamnese.tem_risco
                          ? 'border-warning/30 text-warning'
                          : 'border-success/30 text-success'
                          }`}
                      >
                        {anamnese.tem_risco ? 'Atenção' : 'Aprovado'}
                      </Badge>
                    </div>

                    <div className="pl-3">
                      <h3 className="font-semibold text-white text-lg group-hover:text-gold transition-colors truncate">
                        {anamnese.clientes.nome}
                      </h3>
                      <div className="flex flex-col gap-2 mt-3">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {anamnese.clientes.telefone}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(anamnese.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          )}
        </StaggerContainer>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnamnese} onOpenChange={() => setSelectedAnamnese(null)}>
        <DialogContent className="w-[95vw] md:w-full md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-[#141414] border-white/10 text-white p-0 gap-0">
          <DialogHeader className="p-6 pb-2 bg-[#1a1a1a] shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAnamnese?.tem_risco ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                }`}>
                {selectedAnamnese?.tem_risco ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-lg">{selectedAnamnese?.clientes.nome}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ID: {selectedAnamnese?.id.slice(0, 8)}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-dark" data-lenis-prevent>
            <div className="h-full">
              <div className="p-6 space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-lg border border-white/5">
                    <div>
                      <span className="text-muted-foreground block mb-1">Telefone</span>
                      <p className="font-medium text-white">{selectedAnamnese?.clientes.telefone}</p>
                    </div>
                    {selectedAnamnese?.clientes.cpf && (
                      <div>
                        <span className="text-muted-foreground block mb-1">CPF</span>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {showFullCPF ? selectedAnamnese.clientes.cpf : maskCPF(selectedAnamnese.clientes.cpf)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowFullCPF(!showFullCPF)}
                            className="text-xs text-primary hover:text-primary/80 underline"
                          >
                            {showFullCPF ? 'Ocultar' : 'Revelar'}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedAnamnese?.clientes.data_nascimento && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Nascimento</span>
                        <p className="font-medium text-white">
                          {format(new Date(selectedAnamnese.clientes.data_nascimento), "dd/MM/yyyy")}
                        </p>
                      </div>
                    )}
                    {selectedAnamnese?.clientes.instagram && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Instagram</span>
                        <p className="font-medium text-gold">
                          {selectedAnamnese.clientes.instagram}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Answers */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    Histórico de Saúde
                  </h3>
                  <div className="space-y-3">
                    {selectedAnamnese && Object.entries(selectedAnamnese.respostas as Record<string, { value: boolean | null; details: string }>).map(([key, answer]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-lg transition-colors ${answer.value === true && riskQuestions.includes(key)
                          ? 'bg-warning/10 border border-warning/30'
                          : 'bg-white/5 border border-white/5'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            {healthQuestionLabels[key] || key}
                          </span>
                          <Badge
                            variant="secondary"
                            className={answer.value ? 'bg-white/10 text-white' : 'bg-black/40 text-muted-foreground'}
                          >
                            {answer.value === true ? 'Sim' : answer.value === false ? 'Não' : '-'}
                          </Badge>
                        </div>
                        {answer.details && (
                          <div className="mt-2 text-sm text-white/80 bg-black/20 p-2 rounded border-l-2 border-gold pl-3">
                            {answer.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signature */}
                {selectedAnamnese?.url_assinatura && (
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                      <PenTool className="w-4 h-4" />
                      Assinatura Digital
                    </h3>
                    <div className="bg-white rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-white/20 min-h-[120px]">
                      {loadingSignature ? (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : signatureUrl ? (
                        <img
                          src={signatureUrl}
                          alt="Assinatura"
                          className="max-h-24"
                          onError={() => {
                            toast.error('Erro ao carregar imagem da assinatura');
                            setSignatureUrl(null);
                          }}
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Assinatura não disponível</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 text-center text-xs text-muted-foreground">
                  Ficha enviada em {selectedAnamnese && format(new Date(selectedAnamnese.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Password Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="w-[95vw] md:w-full md:max-w-md bg-[#141414] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg">Proteger Exportação CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Para proteger os dados sensíveis (CPF, telefone), defina uma senha para o arquivo CSV exportado.
            </p>
            <div className="space-y-2">
              <Label htmlFor="export-password">Senha de Proteção</Label>
              <Input
                id="export-password"
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-black/20 border-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmExport();
                }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExportDialog(false);
                  setExportPassword('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="gold"
                onClick={confirmExport}
                className="flex-1"
              >
                Exportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper icon
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default AdminDashboard;
