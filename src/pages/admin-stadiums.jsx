import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Lista de estados brasileiros
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AdminStadiumsPage() {
  const [stadiums, setStadiums] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    city: '',
    state: '',
    clubId: ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStadiums();
    loadClubs();
  }, []);

  const loadStadiums = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stadium');
      setStadiums(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar estádios:', error);
      toast.error('Erro ao carregar estádios');
    } finally {
      setLoading(false);
    }
  };

  const loadClubs = async () => {
    try {
      const response = await api.get('/club');
      setClubs(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar clubes:', error);
      toast.error('Erro ao carregar clubes');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
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
      toast.error('Nome do estádio é obrigatório');
      return;
    }

    if (!formData.clubId) {
      toast.error('Clube é obrigatório');
      return;
    }

    if (!formData.city.trim()) {
      toast.error('Cidade é obrigatória');
      return;
    }

    if (!formData.state) {
      toast.error('Estado é obrigatório');
      return;
    }

    if (!formData.image && !editingId) {
      toast.error('Imagem do estádio é obrigatória');
      return;
    }

    try {
      setLoading(true);
      
      // Dados a serem enviados
      const dataToSend = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        club_id: formData.clubId, // Note que aqui usamos club_id em vez de clubId para corresponder ao backend
        ...(formData.image && { image: formData.image })
      };

      if (editingId) {
        // Atualizar estádio existente
        await api.put(`/stadium/${editingId}`, dataToSend);
        toast.success('Estádio atualizado com sucesso!');
      } else {
        // Criar novo estádio
        await api.post('/stadium', dataToSend);
        toast.success('Estádio cadastrado com sucesso!');
      }

      // Resetar formulário
      setFormData({ name: '', image: '', city: '', state: '', clubId: '' });
      setPreviewImage('');
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Recarregar a lista de estádios
      await loadStadiums();
    } catch (error) {
      console.error('Erro ao salvar estádio:', error);
      toast.error('Erro ao salvar estádio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stadium) => {
    setFormData({
      name: stadium.name,
      city: stadium.city || '',
      state: stadium.state || '',
      clubId: stadium.club_id?.toString() || '',
      // Não incluímos a imagem aqui para evitar enviar a mesma imagem novamente
      image: '' 
    });
    setPreviewImage(stadium.image);
    setEditingId(stadium.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este estádio?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/stadium/${id}`);
      toast.success('Estádio excluído com sucesso!');
      await loadStadiums();
    } catch (error) {
      console.error('Erro ao excluir estádio:', error);
      toast.error('Erro ao excluir estádio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', image: '', city: '', state: '', clubId: '' });
    setPreviewImage('');
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading && !stadiums.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-xl font-medium">Inicializando a página de administração...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {editingId ? 'Editar Estádio' : 'Cadastrar Novo Estádio'}
      </h1>

      {/* Formulário */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome do Estádio
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite o nome do estádio"
              className="w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                Cidade
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Digite a cidade do estádio"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-2">
                Estado
              </label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange('state', value)}
                required
              >
                <SelectContent>
                  <SelectItem value="" disabled>Selecione um estado</SelectItem>
                  {estadosBrasileiros.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="clubId" className="block text-sm font-medium mb-2">
              Clube
            </label>
            <Select
              value={formData.clubId}
              onValueChange={(value) => handleSelectChange('clubId', value)}
            >
              <SelectContent>
                <SelectItem value="" disabled>Selecione um clube</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="stadiumImage" className="block text-sm font-medium mb-2">
              Imagem do Estádio
            </label>
            <input
              id="stadiumImage"
              name="stadiumImage"
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

      {/* Lista de Estádios */}
      <h2 className="text-2xl font-bold mb-4">Estádios Cadastrados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !stadiums.length ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : stadiums.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum estádio cadastrado ainda.
          </div>
        ) : (
          stadiums.map((stadium) => (
            <div key={stadium.id} className="bg-card rounded-lg shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={stadium.image} 
                  alt={stadium.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x150?text=Erro+na+Imagem';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{stadium.name}</h3>
                <p className="text-sm text-gray-500">
                  {stadium.city} - {stadium.state}
                </p>
                <p className="text-sm text-gray-500">
                  Clube: {clubs.find(c => c.id === stadium.club_id)?.name || 'N/A'}
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(stadium)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(stadium.id)}
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