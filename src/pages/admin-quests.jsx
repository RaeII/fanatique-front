import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState([]);
  const [questTypes, setQuestTypes] = useState([]);
  const [questScopes, setQuestScopes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    point_value: '',
    type: '',
    scope: '',
    image: ''
  });
  
  const [previewImage, setPreviewImage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadQuests();
    loadQuestTypes();
    loadQuestScopes();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quest');
      setQuests(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar quests:', error);
      toast.error('Erro ao carregar quests');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestTypes = async () => {
    try {
      const response = await api.get('/quest/types/all');

      setQuestTypes(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de quest:', error);
      toast.error('Erro ao carregar tipos de quest');
    }
  };

  const loadQuestScopes = async () => {
    try {
      const response = await api.get('/quest/scopes/all');

      setQuestScopes(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar escopos de quest:', error);
      toast.error('Erro ao carregar escopos de quest');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value
    }));
  };

  const handleScopeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      scope: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar o tipo do arquivo
    if (!file.type.includes('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Verificar o tamanho do arquivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      // Converter a imagem para base64
      const base64 = await convertImageToBase64(file);
      setFormData((prev) => ({
        ...prev,
        image: base64
      }));
      setPreviewImage(base64);
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      toast.error('Erro ao processar a imagem');
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome da quest é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição da quest é obrigatória');
      return;
    }

    if (!formData.point_value.trim()) {
      toast.error('Valor em pontos é obrigatório');
      return;
    }

    if (!formData.type) {
      toast.error('Tipo da quest é obrigatório');
      return;
    }

    if (!formData.scope) {
      toast.error('Escopo da quest é obrigatório');
      return;
    }

    if (!formData.image && !editingId) {
      toast.error('Imagem da quest é obrigatória');
      return;
    }

    try {
      setLoading(true);
      
      // Dados a serem enviados
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        point_value: Number(formData.point_value),
        type: Number(formData.type),
        scope: Number(formData.scope),
        ...(formData.image && { image: formData.image })
      };

      if (editingId) {
        // Atualizar quest existente
        await api.put(`/quest/${editingId}`, dataToSend);
        toast.success('Quest atualizada com sucesso!');
      } else {
        // Criar nova quest
        await api.post('/quest', dataToSend);
        toast.success('Quest cadastrada com sucesso!');
      }

      // Resetar formulário
      setFormData({ name: '', description: '', point_value: '', type: '', scope: '', image: '' });
      setPreviewImage('');
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Recarregar a lista de quests
      await loadQuests();
    } catch (error) {
      console.error('Erro ao salvar quest:', error);
      toast.error('Erro ao salvar quest');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quest) => {
    setFormData({
      name: quest.name,
      description: quest.description || '',
      point_value: String(quest.point_value),
      type: String(quest.type),
      scope: String(quest.scope),
      // Não incluímos a imagem aqui para evitar enviar a mesma imagem novamente
      image: '' 
    });
    setPreviewImage(quest.image);
    setEditingId(quest.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta quest?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/quest/${id}`);
      toast.success('Quest excluída com sucesso!');
      await loadQuests();
    } catch (error) {
      console.error('Erro ao excluir quest:', error);
      toast.error('Erro ao excluir quest');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', point_value: '', type: '', scope: '', image: '' });
    setPreviewImage('');
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Encontra o nome do tipo pelo ID
  const getTypeName = (typeId) => {
    const type = questTypes.find(t => t.id === typeId);
    return type ? type.name : 'Desconhecido';
  };

  // Encontra o nome do escopo pelo ID
  const getScopeName = (scopeId) => {
    const scope = questScopes.find(s => s.id === scopeId);
    return scope ? scope.name : 'Desconhecido';
  };

  if (loading && !quests.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-xl font-medium">Inicializando a página de administração de quests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {editingId ? 'Editar Quest' : 'Cadastrar Nova Quest'}
      </h1>

      {/* Formulário */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome da Quest
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite o nome da quest"
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição da Quest
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Digite a descrição da quest"
              className="w-full min-h-[100px]"
              required
            />
          </div>

          <div>
            <label htmlFor="point_value" className="block text-sm font-medium mb-2">
              Valor em Pontos
            </label>
            <Input
              id="point_value"
              name="point_value"
              type="number"
              min="1"
              value={formData.point_value}
              onChange={handleChange}
              placeholder="Ex: 100"
              className="w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-2">
                Tipo da Quest
              </label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {questTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="scope" className="block text-sm font-medium mb-2">
                Escopo da Quest
              </label>
              <Select value={formData.scope} onValueChange={handleScopeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o escopo" />
                </SelectTrigger>
                <SelectContent>
                  {questScopes.map((scope) => (
                    <SelectItem key={scope.id} value={String(scope.id)}>
                      {scope.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="questImage" className="block text-sm font-medium mb-2">
              Imagem da Quest
            </label>
            <input
              id="questImage"
              name="questImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 
                file:text-sm file:font-semibold 
                file:bg-primary file:text-primary-foreground 
                hover:file:bg-primary/90 
                cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formato: JPG, PNG. Tamanho máximo: 5MB
            </p>
          </div>

          {previewImage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Pré-visualização:</p>
              <div className="w-full h-48 relative rounded-lg overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Pré-visualização" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            {editingId && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                <span>{editingId ? 'Atualizar' : 'Cadastrar'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Lista de Quests */}
      <h2 className="text-2xl font-bold mb-4">Quests Cadastradas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !quests.length ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : quests.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhuma quest cadastrada ainda.
          </div>
        ) : (
          quests.map((quest) => (
            <div key={quest.id} className="bg-card rounded-lg shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={quest.image} 
                  alt={quest.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x150?text=Erro+na+Imagem';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{quest.name}</h3>
                {quest.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{quest.description}</p>
                )}
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Tipo: {quest.typeName || getTypeName(quest.type)}</p>
                  <p className="text-sm text-gray-500">Escopo: {quest.scopeName || getScopeName(quest.scope)}</p>
                  <p className="text-sm font-medium mt-1">Pontos: {quest.point_value}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(quest)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(quest.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 