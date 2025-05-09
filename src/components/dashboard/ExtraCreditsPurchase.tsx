
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, BadgeDollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CreditPackage {
  amount: number;
  price: number;
  pricePerCredit: number;
  discount: string;
}

const ExtraCreditsPurchase = () => {
  const { toast } = useToast();
  
  const creditPackages: CreditPackage[] = [
    { amount: 1, price: 4.90, pricePerCredit: 4.90, discount: '-' },
    { amount: 3, price: 13.90, pricePerCredit: 4.63, discount: '5% off' },
    { amount: 5, price: 21.90, pricePerCredit: 4.38, discount: '10% off' },
    { amount: 10, price: 39.90, pricePerCredit: 3.99, discount: '18% off' },
    { amount: 25, price: 89.90, pricePerCredit: 3.59, discount: '26% off' }
  ];
  
  const handlePurchase = (amount: number, price: number) => {
    // In a real implementation, this would initiate a payment flow
    toast({
      title: "Compra de créditos",
      description: `Você selecionou ${amount} créditos por R$ ${price.toFixed(2)}. Em breve implementaremos o pagamento.`
    });
  };
  
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Compra de Créditos Extras</h2>
      <p className="text-sm text-gray-500 mb-4">
        Disponível apenas para usuários que já possuem um plano. Adicione mais créditos conforme sua necessidade.
      </p>
      
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
          {creditPackages.map((pkg) => (
            <TableRow key={pkg.amount}>
              <TableCell className="font-medium">{pkg.amount} crédito{pkg.amount > 1 ? 's' : ''}</TableCell>
              <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
              <TableCell>R$ {pkg.pricePerCredit.toFixed(2)}</TableCell>
              <TableCell>{pkg.discount}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handlePurchase(pkg.amount, pkg.price)}
                  size="sm"
                  className="bg-gourmet-purple hover:bg-gourmet-dark-purple flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Comprar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-500">
        <p className="flex items-center gap-1">
          <BadgeDollarSign className="h-4 w-4 text-gourmet-purple" />
          <span>Cada tradução para um idioma consome 10 créditos.</span>
        </p>
      </div>
    </div>
  );
};

export default ExtraCreditsPurchase;
