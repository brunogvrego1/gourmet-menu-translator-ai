
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload logic here
    console.log('File dropped:', e.dataTransfer.files);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload logic here
      console.log('File selected:', e.target.files[0]);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Traduza seu cardápio agora
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Carregue uma imagem ou PDF do cardápio que deseja traduzir. 
            Nosso sistema inteligente fará o resto.
          </p>
        </div>
        
        <Card className="border-dashed border-2 border-gourmet-soft-purple hover:border-gourmet-purple transition-colors">
          <CardContent className="p-0">
            <div 
              className={`flex flex-col items-center justify-center h-64 p-6 cursor-pointer ${
                dragActive ? 'bg-gourmet-soft-purple/50' : 'bg-transparent'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="w-16 h-16 bg-gourmet-soft-purple rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-lg font-medium mb-2">
                Arraste e solte seu arquivo aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou clique para selecionar (JPG, PNG, PDF)
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
                Selecionar arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-md border border-gourmet-soft-purple">
              <span className="font-medium mr-2">De:</span>
              <select className="bg-transparent outline-none">
                <option value="auto">Detectar automaticamente</option>
                <option value="en">Inglês</option>
                <option value="fr">Francês</option>
                <option value="it">Italiano</option>
                <option value="es">Espanhol</option>
              </select>
            </div>
            
            <div className="flex items-center bg-white px-4 py-2 rounded-md border border-gourmet-soft-purple">
              <span className="font-medium mr-2">Para:</span>
              <select className="bg-transparent outline-none">
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
                <option value="fr">Francês</option>
                <option value="it">Italiano</option>
                <option value="es">Espanhol</option>
              </select>
            </div>
          </div>
          
          <Button size="lg" className="w-full max-w-xs mx-auto mt-6 bg-gourmet-purple hover:bg-gourmet-dark-purple">
            Traduzir agora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
