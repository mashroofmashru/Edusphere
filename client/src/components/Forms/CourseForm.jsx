import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/server';
import { useUI } from '../../context/UIContext';
import { courseThumb } from '../../utils/format';

const MAX_THUMB_MB = 5;
const emptyLesson = () => ({ title: '', type: 'video', duration: '', videoUrl: '', content: '', isFreePreview: false, questions: [] });

const CourseForm = ({ onClose, onSubmit, loading, initialData }) => {
  const isEditMode = !!initialData;
  const { toast, confirm } = useUI();
  const dirty = useRef(false);
  const [activeTab, setActiveTab] = useState(1);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.thumbnail && !initialData.thumbnail.includes('default') ? courseThumb(initialData.thumbnail) : null
  );
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoUploading, setVideoUploading] = useState({}); // { "sIndex-lIndex": boolean }
  const [errors, setErrors] = useState({}); // Validation errors
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/admin/categories');
        setCategories(data.data);
        // Only default the category for new courses; never overwrite a saved one.
        if (!initialData?.category && data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: prev.category || data.data[0].name }));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    price: initialData?.price ?? '',
    category: initialData?.category || '',
    level: initialData?.level || 'Beginner',
    status: initialData?.status || 'Draft',
    // Deep copy so editing never mutates the course object held by the parent list
    sections: initialData?.sections ? JSON.parse(JSON.stringify(initialData.sections)) : [
      { title: '', lessons: [emptyLesson()] }
    ]
  });

  // Mark the form as edited whenever data changes after the first render
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    dirty.current = true;
  }, [formData]);

  const requestClose = async () => {
    if (dirty.current) {
      const ok = await confirm({
        title: 'Discard changes?',
        message: 'You have unsaved changes to this course. Close without saving?',
        confirmText: 'Discard',
        danger: true,
      });
      if (!ok) return;
    }
    onClose();
  };

  const clearError = (...keys) => {
    setErrors(prev => {
      if (!keys.some(k => k in prev)) return prev;
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
  };
  const hasErrors = (predicate) => Object.entries(errors).some(([k, v]) => v && predicate(k));

  // --- Image Handling ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_THUMB_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, thumbnail: `Image must be under ${MAX_THUMB_MB} MB` }));
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    dirty.current = true;
    clearError('thumbnail');
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    dirty.current = true;
  };

  // --- Video Handling ---
  const handleVideoUpload = async (file, sIndex, lIndex) => {
    if (!file) return;

    const key = `${sIndex}-${lIndex}`;
    setVideoUploading(prev => ({ ...prev, [key]: 0 }));

    const uploadData = new FormData();
    uploadData.append('video', file);

    try {
      const { data } = await api.post('/instructor/upload-video', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setVideoUploading(prev => ({ ...prev, [key]: Math.round((evt.loaded / evt.total) * 100) }));
        }
      });

      handleLessonChange(sIndex, lIndex, 'videoUrl', data.url);
      handleLessonChange(sIndex, lIndex, 'videoName', file.name);
      toast('Video uploaded');
    } catch (error) {
      console.error("Video upload failed", error);
      toast("Failed to upload video. Please try again.", "error");
    } finally {
      setVideoUploading(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // --- Curriculum Logic ---
  const handleSectionChange = (sIndex, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].title = value;
    setFormData({ ...formData, sections: newSections });
    clearError(`section-${sIndex}`);
  };

  const handleLessonChange = (sIndex, lIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex][field] = value;
    setFormData({ ...formData, sections: newSections });

    if (field === 'title') clearError(`lesson-${sIndex}-${lIndex}-title`);
    if (field === 'videoUrl') clearError(`lesson-${sIndex}-${lIndex}-video`);
    if (field === 'type') clearError(`lesson-${sIndex}-${lIndex}-video`, `lesson-${sIndex}-${lIndex}-quiz`);
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', lessons: [emptyLesson()] }]
    });
    clearError('general');
  };

  const removeSection = async (sIndex) => {
    const section = formData.sections[sIndex];
    const hasContent = section.title.trim() || section.lessons.some(l => l.title.trim());
    if (hasContent) {
      const ok = await confirm({
        title: 'Delete this section?',
        message: `"${section.title || `Section ${sIndex + 1}`}" and its ${section.lessons.length} lesson(s) will be removed.`,
        confirmText: 'Delete',
        danger: true,
      });
      if (!ok) return;
    }
    // Errors are keyed by index, so reset them rather than leaving stale markers
    setErrors({});
    setFormData(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== sIndex) }));
  };

  const moveSection = (sIndex, dir) => {
    const target = sIndex + dir;
    if (target < 0 || target >= formData.sections.length) return;
    const newSections = [...formData.sections];
    [newSections[sIndex], newSections[target]] = [newSections[target], newSections[sIndex]];
    setErrors({});
    setFormData({ ...formData, sections: newSections });
  };

  const addLesson = (sIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons.push(emptyLesson());
    setFormData({ ...formData, sections: newSections });
    clearError(`section-${sIndex}-no-lessons`);
  };

  const removeLesson = (sIndex, lIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons.splice(lIndex, 1);
    setErrors({});
    setFormData({ ...formData, sections: newSections });
  };

  const moveLesson = (sIndex, lIndex, dir) => {
    const lessons = formData.sections[sIndex].lessons;
    const target = lIndex + dir;
    if (target < 0 || target >= lessons.length) return;
    const newSections = [...formData.sections];
    [lessons[lIndex], lessons[target]] = [lessons[target], lessons[lIndex]];
    setErrors({});
    setFormData({ ...formData, sections: newSections });
  };

  // --- Quiz Logic ---
  const addQuestion = (sIndex, lIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex].questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setFormData({ ...formData, sections: newSections });
    clearError(`lesson-${sIndex}-${lIndex}-quiz`);
  };

  const removeQuestion = (sIndex, lIndex, qIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex].questions.splice(qIndex, 1);
    setErrors({});
    setFormData({ ...formData, sections: newSections });
  };

  const updateQuestion = (sIndex, lIndex, qIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex].questions[qIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
    if (field === 'question') clearError(`q-${sIndex}-${lIndex}-${qIndex}`);
  };

  const updateOption = (sIndex, lIndex, qIndex, oIndex, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex].questions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, sections: newSections });
  };

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    let errorTab = 1;

    // Tab 1 Validation
    if (!formData.title.trim()) newErrors.title = "Course title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.price === '' || formData.price === null || Number(formData.price) < 0) newErrors.price = "Enter a price (0 for a free course)";
    if (!thumbnailFile && !thumbnailPreview) newErrors.thumbnail = "Thumbnail is required";

    if (Object.keys(newErrors).length > 0) {
      errorTab = 1;
      isValid = false;
    }

    // Tab 2 Validation
    if (formData.sections.length === 0) {
      newErrors.general = "At least one section is required";
      if (isValid) errorTab = 2; // Only switch if Tab 1 was valid
      isValid = false;
    }

    formData.sections.forEach((section, sIndex) => {
      if (!section.title.trim()) {
        newErrors[`section-${sIndex}`] = "Section title is required";
        if (isValid) errorTab = 2;
        isValid = false;
      }

      if (section.lessons.length === 0) {
        newErrors[`section-${sIndex}-no-lessons`] = "Add at least one lesson";
        if (isValid) errorTab = 2;
        isValid = false;
      }

      section.lessons.forEach((lesson, lIndex) => {
        if (!lesson.title.trim()) {
          newErrors[`lesson-${sIndex}-${lIndex}-title`] = "Title required";
          if (isValid) errorTab = 2;
          isValid = false;
        }

        if (lesson.type === 'video' && !lesson.videoUrl) {
          newErrors[`lesson-${sIndex}-${lIndex}-video`] = "Video required";
          if (isValid) errorTab = 2;
          isValid = false;
        }

        if (lesson.type === 'quiz') {
          if (lesson.questions.length === 0) {
            newErrors[`lesson-${sIndex}-${lIndex}-quiz`] = "Add questions";
            if (isValid) errorTab = 2;
            isValid = false;
          }
          lesson.questions.forEach((q, qIndex) => {
            if (!q.question.trim() || q.options.some(o => !String(o).trim())) {
              newErrors[`q-${sIndex}-${lIndex}-${qIndex}`] = "Fill in the question and all 4 options";
              if (isValid) errorTab = 2;
              isValid = false;
            }
          });
        }
      });
    });

    setErrors(newErrors);

    if (!isValid) {
      setActiveTab(errorTab);
      // Optional: Scroll to top of form or show toast
    }

    return isValid;
  };

  // --- Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    }
    Object.keys(formData).forEach(key => {
      if (key === 'sections') {
        data.append('sections', JSON.stringify(formData.sections));
      } else {
        data.append(key, formData[key]);
      }
    });

    dirty.current = false;
    onSubmit(data, initialData?._id);
  };

  return (
    <div
      className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
      onKeyDown={(e) => e.key === 'Escape' && requestClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={isEditMode ? 'Edit course' : 'Create new course'} className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{isEditMode ? 'Edit Course' : 'Create New Course'}</h2>
            <p className="text-sm text-gray-500">Step {activeTab} of 2</p>
          </div>
          <button type="button" onClick={requestClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-full transition">
            <i className="fas fa-times text-xl text-gray-500" aria-hidden="true"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold text-center border-b-2 transition ${activeTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            1. Basic Information
            {hasErrors(k => !k.includes('section') && !k.includes('lesson') && !k.startsWith('q-') && k !== 'general') && <span className="ml-2 text-red-500" aria-label="has errors">•</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold text-center border-b-2 transition ${activeTab === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            2. Curriculum & Content
            {hasErrors(k => k.includes('section') || k.includes('lesson') || k.startsWith('q-') || k === 'general') && <span className="ml-2 text-red-500" aria-label="has errors">•</span>}
          </button>
        </div>

        <form id="course-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">

          {/* TAB 1: BASIC INFO */}
          <div className={activeTab === 1 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="cf-thumb" className="block text-sm font-bold text-navy-900">Course Thumbnail</label>
                  {thumbnailPreview && (
                    <button type="button" onClick={removeThumbnail} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                  )}
                </div>
                <div className={`relative aspect-video rounded-xl border-2 border-dashed ${errors.thumbnail ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} flex flex-col items-center justify-center overflow-hidden hover:border-blue-500 transition group`}>
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail preview" />
                      <span className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-black/60 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">Change image</span>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className={`w-12 h-12 ${errors.thumbnail ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <i className="fas fa-image text-xl"></i>
                      </div>
                      <p className={`text-sm font-medium ${errors.thumbnail ? 'text-red-500' : 'text-gray-600'}`}>{errors.thumbnail || "Click to upload"}</p>
                      <p className="text-xs text-gray-400 mt-1">1280x720 recommended · max {MAX_THUMB_MB} MB</p>
                    </div>
                  )}
                  <input id="cf-thumb" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {thumbnailPreview && errors.thumbnail && <p className="text-red-500 text-xs">{errors.thumbnail}</p>}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cf-title" className="block text-sm font-bold text-navy-900 mb-1">Course Title</label>
                    <input
                      id="cf-title"
                      type="text"
                      className={`w-full p-3 border ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none transition`}
                      placeholder="e.g. The Complete Web Developer Bootcamp"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        clearError('title');
                      }}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label htmlFor="cf-subtitle" className="block text-sm font-bold text-navy-900 mb-1">Subtitle <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      id="cf-subtitle"
                      type="text"
                      maxLength={120}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="A one-line summary shown on course cards"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="cf-desc" className="block text-sm font-bold text-navy-900 mb-1">Description</label>
                    <textarea
                      id="cf-desc"
                      rows="3"
                      className={`w-full p-3 border ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none transition`}
                      placeholder="What will students learn?"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        clearError('description');
                      }}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cf-level" className="block text-sm font-bold text-navy-900 mb-1">Level</label>
                      <select
                        id="cf-level"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="cf-price" className="block text-sm font-bold text-navy-900 mb-1">Price (₹)</label>
                      <input
                        id="cf-price"
                        type="number"
                        min="0"
                        placeholder="0 = free"
                        className={`w-full p-3 border ${errors.price ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none`}
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          clearError('price');
                        }}
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-category" className="block text-sm font-bold text-navy-900 mb-1">Category</label>
                      <select
                        id="cf-category"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {formData.category && !categories.some(c => c.name === formData.category) && (
                          <option value={formData.category}>{formData.category}</option>
                        )}
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                        {categories.length === 0 && !formData.category && <option value="Other">Other</option>}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cf-status" className="block text-sm font-bold text-navy-900 mb-1">Status</label>
                      <select
                        id="cf-status"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-navy-900"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: CURRICULUM */}
          <div className={activeTab === 2 ? 'space-y-8 block' : 'hidden'}>
            {formData.sections.map((section, sIndex) => (
              <div key={sIndex} className={`bg-white rounded-xl border ${errors[`section-${sIndex}`] ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} overflow-hidden shadow-sm transition`}>
                <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 bg-navy-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {sIndex + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      aria-label={`Section ${sIndex + 1} title`}
                      placeholder="Enter Section Title..."
                      className={`w-full bg-transparent border-none font-bold text-lg text-navy-900 placeholder-gray-400 focus:ring-0 ${errors[`section-${sIndex}`] ? 'placeholder-red-300' : ''}`}
                      value={section.title}
                      onChange={(e) => handleSectionChange(sIndex, e.target.value)}
                    />
                    {errors[`section-${sIndex}`] && <p className="text-red-500 text-xs">{errors[`section-${sIndex}`]}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveSection(sIndex, -1)} disabled={sIndex === 0} aria-label="Move section up" title="Move up" className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white hover:text-navy-900 disabled:opacity-30 transition"><i className="fas fa-arrow-up text-xs" aria-hidden="true"></i></button>
                    <button type="button" onClick={() => moveSection(sIndex, 1)} disabled={sIndex === formData.sections.length - 1} aria-label="Move section down" title="Move down" className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white hover:text-navy-900 disabled:opacity-30 transition"><i className="fas fa-arrow-down text-xs" aria-hidden="true"></i></button>
                    <button type="button" onClick={() => removeSection(sIndex)} aria-label={`Delete section ${sIndex + 1}`} title="Delete section" className="w-8 h-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"><i className="fas fa-trash text-sm" aria-hidden="true"></i></button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-4">
                  {errors[`section-${sIndex}-no-lessons`] && <p className="text-red-500 text-xs font-bold">{errors[`section-${sIndex}-no-lessons`]}</p>}
                  {section.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} className={`border ${errors[`lesson-${sIndex}-${lIndex}-title`] || errors[`lesson-${sIndex}-${lIndex}-video`] ? 'border-red-300 bg-red-50/10' : 'border-gray-100 bg-gray-50/50'} rounded-xl p-3 sm:p-4 hover:border-blue-200 transition`}>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lesson {lIndex + 1}</span>
                          <select
                            aria-label="Lesson type"
                            className="bg-white border border-gray-200 text-xs font-bold px-2 py-1 rounded-lg text-navy-900"
                            value={lesson.type}
                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'type', e.target.value)}
                          >
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="text">Text/Article</option>
                          </select>
                          {lesson.type !== 'quiz' && (
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                              <i className="far fa-clock" aria-hidden="true"></i>
                              <input
                                type="number"
                                min="0"
                                aria-label="Duration in minutes"
                                placeholder="0"
                                className="w-16 bg-white border border-gray-200 px-2 py-1 rounded-lg text-navy-900"
                                value={lesson.duration}
                                onChange={(e) => handleLessonChange(sIndex, lIndex, 'duration', e.target.value)}
                              />
                              min
                            </label>
                          )}
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!lesson.isFreePreview}
                              onChange={(e) => handleLessonChange(sIndex, lIndex, 'isFreePreview', e.target.checked)}
                            />
                            Free preview
                          </label>
                        </div>
                        <div className="flex items-center shrink-0">
                          <button type="button" onClick={() => moveLesson(sIndex, lIndex, -1)} disabled={lIndex === 0} aria-label="Move lesson up" title="Move up" className="w-7 h-7 text-gray-300 hover:text-navy-900 disabled:opacity-30 transition"><i className="fas fa-arrow-up text-xs" aria-hidden="true"></i></button>
                          <button type="button" onClick={() => moveLesson(sIndex, lIndex, 1)} disabled={lIndex === section.lessons.length - 1} aria-label="Move lesson down" title="Move down" className="w-7 h-7 text-gray-300 hover:text-navy-900 disabled:opacity-30 transition"><i className="fas fa-arrow-down text-xs" aria-hidden="true"></i></button>
                          <button type="button" onClick={() => removeLesson(sIndex, lIndex)} aria-label={`Remove lesson ${lIndex + 1}`} title="Remove lesson" className="w-7 h-7 text-gray-300 hover:text-red-500 transition">
                            <i className="fas fa-times" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <input
                            aria-label="Lesson title"
                            placeholder="Lesson Title"
                            className={`w-full p-2 bg-white border ${errors[`lesson-${sIndex}-${lIndex}-title`] ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'title', e.target.value)}
                          />
                          {errors[`lesson-${sIndex}-${lIndex}-title`] && <p className="text-red-500 text-xs mt-1">{errors[`lesson-${sIndex}-${lIndex}-title`]}</p>}
                        </div>

                        {/* CONTENT TYPES */}
                        {lesson.type === 'video' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Upload Video</label>
                              <div className="flex items-center gap-2">
                                <label className={`flex-1 cursor-pointer bg-white border ${errors[`lesson-${sIndex}-${lIndex}-video`] ? 'border-red-400 text-red-500' : 'border-gray-300 text-gray-600'} rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2`}>
                                  {videoUploading[`${sIndex}-${lIndex}`] !== undefined ? (
                                    <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Uploading… {videoUploading[`${sIndex}-${lIndex}`]}%</>
                                  ) : (
                                    <><i className="fas fa-cloud-upload-alt" aria-hidden="true"></i> {lesson.videoUrl ? 'Change Video' : 'Choose File'}</>
                                  )}
                                  <input type="file" accept="video/*" className="hidden" disabled={videoUploading[`${sIndex}-${lIndex}`] !== undefined} onChange={(e) => { handleVideoUpload(e.target.files[0], sIndex, lIndex); e.target.value = ''; }} />
                                </label>
                              </div>
                              {videoUploading[`${sIndex}-${lIndex}`] !== undefined && (
                                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${videoUploading[`${sIndex}-${lIndex}`]}%` }}></div>
                                </div>
                              )}
                              {lesson.videoUrl && videoUploading[`${sIndex}-${lIndex}`] === undefined && (
                                <p className="text-xs text-green-600 mt-1 truncate"><i className="fas fa-check-circle mr-1" aria-hidden="true"></i>{lesson.videoName || 'Video attached'}</p>
                              )}
                              {errors[`lesson-${sIndex}-${lIndex}-video`] && <p className="text-red-500 text-xs mt-1">{errors[`lesson-${sIndex}-${lIndex}-video`]}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Or Video URL</label>
                              <input
                                type="url"
                                aria-label="Video URL"
                                placeholder="YouTube, Vimeo or direct .mp4 link"
                                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                                value={lesson.videoUrl}
                                onChange={(e) => handleLessonChange(sIndex, lIndex, 'videoUrl', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {lesson.type === 'quiz' && (
                          <div className={`bg-white p-4 rounded-lg border ${errors[`lesson-${sIndex}-${lIndex}-quiz`] ? 'border-red-300' : 'border-gray-200'} space-y-4`}>
                            <div className="flex justify-between items-center border-b pb-2">
                              <p className="text-sm font-bold text-navy-900">Quiz Questions</p>
                              {errors[`lesson-${sIndex}-${lIndex}-quiz`] && <span className="text-xs text-red-500">{errors[`lesson-${sIndex}-${lIndex}-quiz`]}</span>}
                            </div>

                            {lesson.questions.map((q, qIndex) => (
                              <div key={qIndex} className={`p-3 bg-gray-50 rounded-lg border ${errors[`q-${sIndex}-${lIndex}-${qIndex}`] ? 'border-red-300' : 'border-gray-200'} relative`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase">Question {qIndex + 1}</span>
                                  <button type="button" onClick={() => removeQuestion(sIndex, lIndex, qIndex)} aria-label={`Remove question ${qIndex + 1}`} title="Remove question" className="text-gray-300 hover:text-red-500 transition"><i className="fas fa-trash text-xs" aria-hidden="true"></i></button>
                                </div>
                                <input
                                  aria-label={`Question ${qIndex + 1} text`}
                                  placeholder="Question Text"
                                  className={`w-full p-2 mb-2 bg-white border ${errors[`q-${sIndex}-${lIndex}-${qIndex}`] ? 'border-red-400' : 'border-gray-200'} rounded text-sm font-medium`}
                                  value={q.question}
                                  onChange={(e) => updateQuestion(sIndex, lIndex, qIndex, 'question', e.target.value)}
                                />
                                <p className="text-[11px] text-gray-400 mb-1">Select the radio button next to the correct answer.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${sIndex}-${lIndex}-${qIndex}`}
                                        aria-label={`Mark option ${oIndex + 1} as correct`}
                                        checked={q.correctAnswer === oIndex}
                                        onChange={() => updateQuestion(sIndex, lIndex, qIndex, 'correctAnswer', oIndex)}
                                      />
                                      <input
                                        aria-label={`Option ${oIndex + 1}`}
                                        placeholder={`Option ${oIndex + 1}`}
                                        className={`flex-1 min-w-0 p-1.5 px-2 border rounded text-xs bg-white ${q.correctAnswer === oIndex ? 'border-green-400 ring-1 ring-green-200' : ''}`}
                                        value={opt}
                                        onChange={(e) => updateOption(sIndex, lIndex, qIndex, oIndex, e.target.value)}
                                      />
                                    </div>
                                  ))}
                                </div>
                                {errors[`q-${sIndex}-${lIndex}-${qIndex}`] && <p className="text-red-500 text-xs mt-2">{errors[`q-${sIndex}-${lIndex}-${qIndex}`]}</p>}
                              </div>
                            ))}
                            <button type="button" onClick={() => addQuestion(sIndex, lIndex)} className="text-xs text-blue-600 font-bold hover:underline">
                              + Add Question
                            </button>
                          </div>
                        )}

                        {lesson.type === 'text' && (
                          <textarea
                            aria-label="Lesson content"
                            placeholder="Enter textual content for this lesson..."
                            rows="4"
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                            value={lesson.content}
                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'content', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(sIndex)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus-circle"></i> Add Lesson
                  </button>
                </div>
              </div>
            ))}
            {formData.sections.length === 0 && !errors.general && (
              <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500 text-sm">No sections yet. Add one to start building your curriculum.</div>
            )}
            {errors.general && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold text-center">{errors.general}</div>}

            <button
              type="button"
              onClick={addSection}
              className="w-full py-4 bg-navy-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-layer-group"></i> Add New Section
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-white flex justify-between items-center gap-2">
          {activeTab === 2 ? (
            <button type="button" onClick={() => setActiveTab(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2 sm:gap-4">
            <button type="button" onClick={requestClose} className="px-3 sm:px-6 py-2 text-gray-500 font-bold hover:text-red-500 transition">Cancel</button>
            {activeTab === 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className="px-5 sm:px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                Next Step <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                form="course-form"
                className="px-5 sm:px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || Object.keys(videoUploading).length > 0}
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i> : <i className="fas fa-check mr-2" aria-hidden="true"></i>}
                {isEditMode ? 'Save Changes' : formData.status === 'Published' ? 'Publish Course' : 'Save as Draft'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;