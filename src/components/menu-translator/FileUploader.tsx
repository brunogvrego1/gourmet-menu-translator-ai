
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader } from 'lucide-react';

type FileUploaderProps = {
  onFileProcessed: (text: string) => void;
};

const FileUploader = ({ onFileProcessed }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

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
    setProgress(0);
    
    try {
      if (file.type.includes('image')) {
        // Use Tesseract.js for OCR on images
        toast.info('Processando imagem. Isso pode levar um momento.');
        await extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we still use the simulated approach (would need a PDF extraction library)
        setProcessingStage('Extraindo texto do PDF');
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo. Tente novamente.');
      setIsLoading(false);
    }
  };

  const extractTextFromImage = async (file: File) => {
    try {
      const worker = await createWorker({
        logger: progress => {
          setProgress(Math.round(progress.progress * 100));
          setProcessingStage(progress.status);
        }
      });
      
      // Load language data - both Portuguese and English
      await worker.loadLanguage('por+eng');
      await worker.initialize('por+eng');
      
      // Convert the file to a format Tesseract can use
      const imageUrl = URL.createObjectURL(file);
      
      // Recognize text
      const result = await worker.recognize(imageUrl);
      console.log('OCR Result:', result);
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
      
      // Pass the extracted text to the parent component
      onFileProcessed(result.data.text);
      
      toast.success('Texto extraído com sucesso! Edite se necessário antes de traduzir.');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Erro ao extrair texto da imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProcessingStage('');
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="w-12 h-12 text-gourmet-purple animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium">{processingStage}</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-gourmet-purple rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{progress}%</p>
              </div>
            </div>
          ) : (
            <>
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
              <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
                Selecionar arquivo
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
