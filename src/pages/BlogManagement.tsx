import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, Upload, Eye, EyeOff } from 'lucide-react';

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

interface Props {
  authHeaders: Record<string, string>;
  base: string;
}

// ─── Image Uploader ───────────────────────────────────────────────────────────

const ImageUploader: React.FC<{
  current: string;
  onUploaded: (url: string) => void;
  authHeaders: Record<string, string>;
  base: string;
}> = ({ current, onUploaded, authHeaders, base }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${base}api/upload`, {
        method: 'POST',
        headers: { Authorization: authHeaders['Authorization'] },
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
        toast.success('Imagem carregada!');
      } else {
        toast.error('Erro ao carregar imagem.');
      }
    } catch {
      toast.error('Erro ao carregar imagem.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {current && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-800">
          <img src={current} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onUploaded('')}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button type="button" onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50">
        <Upload className="w-4 h-4" />
        {uploading ? 'A carregar...' : current ? 'Trocar imagem' : 'Adicionar imagem'}
      </button>
    </div>
  );
};

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm = () => ({
  title: '',
  summary: '',
  content: '',
  category: 'Geral',
  image: '',
  author: 'JJ Transfers',
  readTime: '5 min',
});

// ─── BlogManagement ───────────────────────────────────────────────────────────

const BlogManagement: React.FC<Props> = ({ authHeaders, base }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}api/admin/blog`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      toast.error('Erro ao carregar artigos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setPreview(false);
    setModal('create');
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category || 'Guias',
      image: post.image || '',
      author: post.author || 'JJ Transfers',
      readTime: post.readTime || '5 min',
    });
    setEditingId(post.id);
    setPreview(false);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error('Título, resumo e conteúdo são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const url = modal === 'edit' && editingId
        ? `${base}api/admin/blog/${editingId}`
        : `${base}api/admin/blog`;
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          category: form.category,
          image: form.image || null,
          author: form.author,
          readTime: form.readTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(modal === 'edit' ? 'Artigo atualizado!' : 'Artigo criado!');
        closeModal();
        load();
      } else {
        toast.error(data.message || 'Erro ao guardar.');
      }
    } catch {
      toast.error('Erro ao guardar artigo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${base}api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Artigo eliminado.');
        setDeleteConfirm(null);
        load();
      } else {
        toast.error(data.message || 'Erro ao eliminar.');
      }
    } catch {
      toast.error('Erro ao eliminar artigo.');
    }
  };

  const set = (field: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const CATEGORIES = ['Geral', 'Dicas de Viagem', 'Segurança', 'Viagens de Negócios', 'Promoções'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão do Blog</h2>
          <p className="text-gray-400 text-sm mt-1">{posts.length} artigo{posts.length !== 1 ? 's' : ''} publicado{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" /> Novo Artigo
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-3">Nenhum artigo publicado ainda.</p>
          <button onClick={openCreate}
            className="text-amber-400 hover:text-amber-300 text-sm font-semibold">
            Criar o primeiro artigo →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
              {post.image ? (
                <img src={post.image} alt={post.title}
                  className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                  📝
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                  <span className="text-xs text-gray-600">{post.date}</span>
                </div>
                <h3 className="text-white font-semibold text-sm truncate">{post.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{post.summary}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(post)}
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(post.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Eliminar artigo?</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação é irreversível.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm font-semibold">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors text-sm font-semibold">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-bold text-lg">
                {modal === 'create' ? 'Novo Artigo' : 'Editar Artigo'}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${preview ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {preview ? 'Editor' : 'Preview'}
                </button>
                <button onClick={closeModal}
                  className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {preview ? (
              /* Preview Panel */
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {form.image && <img src={form.image} alt="preview" className="w-full h-56 object-cover rounded-xl" />}
                  <span className="inline-block bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">{form.category}</span>
                  <h1 className="text-2xl font-bold text-white">{form.title || 'Título do artigo'}</h1>
                  <p className="text-lg text-gray-300 border-l-4 border-amber-500 pl-4">{form.summary || 'Resumo do artigo...'}</p>
                  <div className="space-y-3 text-gray-300">
                    {(form.content || '').split('\n').filter(l => l.trim()).map((para, i) => {
                      if (para.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-6">{para.replace('## ', '')}</h2>;
                      if (para.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-amber-400 mt-4">{para.replace('### ', '')}</h3>;
                      if (para.startsWith('- ')) return <li key={i} className="ml-5 list-disc">{para.replace('- ', '')}</li>;
                      return <p key={i}>{para}</p>;
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Editor Panel */
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Title */}
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Título *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Título do artigo — escreve um título SEO-friendly" />
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Resumo (meta description) *</label>
                  <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Breve descrição do artigo (max. 160 caracteres para SEO ideal)" />
                  <p className="text-xs text-gray-600 mt-1">{form.summary.length}/160</p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                    Conteúdo * <span className="text-gray-600 normal-case font-normal">(suporta ## Título, ### Subtítulo, - Lista)</span>
                  </label>
                  <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={14}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500 resize-y font-mono"
                    placeholder={`## Introdução\n\nEscreve o conteúdo do artigo aqui...\n\n### Subsecção\n\n- Item da lista\n- Outro item`} />
                </div>

                {/* Row: category + readTime + author */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Categoria</label>
                    <select value={form.category} onChange={e => set('category', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Tempo de leitura</label>
                    <input value={form.readTime} onChange={e => set('readTime', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="5 min" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Autor</label>
                    <input value={form.author} onChange={e => set('author', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="JJ Transfers" />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Imagem de capa</label>
                  <ImageUploader
                    current={form.image}
                    onUploaded={url => set('image', url)}
                    authHeaders={authHeaders}
                    base={base}
                  />
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
              <button onClick={closeModal}
                className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm font-semibold">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-xl transition-colors text-sm font-bold disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'A guardar...' : modal === 'edit' ? 'Guardar alterações' : 'Publicar artigo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
