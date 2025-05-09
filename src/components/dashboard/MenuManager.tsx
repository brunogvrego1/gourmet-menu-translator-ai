
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Upload, Camera, Globe, Languages } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { translateText } from '@/services/translationService';

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
  const [fromLanguage, setFromLanguage] = useState('auto');
  const [toLanguages, setToLanguages] = useState<string[]>([]);
  const [translationResults, setTranslationResults] = useState<Record<string, string>>({});
  const [selectedTranslationLang, setSelectedTranslationLang] = useState('');
  const [translating, setTranslating] = useState(false);
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);

  const languages: Record<string, string> = {
    'auto': 'Detectar automaticamente',
    'pt': 'Português',
    'en': 'Inglês',
    'es': 'Espanhol', 
    'fr': 'Francês',
    'it': 'Italiano',
    'de': 'Alemão',
    'ja': 'Japonês',
    'zh': 'Chinês',
    'ru': 'Russo',
    'ar': 'Árabe'
  };

  const toggleLanguage = (lang: string) => {
    if (toLanguages.includes(lang)) {
      setToLanguages(toLanguages.filter(l => l !== lang));
    } else {
      setToLanguages([...toLanguages, lang]);
    }
  };

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

  const handleTranslate = async () => {
    if (!menuContent.trim()) {
      toast.error('Por favor, adicione conteúdo ao cardápio antes de traduzir');
      return;
    }

    if (!toLanguages.length) {
      toast.error('Selecione pelo menos um idioma para traduzir');
      return;
    }

    try {
      setTranslating(true);
      const results = await translateText(menuContent, fromLanguage, toLanguages, selectedMenu || undefined);
      setTranslationResults(results);
      
      if (Object.keys(results).length > 0) {
        setSelectedTranslationLang(Object.keys(results)[0]);
        toast.success(`Tradução concluída para ${Object.keys(results).length} idioma(s)`);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
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
      setTranslationResults({});
      setShowTranslationOptions(false);
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
    setTranslationResults({});
    setShowTranslationOptions(false);
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
        setTranslationResults({});
        setShowTranslationOptions(false);
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

  const handleSaveTranslatedMenu = async () => {
    if (!selectedTranslationLang || Object.keys(translationResults).length === 0) {
      toast.error('Selecione uma tradução para salvar');
      return;
    }

    const translatedContent = translationResults[selectedTranslationLang];
    const languageName = languages[selectedTranslationLang] || selectedTranslationLang;
    
    try {
      setLoading(true);
      
      // Create a new menu with the translated content
      const { error } = await supabase
        .from('menus')
        .insert({
          name: `${menuName} (${languageName})`,
          content: translatedContent,
          user_id: user?.id
        });
      
      if (error) throw error;
      toast.success(`Tradução salva como novo cardápio: ${menuName} (${languageName})`);
      
      // Reset form and refresh menus
      fetchUserMenus();
    } catch (error: any) {
      console.error('Error saving translated menu:', error.message);
      toast.error('Erro ao salvar o cardápio traduzido');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMenuName('');
    setMenuContent('');
    setSelectedMenu(null);
    setShowFileUploader(false);
    setTranslationResults({});
    setToLanguages([]);
    setShowTranslationOptions(false);
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
            
            {menuContent && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTranslationOptions(!showTranslationOptions)}
                  className="flex items-center gap-2"
                >
                  <Globe size={16} />
                  {showTranslationOptions ? 'Esconder opções de tradução' : 'Mostrar opções de tradução'}
                </Button>
                
                {showTranslationOptions && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h3 className="text-md font-medium mb-3 flex items-center">
                      <Languages className="mr-2 h-4 w-4" /> Selecione os idiomas para tradução
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {Object.entries(languages)
                        .filter(([key]) => key !== 'auto')
                        .map(([code, name]) => (
                          <div key={code} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`lang-${code}`} 
                              checked={toLanguages.includes(code)} 
                              onCheckedChange={() => toggleLanguage(code)} 
                            />
                            <Label htmlFor={`lang-${code}`}>{name}</Label>
                          </div>
                        ))}
                    </div>
                    
                    <Button 
                      onClick={handleTranslate} 
                      disabled={translating || toLanguages.length === 0}
                      className="bg-gourmet-purple"
                    >
                      {translating ? 'Traduzindo...' : 'Traduzir agora'}
                    </Button>
                    
                    {Object.keys(translationResults).length > 0 && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="translationLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                            Selecione o idioma da tradução
                          </label>
                          <select
                            id="translationLanguage"
                            value={selectedTranslationLang}
                            onChange={(e) => setSelectedTranslationLang(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {Object.keys(translationResults).map(lang => (
                              <option key={lang} value={lang}>
                                {languages[lang] || lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Conteúdo traduzido
                          </label>
                          <Textarea
                            value={translationResults[selectedTranslationLang] || ''}
                            readOnly
                            className="min-h-[200px]"
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSaveTranslatedMenu} 
                          className="bg-gourmet-purple"
                        >
                          Salvar como novo cardápio
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-3 pt-2">
              <Button 
                onClick={handleSaveMenu} 
                className="bg-gourmet-purple" 
                disabled={loading}
              >
                {loading ? 'Salvando...' : selectedMenu ? 'Atualizar cardápio' : 'Salvar cardápio'}
              </Button>
              
              {(selectedMenu || menuContent) && (
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancelar
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
