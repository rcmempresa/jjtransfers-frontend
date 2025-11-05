import React from 'react';
import { Calendar, User } from 'lucide-react';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'As Melhores Rotas para Transfers do Aeroporto de Lisboa',
      excerpt: 'Descubra as rotas mais eficientes e cénicas para as suas viagens de/para o aeroporto.',
      image: 'https://images.pexels.com/photos/2226476/pexels-photo-2226476.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      author: 'J&J Team',
      date: '15 Mar 2024',
      category: 'Transfers'
    },
    {
      id: 2,
      title: 'Protocolo de Etiqueta para Transporte Executivo',
      excerpt: 'Guia completo sobre as melhores práticas para reuniões de negócios em movimento.',
      image: 'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      author: 'Maria Silva',
      date: '12 Mar 2024',
      category: 'Business'
    },
    {
      id: 3,
      title: 'Destinos Imperdíveis para Tours Privados em Portugal',
      excerpt: 'Explore os locais mais espetaculares de Portugal com os nossos tours personalizados.',
      image: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      author: 'João Santos',
      date: '08 Mar 2024',
      category: 'Tours'
    },
    {
      id: 4,
      title: 'Planeamento Perfeito para Transporte de Casamentos',
      excerpt: 'Tudo o que precisa saber para organizar o transporte do seu dia especial.',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      author: 'Ana Costa',
      date: '05 Mar 2024',
      category: 'Weddings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dicas, novidades e insights sobre transporte de luxo e viagens
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-gold text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-gold transition-colors">
                  <a href="#" className="block">
                    {post.title}
                  </a>
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div className="text-center mt-16 p-8 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Mais Conteúdo em Breve
          </h3>
          <p className="text-gray-600">
            Estamos constantemente a adicionar novo conteúdo ao nosso blog. 
            Mantenha-se atualizado com as últimas tendências em transporte de luxo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;