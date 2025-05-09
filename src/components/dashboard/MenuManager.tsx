
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import FileUploader from '../menu-translator/FileUploader';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Menu {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

const MenuManager = () => {
  const { user } = useAuth();
  const [menuName, setMenuName] = useState('');
  const [menuContent, setMenuContent] = useState('');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showFileUploader, setShowFileUploader] = useState(false);

  React.useEffect(() => {
    if (user) {
      fetchUserMenus();
    }
  }, [user]);

  const fetchUserMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenus(data || []);
    } catch (error: any) {
      console.error('Error fetching menus:', error.message);
      toast.error('Erro ao carregar seus cardápios');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!menuName.trim() || !menuContent.trim()) {
      toast.error('Por favor, preencha o nome e o conteúdo do cardápio');
      return;
    }

    try {
      setLoading(true);
      
      // If we have a selectedMenu, update it; otherwise create a new one
      if (selectedMenu) {
        const { error } = await supabase
          .from('menus')
          .update({
            name: menuName,
            content: menuContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedMenu);
        
        if (error) throw error;
        toast.success('Cardápio atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('menus')
          .insert({
            name: menuName,
            content: menuContent,
            user_id: user?.id
          });
        
        if (error) throw error;
        toast.success('Cardápio salvo com sucesso!');
      }
      
      // Reset form and refresh menus
      setMenuName('');
      setMenuContent('');
      setSelectedMenu(null);
      fetchUserMenus();
    } catch (error: any) {
      console.error('Error saving menu:', error.message);
      toast.error('Erro ao salvar o cardápio');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuName(menu.name);
    setMenuContent(menu.content);
    setSelectedMenu(menu.id);
    setShowFileUploader(false);
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cardápio?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Cardápio excluído com sucesso!');
      fetchUserMenus();

      // If we were editing the deleted menu, reset the form
      if (selectedMenu === id) {
        setMenuName('');
        setMenuContent('');
        setSelectedMenu(null);
      }
    } catch (error: any) {
      console.error('Error deleting menu:', error.message);
      toast.error('Erro ao excluir o cardápio');
    } finally {
      setLoading(false);
    }
  };

  const handleFileProcessed = (text: string) => {
    setMenuContent(text);
    setShowFileUploader(false);
  };

  const handleCameraCapture = async () => {
    try {
      // Check if the browser supports the camera API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Seu navegador não suporta acesso à câmera');
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video and canvas elements
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      // Set up video stream
      video.srcObject = stream;
      video.play();
      
      // Take a picture after a short delay
      setTimeout(() => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          
          // Stop all video tracks to turn off the camera
          stream.getTracks().forEach(track => track.stop());
          
          // Convert the canvas to a data URL
          const imageDataUrl = canvas.toDataURL('image/jpeg');
          
          // Process the image with OCR (you would need to implement this)
          processImageWithOCR(imageDataUrl);
        }
      }, 1000);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Erro ao acessar a câmera');
    }
  };

  const processImageWithOCR = async (imageDataUrl: string) => {
    // This is a placeholder for actual OCR processing
    // You would typically send this image to an OCR service or process it locally
    
    // For now, we're just showing a toast message
    toast.info('Processando imagem...');
    
    // In a real implementation, you would wait for OCR results and then:
    // setMenuContent(ocrResult);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {selectedMenu ? 'Editar cardápio' : 'Criar novo cardápio'}
        </h2>
        
        {showFileUploader ? (
          <div className="mb-4">
            <FileUploader onFileProcessed={handleFileProcessed} />
            <Button 
              variant="outline" 
              onClick={() => setShowFileUploader(false)} 
              className="mt-4"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do cardápio
              </label>
              <Input
                id="menuName"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Ex: Menu de Verão, Cardápio de Vinhos..."
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="menuContent" className="block text-sm font-medium text-gray-700">
                  Conteúdo do cardápio
                </label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFileUploader(true)}
                    className="flex items-center space-x-1"
                  >
                    <Upload size={16} />
                    <span>Upload</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCameraCapture}
                    className="flex items-center space-x-1"
                  >
                    <Camera size={16} />
                    <span>Câmera</span>
                  </Button>
                </div>
              </div>
              <Textarea
                id="menuContent"
                value={menuContent}
                onChange={(e) => setMenuContent(e.target.value)}
                placeholder="Digite o conteúdo do seu cardápio aqui..."
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveMenu} 
                className="bg-gourmet-purple" 
                disabled={loading}
              >
                {loading ? 'Salvando...' : selectedMenu ? 'Atualizar cardápio' : 'Salvar cardápio'}
              </Button>
              
              {selectedMenu && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMenuName('');
                    setMenuContent('');
                    setSelectedMenu(null);
                  }}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Seus cardápios salvos</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gourmet-purple border-t-transparent"></div>
          </div>
        ) : menus.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Data de criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell className="text-sm text-gray-500 line-clamp-2">{menu.content}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(menu.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditMenu(menu)}
                        className="p-1 h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="p-1 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {menus.length === 0 && (
              <TableCaption>Você ainda não tem cardápios salvos.</TableCaption>
            )}
          </Table>
        ) : (
          <p className="text-gray-500 py-4">Você ainda não tem cardápios salvos.</p>
        )}
      </div>
    </div>
  );
};

export default MenuManager;
