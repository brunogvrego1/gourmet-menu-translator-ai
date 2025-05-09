
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

type FileUploaderProps = {
  onFileProcessed: (text: string) => void;
};

const FileUploader = ({ onFileProcessed }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Check file type
      if (file.type.includes('image')) {
        // For images, we'd need OCR - for now just show a message
        toast.info('Processando imagem. Isso pode levar um momento.');
        // Here you would integrate with an OCR service
        // For now, let's just simulate with a placeholder
        setTimeout(() => {
          onFileProcessed("Menu Exemplo\n\nEntradas\nSalada Caesar - $12\nSopa do dia - $8\n\nPratos Principais\nFilé Mignon - $35\nSalmão Grelhado - $28");
          setIsLoading(false);
          toast.success('Imagem processada! Edite o texto se necessário antes de traduzir.');
        }, 2000);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'd need PDF text extraction
        toast.info('Extraindo texto do PDF...');
        // Simulated for now
        setTimeout(() => {
          onFileProcessed("Menu PDF Exemplo\n\nEntradas\nBruschetta - €10\nCarpaccio - €14\n\nPratos Principais\nRisotto ai Funghi - €22\nPasta Carbonara - €18");
          setIsLoading(false);
          toast.success('PDF processado! Edite o texto se necessário antes de traduzir.');
        }, 2000);
      } else {
        // For text files
        const text = await file.text();
        onFileProcessed(text);
        toast.success('Arquivo carregado com sucesso!');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            accept="image/jpeg,image/png,application/pdf,text/plain"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button disabled={isLoading} className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
            {isLoading ? 'Processando...' : 'Selecionar arquivo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
