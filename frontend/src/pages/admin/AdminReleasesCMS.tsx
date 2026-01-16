/**
 * ADMIN RELEASE NOTES (CMS) PAGE
 * Route: /admin/cms/releases
 * DB: cms_pages table (with content as JSON)
 * UI: Rich text editor + version control + publish
 * 
 * Security: RLS ensures only admins can manage CMS
 */

import { useState } from 'react';
import { supabase } from '../../services/supabase-production';

type ReleaseNote = {
  id: string;
  page_type: 'release_notes' | 'features' | 'announcements' | 'maintenance';
  title: string;
  slug: string;
  content: string; // JSON content for structured data
  status: 'draft' | 'published' | 'archived';
  version: string;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ContentSection = {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'code';
  content: string;
  level?: number; // for heading
};

export default function AdminReleasesCMS() {
  const [releases, setReleases] = useState<ReleaseNote[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseNote | null>(null);
  const [editorMode, setEditorMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [newRelease, setNewRelease] = useState({
    title: '',
    slug: '',
    version: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    content: JSON.stringify([
      { type: 'paragraph', content: '' }
    ]),
    page_type: 'release_notes'
  });

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*, created_by:profiles(name, email)')
        .eq('page_type', 'release_notes')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReleases(data as ReleaseNote[] || []);

    } catch (err) {
      console.error('Error loading releases:', err);
      alert('Failed to load release notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login to save release notes');
        return;
      }

      const { error } = await supabase
        .from('cms_pages')
        .upsert({
          ...newRelease,
          created_by: user.user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Release note saved successfully!');
      setEditorMode(false);
      loadReleases();

    } catch (err) {
      console.error('Error saving release:', err);
      alert('Failed to save release note');
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this release note?')) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      alert('Release note published successfully!');
      loadReleases();

    } catch (err) {
      console.error('Error publishing release:', err);
      alert('Failed to publish release note');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this release note?')) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      alert('Release note archived successfully!');
      loadReleases();

    } catch (err) {
      console.error('Error archiving release:', err);
      alert('Failed to archive release note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release note? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Release note deleted successfully!');
      if (selectedRelease?.id === id) {
        setSelectedRelease(null);
      }
      loadReleases();

    } catch (err) {
      console.error('Error deleting release:', err);
      alert('Failed to delete release note');
    }
  };

  const handleEdit = (release: ReleaseNote) => {
    setSelectedRelease(release);
    setNewRelease({
      title: release.title,
      slug: release.slug,
      version: release.version,
      status: release.status,
      content: release.content,
      page_type: release.page_type
    });
    setEditorMode(true);
  };

  const handlePreview = (release: ReleaseNote) => {
    setSelectedRelease(release);
    setShowPreview(true);
  };

  const addContentSection = (type: ContentSection['type']) => {
    try {
      const currentContent: ContentSection[] = JSON.parse(newRelease.content);
      
      const newSection: ContentSection = {
        type,
        content: '',
      };

      if (type === 'heading') {
        newSection.level = (currentContent.filter(s => s.type === 'heading').length % 3) + 1) + 1;
      }

      setNewRelease({
        ...newRelease,
        content: JSON.stringify([...currentContent, newSection])
      });

    } catch (err) {
      console.error('Error adding content section:', err);
      alert('Failed to add content section');
    }
  };

  const updateContentSection = (index: number, content: string) => {
    try {
      const currentContent: ContentSection[] = JSON.parse(newRelease.content);
      currentContent[index].content = content;
      
      setNewRelease({
        ...newRelease,
        content: JSON.stringify(currentContent)
      });

    } catch (err) {
      console.error('Error updating content section:', err);
    }
  };

  const deleteContentSection = (index: number) => {
    try {
      const currentContent: ContentSection[] = JSON.parse(newRelease.content);
      currentContent.splice(index, 1);
      
      setNewRelease({
        ...newRelease,
        content: JSON.stringify(currentContent)
      });

    } catch (err) {
      console.error('Error deleting content section:', err);
    }
  };

  const moveContentSection = (index: number, direction: 'up' | 'down') => {
    try {
      const currentContent: ContentSection[] = JSON.parse(newRelease.content);
      
      if (direction === 'up' && index > 0) {
        [currentContent[index], currentContent[index - 1]] = [currentContent[index - 1], currentContent[index]];
      } else if (direction === 'down' && index < currentContent.length - 1) {
        [currentContent[index], currentContent[index + 1]] = [currentContent[index + 1], currentContent[index]];
      }
      
      setNewRelease({
        ...newRelease,
        content: JSON.stringify(currentContent)
      });

    } catch (err) {
      console.error('Error moving content section:', err);
    }
  };

  const renderContentSection = (section: ContentSection, index: number, readonly: boolean = false) => {
    switch (section.type) {
      case 'heading':
        const Tag = `h${section.level || 2}`;
        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold">H{section.level || 2}</div>
              {!readonly && (
                <>
                  <button onClick={() => moveContentSection(index, 'up')} className="text-gray-400 hover:text-gray-600">↑</button>
                  <button onClick={() => moveContentSection(index, 'down')} className="text-gray-400 hover:text-gray-600">↓</button>
                  <button onClick={() => deleteContentSection(index)} className="text-red-400 hover:text-red-600">✕</button>
                </>
              )}
            </div>
            {readonly ? (
              <Tag className="text-2xl font-bold text-gray-900">{section.content}</Tag>
            ) : (
              <input
                type="text"
                value={section.content}
                onChange={(e) => updateContentSection(index, e.target.value)}
                placeholder="Enter heading..."
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        );

      case 'paragraph':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">PARAGRAPH</div>
              {!readonly && (
                <>
                  <button onClick={() => moveContentSection(index, 'up')} className="text-gray-400 hover:text-gray-600">↑</button>
                  <button onClick={() => moveContentSection(index, 'down')} className="text-gray-400 hover:text-gray-600">↓</button>
                  <button onClick={() => deleteContentSection(index)} className="text-red-400 hover:text-red-600">✕</button>
                </>
              )}
            </div>
            {readonly ? (
              <p className="text-gray-900 whitespace-pre-wrap">{section.content}</p>
            ) : (
              <textarea
                value={section.content}
                onChange={(e) => updateContentSection(index, e.target.value)}
                placeholder="Enter paragraph text..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        );

      case 'list':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">BULLETED LIST</div>
              {!readonly && (
                <>
                  <button onClick={() => moveContentSection(index, 'up')} className="text-gray-400 hover:text-gray-600">↑</button>
                  <button onClick={() => moveContentSection(index, 'down')} className="text-gray-400 hover:text-gray-600">↓</button>
                  <button onClick={() => deleteContentSection(index)} className="text-red-400 hover:text-red-600">✕</button>
                </>
              )}
            </div>
            {readonly ? (
              <ul className="list-disc list-inside text-gray-900">
                {section.content.split('\n').map((line, i) => (
                  <li key={i} className="mb-1">{line}</li>
                ))}
              </ul>
            ) : (
              <textarea
                value={section.content}
                onChange={(e) => updateContentSection(index, e.target.value)}
                placeholder="Enter list items (one per line)..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        );

      case 'code':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">CODE BLOCK</div>
              {!readonly && (
                <>
                  <button onClick={() => moveContentSection(index, 'up')} className="text-gray-400 hover:text-gray-600">↑</button>
                  <button onClick={() => moveContentSection(index, 'down')} className="text-gray-400 hover:text-gray-600">↓</button>
                  <button onClick={() => deleteContentSection(index)} className="text-red-400 hover:text-gray-600">✕</button>
                </>
              )}
            </div>
            {readonly ? (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
                <code>{section.content}</code>
              </pre>
            ) : (
              <textarea
                value={section.content}
                onChange={(e) => updateContentSection(index, e.target.value)}
                placeholder="Enter code..."
                rows={6}
                className="w-full font-mono border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            )}
          </div>
        );

      case 'image':
        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">IMAGE URL</div>
              {!readonly && (
                <>
                  <button onClick={() => moveContentSection(index, 'up')} className="text-gray-400 hover:text-gray-600">↑</button>
                  <button onClick={() => moveContentSection(index, 'down')} className="text-gray-400 hover:text-gray-600">↓</button>
                  <button onClick={() => deleteContentSection(index)} className="text-red-400 hover:text-red-600">✕</button>
                </>
              )}
            </div>
            {readonly ? (
              <div className="bg-gray-100 rounded-lg p-4">
                <img src={section.content} alt="Release image" className="max-w-full h-auto rounded" />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={section.content}
                  onChange={(e) => updateContentSection(index, e.target.value)}
                  placeholder="Enter image URL..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
                {section.content && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img src={section.content} alt="Preview" className="max-w-full h-auto rounded" />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading release notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Release Notes (CMS)</h1>
              <p className="text-gray-600 mt-1">
                Create, edit, and manage release notes
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedRelease(null);
                setNewRelease({
                  title: '',
                  slug: '',
                  version: '',
                  status: 'draft',
                  content: JSON.stringify([{ type: 'paragraph', content: '' }]),
                  page_type: 'release_notes'
                });
                setEditorMode(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create New Release
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!editorMode ? (
          // Releases List View
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
              <div className="flex gap-2">
                {['all', 'draft', 'published', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (status === 'all') {
                        loadReleases();
                      } else {
                        // Filter by status
                      }
                    }}
                    className="px-4 py-2 rounded-lg font-medium border border-gray-300 hover:border-blue-500 transition-colors"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Releases Grid */}
            {releases.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Release Notes Found</h2>
                <p className="text-gray-600 mb-6">Create your first release note to get started</p>
                <button
                  onClick={() => setEditorMode(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Create First Release
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {releases.map((release) => (
                  <div
                    key={release.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                        <p className="text-sm text-gray-600">Version {release.version}</p>
                        {release.created_by && (
                          <p className="text-xs text-gray-500">
                            By {release.created_by.name || release.created_by.email}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        release.status === 'published' ? 'bg-green-100 text-green-800' :
                        release.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {release.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleEdit(release)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePreview(release)}
                        className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Preview
                      </button>
                      {release.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(release.id)}
                          className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          Publish
                        </button>
                      )}
                      {release.status === 'published' && (
                        <button
                          onClick={() => handleArchive(release.id)}
                          className="flex-1 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(release.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Slug:</span>
                        <span className="font-mono text-gray-900">/releases/{release.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">{new Date(release.created_at).toLocaleDateString()}</span>
                      </div>
                      {release.published_at && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Published:</span>
                          <span className="text-gray-900">{new Date(release.published_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                      <div className="text-sm text-gray-500 mb-2">Content Preview:</div>
                      <div className="text-gray-900">
                        {(() => {
                          try {
                            const sections: ContentSection[] = JSON.parse(release.content);
                            return sections.map((section, idx) => renderContentSection(section, idx, true));
                          } catch {
                            return <p className="text-gray-600">Unable to render content</p>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Editor View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedRelease ? 'Edit Release' : 'Create New Release'}
                  </h2>
                  <button
                    onClick={() => setEditorMode(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveRelease} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={newRelease.title}
                        onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                        placeholder="e.g., Version 2.0.0 Release"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Version *
                      </label>
                      <input
                        type="text"
                        value={newRelease.version}
                        onChange={(e) => setNewRelease({ ...newRelease, version: e.target.value })}
                        placeholder="e.g., 2.0.0"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">/releases/</span>
                      <input
                        type="text"
                        value={newRelease.slug}
                        onChange={(e) => setNewRelease({ ...newRelease, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="version-2-0-0"
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newRelease.status}
                      onChange={(e) => setNewRelease({ ...newRelease, status: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Release Content</h2>
                  <div className="flex gap-2">
                    {[
                      { type: 'heading', icon: 'H', label: 'Heading' },
                      { type: 'paragraph', icon: '¶', label: 'Paragraph' },
                      { type: 'list', icon: '•', label: 'List' },
                      { type: 'code', icon: '&lt;/&gt;', label: 'Code' },
                      { type: 'image', icon: '🖼️', label: 'Image' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => addContentSection(item.type as ContentSection['type'])}
                        className="px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200"
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[400px] bg-gray-50 rounded-lg p-6 space-y-4">
                  {(() => {
                    try {
                      const sections: ContentSection[] = JSON.parse(newRelease.content);
                      return sections.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <p>Click the buttons above to add content sections</p>
                          <p className="text-sm mt-2">You can add headings, paragraphs, lists, code blocks, and images</p>
                        </div>
                      ) : sections.map((section, idx) => renderContentSection(section, idx));
                    } catch {
                      return (
                        <div className="text-center py-16 text-red-600">
                          <p>Invalid content format</p>
                          <button
                            onClick={() => setNewRelease({
                              ...newRelease,
                              content: JSON.stringify([{ type: 'paragraph', content: '' }])
                            })}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reset Content
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditorMode(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setNewRelease({ ...newRelease, status: 'published' });
                    handleSaveRelease(e);
                  }}
                  disabled={!newRelease.title || !newRelease.version || !newRelease.slug}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed font-semibold"
                >
                  Save & Publish
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{newRelease.title || 'Untitled Release'}</h4>
                    <p className="text-lg text-gray-600">Version {newRelease.version || '1.0.0'}</p>
                    {newRelease.slug && (
                      <p className="text-sm text-gray-500">/releases/{newRelease.slug}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      newRelease.status === 'published' ? 'bg-green-600 text-white' :
                      newRelease.status === 'draft' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {newRelease.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <div className="text-gray-900">
                      {(() => {
                        try {
                          const sections: ContentSection[] = JSON.parse(newRelease.content);
                          return sections.length === 0 ? (
                            <p className="text-gray-500">No content added yet</p>
                          ) : sections.map((section, idx) => renderContentSection(section, idx, true));
                        } catch {
                          return <p className="text-red-600">Unable to render preview</p>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRelease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Release Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedRelease.title}</h3>
                <p className="text-xl text-gray-600 mb-4">Version {selectedRelease.version}</p>
                
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedRelease.status === 'published' ? 'bg-green-100 text-green-800' :
                    selectedRelease.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRelease.status.toUpperCase()}
                  </span>
                  {selectedRelease.published_at && (
                    <span className="text-sm text-gray-600">
                      Published: {new Date(selectedRelease.published_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {(() => {
                  try {
                    const sections: ContentSection[] = JSON.parse(selectedRelease.content);
                    return sections.map((section, idx) => renderContentSection(section, idx, true));
                  } catch {
                    return <p className="text-red-600">Unable to render content</p>;
                  }
                })()}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleEdit(selectedRelease);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Edit This Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
