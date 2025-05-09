
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CreditCard, BarChart2, Loader2 } from 'lucide-react';
import ExtraCreditsPurchase from './ExtraCreditsPurchase';
import { useLocation } from 'react-router-dom';

interface UserCreditInfo {
  id: string;
  total_credits: number;
  used_credits: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

const UserCredits = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [creditInfo, setCreditInfo] = useState<UserCreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCreditInfo();
    }
  }, [user]);

  // Verify payment if session_id is in the URL
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const searchParams = new URLSearchParams(location.search);
      const paymentStatus = searchParams.get('payment');
      const sessionId = searchParams.get('session_id');
      
      if (paymentStatus === 'success' && sessionId && user) {
        await verifyPayment(sessionId);
      }
    };

    checkPaymentStatus();
  }, [location, user]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setVerifyingPayment(true);
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Refresh credit info after successful payment
        fetchCreditInfo();
        toast.success(data.message);
      } else if (data.status === 'already_processed') {
        toast.info(data.message);
      } else {
        toast.warning(data.message || "Pagamento pendente ou não completado");
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(`Erro ao verificar pagamento: ${error.message}`);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const fetchCreditInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No credits found, initialize credits for the user
          await initializeCredits();
          return;
        }
        throw error;
      }
      
      setCreditInfo(data);
    } catch (error: any) {
      console.error('Error fetching credit info:', error.message);
      toast.error('Erro ao carregar informações de créditos');
    } finally {
      setLoading(false);
    }
  };

  const initializeCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('credits')
        .insert({
          user_id: user?.id,
          total_credits: 2, // Free tier starts with 2 credits as per new plan
          used_credits: 0,
          tier: 'free'
        })
        .select()
        .single();

      if (error) throw error;
      setCreditInfo(data);
    } catch (error: any) {
      console.error('Error initializing credits:', error.message);
      toast.error('Erro ao inicializar créditos');
    }
  };

  const formatTier = (tier: string): string => {
    const tiers: { [key: string]: string } = {
      'free': 'Gratuito',
      'premium': 'Premium',
      'business': 'Empresarial'
    };
    
    return tiers[tier] || tier;
  };

  const getAvailableCredits = (): number => {
    if (!creditInfo) return 0;
    return Math.max(0, creditInfo.total_credits - creditInfo.used_credits);
  };

  const getUsagePercentage = (): number => {
    if (!creditInfo || creditInfo.total_credits === 0) return 0;
    const percentage = (creditInfo.used_credits / creditInfo.total_credits) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const handleBuyCreditsClick = () => {
    // Scroll to the ExtraCreditsPurchase component
    const purchaseElement = document.getElementById('extra-credits-purchase');
    if (purchaseElement) {
      purchaseElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-semibold mb-4">Seus créditos</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gourmet-purple border-t-transparent"></div>
          </div>
        ) : creditInfo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <div className="text-gourmet-purple font-bold text-3xl mb-2">{getAvailableCredits()}</div>
                <div className="text-gray-600">Créditos disponíveis</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <div className="text-gourmet-purple font-bold text-3xl mb-2">{creditInfo.used_credits}</div>
                <div className="text-gray-600">Créditos utilizados</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <div className="text-gourmet-purple font-bold text-3xl mb-2">{formatTier(creditInfo.tier)}</div>
                <div className="text-gray-600">Seu plano atual</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Uso de créditos: {creditInfo.used_credits} de {creditInfo.total_credits}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gourmet-purple h-2.5 rounded-full" 
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                className="bg-gourmet-purple space-x-2"
                onClick={handleBuyCreditsClick}
                disabled={verifyingPayment}
              >
                {verifyingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>
                  {verifyingPayment ? 'Verificando pagamento...' : 'Comprar mais créditos'}
                </span>
              </Button>
              
              <Button variant="outline" className="space-x-2">
                <BarChart2 className="h-4 w-4" />
                <span>Ver histórico de uso</span>
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Conta criada em: {new Date(creditInfo.created_at).toLocaleDateString('pt-BR')}</p>
              <p>Última atualização: {new Date(creditInfo.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 py-4">Erro ao carregar informações de créditos.</p>
        )}
      </div>
      
      {/* Add the ExtraCreditsPurchase component with ID for scrolling */}
      {creditInfo && creditInfo.tier !== 'free' && (
        <div id="extra-credits-purchase">
          <ExtraCreditsPurchase />
        </div>
      )}
    </div>
  );
};

export default UserCredits;
