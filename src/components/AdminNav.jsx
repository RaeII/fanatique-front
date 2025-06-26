import { Link } from 'react-router-dom';

export const AdminNav = () => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <Link 
      to="/admin/clubes" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg text-sm"
    >
      Admin Clubes
    </Link>
    <Link 
      to="/admin/estadios" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg text-sm"
    >
      Admin Estádios
    </Link>
    <Link 
      to="/admin/estabelecimentos" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg text-sm"
    >
      Admin Estabelecimentos
    </Link>
    <Link 
      to="/admin/produtos" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg text-sm"
    >
      Admin Produtos
    </Link>
    <Link 
      to="/admin/quests" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg text-sm"
    >
      Admin Quests
    </Link>
  </div>
); 