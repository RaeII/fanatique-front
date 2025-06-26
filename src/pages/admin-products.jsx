import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value_real: '',
    value_tokefan: '',
    establishment: '',
    image: ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
    loadEstablishments();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/product');
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadEstablishments = async () => {
    try {
      const response = await api.get('/establishment');
      setEstablishments(response.data.content || []);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      toast.error('Erro ao carregar estabelecimentos');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEstablishmentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      establishment: value
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
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.value_real.trim()) {
      toast.error('Valor em reais é obrigatório');
      return;
    }

    if (!formData.value_tokefan.trim()) {
      toast.error('Valor em tokefan é obrigatório');
      return;
    }

    if (!formData.establishment) {
      toast.error('Estabelecimento é obrigatório');
      return;
    }

    if (!formData.image && !editingId) {
      toast.error('Imagem do produto é obrigatória');
      return;
    }

    try {
      setLoading(true);
      
      // Dados a serem enviados
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        value_real: formData.value_real,
        value_tokefan: formData.value_tokefan,
        establishment: Number(formData.establishment),
        ...(formData.image && { image: formData.image })
      };

      if (editingId) {
        // Atualizar produto existente
        await api.put(`/product/${editingId}`, dataToSend);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await api.post('/product', dataToSend);
        toast.success('Produto cadastrado com sucesso!');
      }

      // Resetar formulário
      setFormData({ name: '', description: '', value_real: '', value_tokefan: '', establishment: '', image: '' });
      setPreviewImage('');
      setEditingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Recarregar a lista de produtos
      await loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      value_real: product.value_real,
      value_tokefan: product.value_tokefan,
      establishment: String(product.establishment),
      // Não incluímos a imagem aqui para evitar enviar a mesma imagem novamente
      image: '' 
    });
    setPreviewImage(product.image);
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/product/${id}`);
      toast.success('Produto excluído com sucesso!');
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', value_real: '', value_tokefan: '', establishment: '', image: '' });
    setPreviewImage('');
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Encontra o nome do estabelecimento pelo ID
  const getEstablishmentName = (establishmentId) => {
    const establishment = establishments.find(est => est.id === establishmentId);
    return establishment ? establishment.name : 'Desconhecido';
  };

  if (loading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-xl font-medium">Inicializando a página de administração de produtos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </h1>

      {/* Formulário */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome do Produto
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite o nome do produto"
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição do Produto
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Digite a descrição do produto"
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="value_real" className="block text-sm font-medium mb-2">
                Valor em Reais (R$)
              </label>
              <Input
                id="value_real"
                name="value_real"
                type="text"
                value={formData.value_real}
                onChange={handleChange}
                placeholder="Ex: 10.50"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="value_tokefan" className="block text-sm font-medium mb-2">
                Valor em Tokefan
              </label>
              <Input
                id="value_tokefan"
                name="value_tokefan"
                type="text"
                value={formData.value_tokefan}
                onChange={handleChange}
                placeholder="Ex: 5.00"
                className="w-full"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="establishment" className="block text-sm font-medium mb-2">
              Estabelecimento
            </label>
            <Select value={formData.establishment} onValueChange={handleEstablishmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o estabelecimento" />
              </SelectTrigger>
              <SelectContent>
                {establishments.map((establishment) => (
                  <SelectItem key={establishment.id} value={String(establishment.id)}>
                    {establishment.name} - {establishment.segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="productImage" className="block text-sm font-medium mb-2">
              Imagem do Produto
            </label>
            <input
              id="productImage"
              name="productImage"
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

      {/* Lista de Produtos */}
      <h2 className="text-2xl font-bold mb-4">Produtos Cadastrados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !products.length ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-card rounded-lg shadow overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x150?text=Erro+na+Imagem';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Estabelecimento: {getEstablishmentName(product.establishment)}</p>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Valor: R$ {product.value_real}</p>
                    <p className="text-sm font-medium">Tokefan: {product.value_tokefan}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(product.id)}
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