
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, MapPin, Clock } from "lucide-react";
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
        
        <div className="max-w-xl mx-auto animate-slide-up">
          <Card className="shadow-lg border-gourmet-soft-purple p-6">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <MessageSquare className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">WhatsApp</h3>
                    <a 
                      href="https://wa.me/5591993714041" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors mt-2"
                    >
                      <MessageSquare size={18} />
                      Fale Conosco
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <MapPin className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Endereço</h3>
                    <p className="text-gray-600 mt-1">Belém, Brasil</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gourmet-soft-purple p-3 rounded-full">
                    <Clock className="text-gourmet-purple h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Horário de Atendimento</h3>
                    <p className="text-gray-600 mt-1">Segunda a Sexta: 9h às 18h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
