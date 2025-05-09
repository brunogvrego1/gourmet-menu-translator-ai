import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, BadgeDollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface CreditPackage {
  amount: number;
  price: number;
  pricePerCredit: number;
  discount: string;
}

const ExtraCreditsPurchase = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const creditPackages: CreditPackage[] = [
    { amount: 1, price: 4.90, pricePerCredit: 4.90, discount: '-' },
    { amount: 3, price: 13.90, pricePerCredit: 4.63, discount: '5% off' },
    { amount: 5, price: 21.90, pricePerCredit: 4.38, discount: '10% off' },
    { amount: 10, price: 39.90, pricePerCredit: 3.99, discount: '18% off' },
    { amount: 25, price: 89.90, pricePerCredit: 3.59, discount: '26% off' }
  ];
  
  const handlePurchase = async (amount: number, price: number, packageIndex: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar créditos.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(packageIndex);
      setErrorMessage(null);
      
      // Call our Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          credits: amount,
          price: price * 100, // Convert to cents for Stripe
          userId: user.id,
          productName: `${amount} crédito${amount > 1 ? 's' : ''} extra${amount > 1 ? 's' : ''}`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível iniciar o checkout");
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setErrorMessage(error.message || "Erro ao processar o pagamento. Tente novamente.");
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível iniciar o processo de pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };
  
  // Check for success or canceled payment from URL parameters
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Pagamento aprovado!",
        description: "Seus créditos foram adicionados à sua conta.",
      });
      // Remove query parameters from URL
      navigate('/seu-cardapio', { replace: true });
    } else if (paymentStatus === 'canceled') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive"
      });
      // Remove query parameters from URL
      navigate('/seu-cardapio', { replace: true });
    }
  }, [toast, navigate]);
  
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Compra de Créditos Extras</h2>
      <p className="text-sm text-gray-500 mb-4">
        Disponível apenas para usuários que já possuem um plano. Adicione mais créditos conforme sua necessidade.
      </p>
      
      {errorMessage && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Créditos Extras</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Preço por Crédito</TableHead>
            <TableHead>Vantagem</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditPackages.map((pkg, index) => (
            <TableRow key={pkg.amount}>
              <TableCell className="font-medium">{pkg.amount} crédito{pkg.amount > 1 ? 's' : ''}</TableCell>
              <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
              <TableCell>R$ {pkg.pricePerCredit.toFixed(2)}</TableCell>
              <TableCell>{pkg.discount}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handlePurchase(pkg.amount, pkg.price, index)}
                  size="sm"
                  className="bg-gourmet-purple hover:bg-gourmet-dark-purple flex items-center gap-1"
                  disabled={loading !== null}
                >
                  {loading === index ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{loading === index ? 'Processando...' : 'Comprar'}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-500">
        <p className="flex items-center gap-1">
          <BadgeDollarSign className="h-4 w-4 text-gourmet-purple" />
          <span>Cada tradução para um idioma consome 1 crédito.</span>
        </p>
      </div>
    </div>
  );
};

export default ExtraCreditsPurchase;
