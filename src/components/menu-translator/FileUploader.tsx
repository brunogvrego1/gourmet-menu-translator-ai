
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import { Loader, LogIn, X, FileImage } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

type FileUploaderProps = {
  onFileProcessed: (text: string) => void;
  multiple?: boolean;
};

const FileUploader = ({ onFileProcessed, multiple = false }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useAuth();

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
      if (multiple) {
        handleMultipleFiles(Array.from(files));
      } else {
        await processFile(files[0]);
      }
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (multiple && e.target.files.length > 0) {
        handleMultipleFiles(Array.from(e.target.files));
      } else if (e.target.files[0]) {
        await processFile(e.target.files[0]);
      }
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    // Filter only acceptable files
    const acceptableFiles = files.filter(file => 
      file.type.includes('image') || 
      file.type === 'application/pdf' || 
      file.type === 'text/plain'
    );
    
    if (acceptableFiles.length === 0) {
      toast.error('Nenhum arquivo válido selecionado. Use apenas JPG, PNG, PDF ou TXT.');
      return;
    }
    
    setSelectedFiles(prevFiles => [...prevFiles, ...acceptableFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const processAllFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    let combinedText = '';
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProcessingStage(`Processando arquivo ${i+1} de ${selectedFiles.length}: ${file.name}`);
        
        let text = '';
        if (file.type.includes('image')) {
          text = await extractTextFromImage(file);
        } else if (file.type === 'application/pdf') {
          // Simulate PDF extraction for now
          text = `Menu PDF Exemplo (${file.name})\n\nEntradas\nBruschetta - €10\nCarpaccio - €14\n\nPratos Principais\nRisotto ai Funghi - €22\nPasta Carbonara - €18`;
        } else {
          // Text files
          text = await file.text();
        }
        
        combinedText += (combinedText ? '\n\n---\n\n' : '') + `[Arquivo: ${file.name}]\n` + text;
        setProgress(((i+1) / selectedFiles.length) * 100);
      }
      
      onFileProcessed(combinedText);
      toast.success(`${selectedFiles.length} arquivo(s) processado(s) com sucesso!`);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Erro ao processar arquivos. Tente novamente.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      if (file.type.includes('image')) {
        // Use Tesseract.js for OCR on images
        toast.info('Processando imagem. Isso pode levar um momento.');
        const text = await extractTextFromImage(file);
        onFileProcessed(text);
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

  const extractTextFromImage = async (file: File): Promise<string> => {
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
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();
      
      toast.success('Texto extraído com sucesso!');
      return result.data.text;
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Erro ao extrair texto da imagem. Tente novamente.');
      throw error;
    }
  };

  const captureMultiplePhotos = async () => {
    try {
      // Check if the browser supports the camera API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Seu navegador não suporta acesso à câmera');
        return;
      }

      // Create video element for camera stream
      const videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve();
        };
      });

      // Show camera modal
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
      modal.style.zIndex = '9999';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      
      const previewVideo = document.createElement('video');
      previewVideo.style.maxWidth = '90%';
      previewVideo.style.maxHeight = '70%';
      previewVideo.style.border = '2px solid white';
      previewVideo.srcObject = stream;
      previewVideo.autoplay = true;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.marginTop = '20px';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '10px';
      
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Capturar Foto';
      captureButton.style.padding = '10px 20px';
      captureButton.style.backgroundColor = '#8b5cf6';
      captureButton.style.color = 'white';
      captureButton.style.border = 'none';
      captureButton.style.borderRadius = '5px';
      captureButton.style.cursor = 'pointer';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Fechar';
      closeButton.style.padding = '10px 20px';
      closeButton.style.backgroundColor = '#ef4444';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '5px';
      closeButton.style.cursor = 'pointer';
      
      const thumbsContainer = document.createElement('div');
      thumbsContainer.style.display = 'flex';
      thumbsContainer.style.flexWrap = 'wrap';
      thumbsContainer.style.gap = '10px';
      thumbsContainer.style.marginTop = '20px';
      thumbsContainer.style.maxWidth = '90%';
      thumbsContainer.style.overflowY = 'auto';
      thumbsContainer.style.maxHeight = '100px';
      
      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(closeButton);
      
      modal.appendChild(previewVideo);
      modal.appendChild(buttonContainer);
      modal.appendChild(thumbsContainer);
      
      document.body.appendChild(modal);

      // Canvas for capturing photos
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      
      const capturedImages: File[] = [];

      // Handle capture button
      captureButton.onclick = () => {
        if (ctx) {
          ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
              capturedImages.push(file);
              
              // Add thumbnail
              const thumb = document.createElement('div');
              thumb.style.position = 'relative';
              thumb.style.width = '60px';
              thumb.style.height = '60px';
              
              const img = document.createElement('img');
              img.src = URL.createObjectURL(blob);
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'cover';
              
              thumb.appendChild(img);
              thumbsContainer.appendChild(thumb);
              
              toast.success('Foto capturada!');
            }
          }, 'image/jpeg', 0.8);
        }
      };

      // Handle close button
      closeButton.onclick = () => {
        // Stop camera and close modal
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
        document.body.removeChild(videoElement);
        
        // Process captured photos
        if (capturedImages.length > 0) {
          setSelectedFiles(prevFiles => [...prevFiles, ...capturedImages]);
          toast.success(`${capturedImages.length} foto(s) adicionada(s)`);
        }
      };
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Erro ao acessar a câmera');
    }
  };

  // If no user is logged in, show login wall
  if (!user) {
    return (
      <Card className="border-dashed border-2 border-gourmet-soft-purple hover:border-gourmet-purple transition-colors">
        <CardContent className="flex flex-col items-center justify-center h-64 p-6">
          <div className="w-16 h-16 bg-gourmet-soft-purple rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-gourmet-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Login necessário</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Você precisa estar logado para carregar e traduzir cardápios.
          </p>
          <Link to="/auth">
            <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
              Fazer login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-gourmet-soft-purple hover:border-gourmet-purple transition-colors">
      <CardContent className="p-0">
        {selectedFiles.length > 0 ? (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Arquivos selecionados ({selectedFiles.length})</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center">
                    <FileImage className="mr-2 h-5 w-5 text-gourmet-purple" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
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
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={processAllFiles}
                  className="bg-gourmet-purple hover:bg-gourmet-dark-purple"
                >
                  Processar {selectedFiles.length} arquivo(s)
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      document.getElementById('multiple-file-upload')?.click();
                    }}
                  >
                    Adicionar mais arquivos
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={captureMultiplePhotos}
                  >
                    Capturar mais fotos
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => setSelectedFiles([])}
                >
                  Limpar seleção
                </Button>
                
                <input
                  id="multiple-file-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf,text/plain"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div 
            className={`flex flex-col items-center justify-center h-64 p-6 cursor-pointer ${
              dragActive ? 'bg-gourmet-soft-purple/50' : 'bg-transparent'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              const inputId = multiple ? 'multiple-file-upload' : 'file-upload';
              document.getElementById(inputId)?.click();
            }}
          >
            <div className="w-16 h-16 bg-gourmet-soft-purple rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-lg font-medium mb-2">
              {multiple ? 'Arraste e solte múltiplos arquivos aqui' : 'Arraste e solte seu arquivo aqui'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou clique para selecionar (JPG, PNG, PDF)
            </p>
            <input
              id={multiple ? "multiple-file-upload" : "file-upload"}
              type="file"
              multiple={multiple}
              accept="image/jpeg,image/png,application/pdf,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col space-y-2">
              <Button className="bg-gourmet-purple hover:bg-gourmet-dark-purple">
                {multiple ? 'Selecionar arquivos' : 'Selecionar arquivo'}
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  captureMultiplePhotos();
                }}
              >
                Capturar com a câmera
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
