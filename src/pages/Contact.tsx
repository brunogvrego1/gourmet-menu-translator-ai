
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 px-6 md:px-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4 text-gradient">Entre em Contato</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos à disposição para esclarecer suas dúvidas e ajudar com suas necessidades
            de tradução gourmet.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16 animate-slide-up">
          <Card className="shadow-lg border-gourmet-soft-purple p-2">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <Mail className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Email</h3>
                    <p className="text-gray-600 mt-1">contato@tradutorgourmet.com</p>
                    <p className="text-gray-600">suporte@tradutorgourmet.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <Phone className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Telefone</h3>
                    <p className="text-gray-600 mt-1">+55 (11) 9999-9999</p>
                    <p className="text-gray-600">+55 (11) 8888-8888</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <MapPin className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Endereço</h3>
                    <p className="text-gray-600 mt-1">Av. Paulista, 1000</p>
                    <p className="text-gray-600">São Paulo, SP - CEP 01310-000</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <Globe className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Horário de Atendimento</h3>
                    <p className="text-gray-600 mt-1">Segunda a Sexta: 9h às 18h</p>
                    <p className="text-gray-600">Sábado: 9h às 13h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col space-y-8">
            <Card className="shadow-lg border-gourmet-soft-purple p-6 h-full flex flex-col justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-serif font-medium mb-6 text-gradient">Sobre Nosso Serviço</h2>
                <p className="text-gray-600 mb-4">
                  O Tradutor Gourmet é especializado em oferecer traduções precisas e culturalmente adaptadas 
                  para cardápios e materiais gastronômicos.
                </p>
                <p className="text-gray-600">
                  Nossa equipe de especialistas combina conhecimento linguístico e gastronômico para 
                  entregar traduções que preservam a essência e o sabor de cada prato.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
