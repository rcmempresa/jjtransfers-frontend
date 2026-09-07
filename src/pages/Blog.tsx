import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, Clock, ArrowRight, ArrowLeft, Share2, Phone } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  image: string | null;
  author: string;
  readTime: string;
  date: string;
}

// ─── SEO Helper ──────────────────────────────────────────────────────────────

function useSEO({ title, description, image, url }: { title: string; description: string; image?: string; url?: string }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    if (image) setMeta('og:image', image, true);
    if (url) setMeta('og:url', url, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
  }, [title, description, image, url]);
}

// ─── Slug helper ─────────────────────────────────────────────────────────────

export function toSlug(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── BlogList ─────────────────────────────────────────────────────────────────

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');

  useSEO({
    title: 'Blog JJ Transfers Madeira — Guias, Roteiros e Dicas de Viagem',
    description: 'Descubra os melhores roteiros na Madeira, dicas de transfers do aeroporto, passeios privados e tudo o que precisa saber para uma visita inesquecível à Ilha da Madeira.',
    url: 'https://jjtransfers.pt/blog',
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}api/news`)
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todos', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const filtered = category === 'Todos' ? posts : posts.filter(p => p.category === category);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-20">

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-16 px-4 text-center">
        <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Blog & Guias de Viagem</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Tudo sobre a <span className="text-amber-400">Madeira</span> e os Nossos Transfers
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Roteiros, dicas de viagem e tudo o que precisa para aproveitar ao máximo a sua visita à Ilha da Madeira.
        </p>
      </section>

      {/* Filtros */}
      <div className="sticky top-16 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 py-3 px-4">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white border border-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-20">Nenhum artigo publicado ainda.</p>
        ) : (
          <>
            {/* Artigo Destaque */}
            {featured && (
              <Link to={`/blog/${featured.id}/${toSlug(featured.title)}`}
                className="group block mb-12 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-amber-500/40 transition-all hover:-translate-y-1">
                <div className="md:flex">
                  {featured.image && (
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                      <img src={featured.image} alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4">{featured.category}</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{featured.title}</h2>
                      <p className="text-gray-400 text-base leading-relaxed">{featured.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{featured.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featured.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime}</span>
                      <span className="ml-auto flex items-center gap-1 text-amber-400 font-semibold">Ler <ArrowRight className="w-4 h-4" /></span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grelha de artigos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link key={post.id} to={`/blog/${post.id}/${toSlug(post.title)}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/40 hover:-translate-y-1 transition-all flex flex-col">
                  {post.image ? (
                    <div className="h-44 overflow-hidden">
                      <img src={post.image} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-44 bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">🚗</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">{post.category}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <h3 className="text-white font-bold text-base mb-2 group-hover:text-amber-400 transition-colors flex-1">{post.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{post.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Pronto para explorar a Madeira?</h2>
          <p className="text-gray-900/80 mb-6 max-w-xl mx-auto">Reserve o seu transfer privado e chegue a qualquer ponto da ilha com conforto, pontualidade e segurança.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/booking" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-amber-400 font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Reservar Transfer <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="tel:+351966060500" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-gray-900 font-bold rounded-xl hover:bg-white/30 transition-colors">
              <Phone className="w-4 h-4" /> Ligar Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BlogPost (artigo individual) ─────────────────────────────────────────────

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string; slug?: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: post ? `${post.title} | JJ Transfers Madeira` : 'JJ Transfers Madeira — Blog',
    description: post?.summary || 'Dicas de viagem e transfers privados na Madeira.',
    image: post?.image || undefined,
    url: post ? `https://jjtransfers.pt/blog/${post.id}/${toSlug(post.title)}` : undefined,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_BACKEND_URL}api/news/${id}`).then(r => r.json()),
      fetch(`${import.meta.env.VITE_BACKEND_URL}api/news`).then(r => r.json()),
    ]).then(([single, all]) => {
      if (single.success) setPost(single.data);
      if (all.success) setRelated((all.data as BlogPost[]).filter(p => String(p.id) !== id).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [id]);

  // Schema.org structured data
  useEffect(() => {
    if (!post) return;
    const existing = document.getElementById('blog-schema');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-schema';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary,
      image: post.image,
      author: { '@type': 'Person', name: post.author },
      publisher: { '@type': 'Organization', name: 'JJ Transfers Madeira' },
      datePublished: post.date,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://jjtransfers.pt/blog/${post.id}` },
    });
    document.head.appendChild(script);
    return () => { document.getElementById('blog-schema')?.remove(); };
  }, [post]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-gray-950 pt-24 text-center text-white py-20">
      <p className="text-gray-400 mb-4">Artigo não encontrado.</p>
      <Link to="/blog" className="text-amber-400 hover:underline">← Voltar ao Blog</Link>
    </div>
  );

  const paragraphs = post.content.split('\n').filter(l => l.trim());

  return (
    <div className="min-h-screen bg-gray-950 pt-20">

      {/* Hero */}
      {post.image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/blog" className="hover:text-amber-400 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-amber-400">{post.category}</span>
        </nav>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          <span className="flex items-center gap-1 text-gray-500 text-sm"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          <span className="flex items-center gap-1 text-gray-500 text-sm"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
          <span className="flex items-center gap-1 text-gray-500 text-sm"><User className="w-3.5 h-3.5" />{post.author}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

        <p className="text-xl text-gray-300 mb-8 leading-relaxed border-l-4 border-amber-500 pl-4">{post.summary}</p>

        {/* Conteúdo com suporte a markdown básico */}
        <div className="space-y-4">
          {paragraphs.map((para, i) => {
            if (para.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-2">{para.replace('## ', '')}</h2>;
            if (para.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-amber-400 mt-6 mb-2">{para.replace('### ', '')}</h3>;
            if (para.startsWith('- ')) return <li key={i} className="text-gray-300 leading-relaxed ml-6 list-disc">{para.replace('- ', '')}</li>;
            return <p key={i} className="text-gray-300 leading-relaxed">{para}</p>;
          })}
        </div>

        {/* Partilhar + CTA */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Partilhar:</p>
              <div className="flex gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Facebook
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
            <Link to="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-gray-900 font-bold rounded-xl hover:bg-amber-400 transition-colors">
              Reservar Transfer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
        </Link>
      </article>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="bg-gray-900 border-t border-gray-800 py-12 mt-8">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8">Artigos Relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.id}/${toSlug(p.title)}`}
                  className="group bg-gray-950 border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all">
                  {p.image && <div className="h-40 overflow-hidden"><img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                  <div className="p-4">
                    <span className="text-xs text-amber-400 font-semibold">{p.category}</span>
                    <h3 className="text-white font-bold mt-1 group-hover:text-amber-400 transition-colors">{p.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{p.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogList;
