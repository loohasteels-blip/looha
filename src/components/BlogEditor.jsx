'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link2 from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import {
    collection, addDoc, updateDoc, doc,
    query, where, getDocs, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './BlogEditor.css';

const CATEGORIES = ['Steel Industry', 'Construction Tips', 'Market Updates', 'Company News', 'Guides'];

function slugify(str) {
    return str.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function MenuBar({ editor }) {
    if (!editor) return null;

    const addImage = () => {
        const url = prompt('Image URL:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const btn = (action, title, icon, active = false) => (
        <button
            type="button"
            title={title}
            className={`editor-btn ${active ? 'active' : ''}`}
            onClick={action}
        >
            {icon}
        </button>
    );

    return (
        <div className="editor-menubar">
            <div className="editor-btn-group">
                {btn(() => editor.chain().focus().toggleBold().run(), 'Bold', <strong>B</strong>, editor.isActive('bold'))}
                {btn(() => editor.chain().focus().toggleItalic().run(), 'Italic', <em>I</em>, editor.isActive('italic'))}
                {btn(() => editor.chain().focus().toggleUnderline().run(), 'Underline', <u>U</u>, editor.isActive('underline'))}
                {btn(() => editor.chain().focus().toggleStrike().run(), 'Strikethrough', <s>S</s>, editor.isActive('strike'))}
            </div>
            <div className="editor-btn-group">
                {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2', 'H2', editor.isActive('heading', { level: 2 }))}
                {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading 3', 'H3', editor.isActive('heading', { level: 3 }))}
                {btn(() => editor.chain().focus().setParagraph().run(), 'Paragraph', 'P', editor.isActive('paragraph'))}
            </div>
            <div className="editor-btn-group">
                {btn(() => editor.chain().focus().toggleBulletList().run(), 'Bullet List', '• —', editor.isActive('bulletList'))}
                {btn(() => editor.chain().focus().toggleOrderedList().run(), 'Numbered List', '1.', editor.isActive('orderedList'))}
                {btn(() => editor.chain().focus().toggleBlockquote().run(), 'Blockquote', '❝', editor.isActive('blockquote'))}
                {btn(() => editor.chain().focus().toggleCodeBlock().run(), 'Code Block', '</>', editor.isActive('codeBlock'))}
            </div>
            <div className="editor-btn-group">
                {btn(() => editor.chain().focus().setTextAlign('left').run(), 'Align Left', '⬅', editor.isActive({ textAlign: 'left' }))}
                {btn(() => editor.chain().focus().setTextAlign('center').run(), 'Align Center', '↔', editor.isActive({ textAlign: 'center' }))}
                {btn(() => editor.chain().focus().setTextAlign('right').run(), 'Align Right', '➡', editor.isActive({ textAlign: 'right' }))}
            </div>
            <div className="editor-btn-group">
                {btn(setLink, 'Insert Link', '🔗', editor.isActive('link'))}
                {btn(addImage, 'Insert Image URL', '🖼️')}
                {btn(() => editor.chain().focus().setHorizontalRule().run(), 'Horizontal Rule', '—')}
            </div>
            <div className="editor-btn-group">
                {btn(() => editor.chain().focus().undo().run(), 'Undo', '↩')}
                {btn(() => editor.chain().focus().redo().run(), 'Redo', '↪')}
            </div>
        </div>
    );
}

export default function BlogEditor({ editSlug = null }) {
    const { isAdmin } = useAuth();
    const router = useRouter();
    const { slug: paramSlug } = useParams();
    const slug = editSlug || paramSlug;
    const isEdit = !!slug;

    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        category: CATEGORIES[0],
        tags: '',
        readTime: '',
        authorName: 'LOOHA Team',
        status: 'draft',
        coverImage: '',
    });
    const [slugLocked, setSlugLocked] = useState(false);
    const [coverPreview, setCoverPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [docId, setDocId] = useState(null);
    const [loadingPost, setLoadingPost] = useState(isEdit);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Image.configure({ inline: false, allowBase64: true }),
            Link2.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: 'Start writing your article here...' }),
        ],
        content: '',
    });

    // Load existing post for editing
    useEffect(() => {
        if (!isEdit || !editor) return;
        const loadPost = async () => {
            try {
                const q = query(collection(db, 'blog_posts'), where('slug', '==', slug));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    setDocId(snap.docs[0].id);
                    setForm({
                        title: data.title || '',
                        slug: data.slug || '',
                        excerpt: data.excerpt || '',
                        category: data.category || CATEGORIES[0],
                        tags: (data.tags || []).join(', '),
                        readTime: data.readTime || '',
                        authorName: data.authorName || 'LOOHA Team',
                        status: data.status || 'draft',
                        coverImage: data.coverImage || '',
                    });
                    setCoverPreview(data.coverImage || '');
                    setSlugLocked(true);
                    editor.commands.setContent(data.content || '');
                }
            } catch (err) {
                console.error('Failed to load post:', err);
            } finally {
                setLoadingPost(false);
            }
        };
        loadPost();
    }, [isEdit, slug, editor]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugLocked && form.title) {
            setForm(f => ({ ...f, slug: slugify(f.title) }));
        }
    }, [form.title, slugLocked]);

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `blog/covers/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setForm(f => ({ ...f, coverImage: url }));
            setCoverPreview(url);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Image upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (statusOverride = null) => {
        if (!form.title.trim()) { alert('Title is required.'); return; }
        if (!form.slug.trim()) { alert('Slug is required.'); return; }
        setSaving(true);
        setSaveMsg('');
        try {
            const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                excerpt: form.excerpt.trim(),
                category: form.category,
                tags,
                readTime: parseInt(form.readTime) || null,
                authorName: form.authorName,
                coverImage: form.coverImage,
                content: editor.getHTML(),
                status: statusOverride || form.status,
                updatedAt: serverTimestamp(),
            };
            if (!isEdit || !docId) {
                payload.publishedAt = serverTimestamp();
                payload.createdAt = serverTimestamp();
                const ref = await addDoc(collection(db, 'blog_posts'), payload);
                setDocId(ref.id);
                setSlugLocked(true);
                setSaveMsg(payload.status === 'published' ? '✅ Published!' : '💾 Draft saved!');
                if (payload.status === 'published') {
                    setTimeout(() => router.push(`/blog/${payload.slug}`), 1200);
                }
            } else {
                if (statusOverride === 'published') payload.publishedAt = serverTimestamp();
                await updateDoc(doc(db, 'blog_posts', docId), payload);
                setSaveMsg(payload.status === 'published' ? '✅ Published!' : '💾 Draft updated!');
            }
            setForm(f => ({ ...f, status: payload.status }));
        } catch (err) {
            console.error('Save failed:', err);
            setSaveMsg('❌ Save failed. Check console.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 3000);
        }
    };

    if (!isAdmin) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Access Denied</h2>
                <p className="text-light mt-1">Admin access required to write articles.</p>
                <Link href="/" className="btn btn-primary mt-2">Go Home</Link>
            </div>
        );
    }

    if (loadingPost) {
        return (
            <div className="blogpost-loading">
                <div className="blog-spinner" />
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <div className="blog-editor-page animate-fade-in">
            <div className="blog-editor-header">
                <div className="container blog-editor-header-inner">
                    <div>
                        <Link href="/admin" className="blog-editor-back">← Admin Panel</Link>
                        <h1 className="blog-editor-heading">{isEdit ? '✏️ Edit Article' : '✍️ New Article'}</h1>
                    </div>
                    <div className="blog-editor-actions">
                        {saveMsg && <span className="blog-save-msg">{saveMsg}</span>}
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                        >
                            {saving ? '...' : '💾 Save Draft'}
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSave('published')}
                            disabled={saving}
                        >
                            {saving ? 'Publishing...' : '🚀 Publish'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container blog-editor-layout">
                {/* Main Editor */}
                <div className="blog-editor-main">
                    <div className="blog-editor-card">
                        <input
                            id="blog-title"
                            className="blog-title-input"
                            type="text"
                            placeholder="Article Title..."
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <textarea
                            id="blog-excerpt"
                            className="blog-excerpt-input"
                            placeholder="Short excerpt / meta description (1-2 sentences)..."
                            rows={2}
                            value={form.excerpt}
                            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                        />
                    </div>

                    <div className="blog-editor-card editor-wrap">
                        <MenuBar editor={editor} />
                        <EditorContent editor={editor} className="editor-content-area" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="blog-editor-sidebar">
                    {/* Publish Box */}
                    <div className="blog-editor-sidebar-card">
                        <h3 className="sidebar-section-title">🚀 Publish</h3>
                        <div className="input-group">
                            <label>Status</label>
                            <select
                                className="select"
                                value={form.status}
                                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            >
                                <option value="draft">📝 Draft</option>
                                <option value="published">✅ Published</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Author Name</label>
                            <input
                                className="input"
                                value={form.authorName}
                                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                            />
                        </div>
                        <div className="input-group">
                            <label>Read Time (minutes)</label>
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={form.readTime}
                                onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => handleSave('draft')}
                                disabled={saving}
                            >
                                💾 Draft
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => handleSave('published')}
                                disabled={saving}
                            >
                                🚀 Publish
                            </button>
                        </div>
                        {saveMsg && <div className="blog-save-msg mt-2" style={{ textAlign: 'center' }}>{saveMsg}</div>}
                    </div>

                    {/* SEO / Meta */}
                    <div className="blog-editor-sidebar-card">
                        <h3 className="sidebar-section-title">🔍 SEO & Meta</h3>
                        <div className="input-group">
                            <label>URL Slug</label>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input
                                    className="input"
                                    style={{ flex: 1, fontSize: '0.8rem' }}
                                    value={form.slug}
                                    onChange={e => { setSlugLocked(true); setForm(f => ({ ...f, slug: slugify(e.target.value) })); }}
                                    placeholder="url-friendly-slug"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    title="Regenerate from title"
                                    onClick={() => { setSlugLocked(false); setForm(f => ({ ...f, slug: slugify(f.title) })); }}
                                >🔄</button>
                            </div>
                            <small style={{ color: 'var(--color-text-light)', fontSize: '0.72rem' }}>
                                looha.in/blog/{form.slug || 'url-slug'}
                            </small>
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <select
                                className="select"
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Tags (comma separated)</label>
                            <input
                                className="input"
                                value={form.tags}
                                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                placeholder="steel, TMT bars, Nellore"
                            />
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="blog-editor-sidebar-card">
                        <h3 className="sidebar-section-title">🖼️ Cover Image</h3>
                        {coverPreview && (
                            <div className="cover-preview-wrap">
                                <img src={coverPreview} alt="Cover" className="cover-preview-img" />
                                <button
                                    className="cover-remove-btn"
                                    onClick={() => { setForm(f => ({ ...f, coverImage: '' })); setCoverPreview(''); }}
                                    title="Remove image"
                                >✕</button>
                            </div>
                        )}
                        <div className="input-group">
                            <label>Upload Image</label>
                            <label className="cover-upload-label" htmlFor="cover-upload">
                                {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                                <input
                                    id="cover-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleCoverUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div className="input-group">
                            <label>Or paste image URL</label>
                            <input
                                className="input"
                                placeholder="https://..."
                                value={form.coverImage}
                                onChange={e => { setForm(f => ({ ...f, coverImage: e.target.value })); setCoverPreview(e.target.value); }}
                            />
                        </div>
                    </div>

                    {/* Preview Link */}
                    {form.slug && (
                        <div className="blog-editor-sidebar-card" style={{ textAlign: 'center' }}>
                            <a
                                href={`/blog/${form.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline btn-sm"
                                style={{ width: '100%' }}
                            >
                                👁️ Preview Article
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
