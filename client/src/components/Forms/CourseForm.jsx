import React, { useState, useEffect } from 'react';
import api, { baseURL } from '../../config/server';

const CourseForm = ({ onClose, onSubmit, loading, initialData }) => {
  const isEditMode = !!initialData;
  const [activeTab, setActiveTab] = useState(1);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail ? `${baseURL}/${initialData.thumbnail}` : null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoUploading, setVideoUploading] = useState({}); // { "sIndex-lIndex": boolean }
  const [errors, setErrors] = useState({}); // Validation errors
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/admin/categories');
        setCategories(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: data.data[0].name }));
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
    price: initialData?.price || '',
    category: initialData?.category || 'Web Development',
    level: initialData?.level || 'Beginner',
    status: initialData?.status || 'Draft',
    sections: initialData?.sections || [
      {
        title: '',
        lessons: [
          {
            title: '',
            type: 'video', // video, quiz, text
            duration: '',
            videoUrl: '',
            content: '',
            isFreePreview: false,
            questions: [] // For quizzes
          }
        ]
      }
    ]
  });

  // --- Image Handling ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      if (errors.thumbnail) setErrors({ ...errors, thumbnail: null });
    }
  };

  // --- Video Handling ---
  const handleVideoUpload = async (file, sIndex, lIndex) => {
    if (!file) return;

    const key = `${sIndex}-${lIndex}`;
    setVideoUploading(prev => ({ ...prev, [key]: true }));

    const uploadData = new FormData();
    uploadData.append('video', file);

    try {
      const { data } = await api.post('/instructor/upload-video', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleLessonChange(sIndex, lIndex, 'videoUrl', data.url);
    } catch (error) {
      console.error("Video upload failed", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setVideoUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // --- Curriculum Logic ---
  const handleSectionChange = (sIndex, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].title = value;
    setFormData({ ...formData, sections: newSections });
    if (errors[`section-${sIndex}`]) {
      const newErrors = { ...errors };
      delete newErrors[`section-${sIndex}`];
      setErrors(newErrors);
    }
  };

  const handleLessonChange = (sIndex, lIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex][field] = value;
    setFormData({ ...formData, sections: newSections });

    // Clear specific errors
    if (field === 'title' && errors[`lesson-${sIndex}-${lIndex}-title`]) {
      const newErrors = { ...errors };
      delete newErrors[`lesson-${sIndex}-${lIndex}-title`];
      setErrors(newErrors);
    }
    if (field === 'videoUrl' && errors[`lesson-${sIndex}-${lIndex}-video`]) {
      const newErrors = { ...errors };
      delete newErrors[`lesson-${sIndex}-${lIndex}-video`];
      setErrors(newErrors);
    }
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', lessons: [{ title: '', type: 'video', duration: '', videoUrl: '', content: '', isFreePreview: false, questions: [] }] }]
    });
  };

  const addLesson = (sIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons.push({ title: '', type: 'video', duration: '', videoUrl: '', content: '', isFreePreview: false, questions: [] });
    setFormData({ ...formData, sections: newSections });
  };

  const removeLesson = (sIndex, lIndex) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons.splice(lIndex, 1);
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
  };

  const updateQuestion = (sIndex, lIndex, qIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sIndex].lessons[lIndex].questions[qIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
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
    if (!formData.price) newErrors.price = "Price is required";
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
            if (!q.question.trim()) {
              newErrors[`q-${sIndex}-${lIndex}-${qIndex}`] = "Question empty";
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
        data.append(key, formData.title ? formData[key] : formData[key]);
      }
    });

    onSubmit(data, initialData?._id);
  };

  return (
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">{isEditMode ? 'Edit Course' : 'Create New Course'}</h2>
            <p className="text-sm text-gray-500">Step {activeTab} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <i className="fas fa-times text-xl text-gray-500"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            1. Basic Information
            {Object.keys(errors).some(k => !k.includes('section') && !k.includes('lesson')) && <span className="ml-2 text-red-500">•</span>}
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            2. Curriculum & Content
            {Object.keys(errors).some(k => k.includes('section') || k.includes('lesson')) && <span className="ml-2 text-red-500">•</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-gray-50">

          {/* TAB 1: BASIC INFO */}
          <div className={activeTab === 1 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <label className="block text-sm font-bold text-navy-900">Course Thumbnail</label>
                <div className={`relative aspect-video rounded-xl border-2 border-dashed ${errors.thumbnail ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} flex flex-col items-center justify-center overflow-hidden hover:border-blue-500 transition group`}>
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center p-6">
                      <div className={`w-12 h-12 ${errors.thumbnail ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <i className="fas fa-image text-xl"></i>
                      </div>
                      <p className={`text-sm font-medium ${errors.thumbnail ? 'text-red-500' : 'text-gray-600'}`}>{errors.thumbnail || "Click to upload"}</p>
                      <p className="text-xs text-gray-400 mt-1">1280x720 recommended</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-navy-900 mb-1">Course Title</label>
                    <input
                      type="text"
                      className={`w-full p-3 border ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none transition`}
                      placeholder="e.g. The Complete Web Developer Bootcamp"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: null });
                      }}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy-900 mb-1">Short Description</label>
                    <textarea
                      rows="3"
                      className={`w-full p-3 border ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none transition`}
                      placeholder="What will students learn?"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: null });
                      }}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-navy-900 mb-1">Complexity Level</label>
                      <select
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
                      <label className="block text-sm font-bold text-navy-900 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        className={`w-full p-3 border ${errors.price ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'} rounded-xl focus:ring-2 outline-none`}
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          if (errors.price) setErrors({ ...errors, price: null });
                        }}
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy-900 mb-1">Category</label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat._id}>{cat.name}</option>
                        ))}
                        {categories.length === 0 && <option>Other</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy-900 mb-1">Status</label>
                      <select
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
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
                  <div className="w-8 h-8 bg-navy-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {sIndex + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      placeholder="Enter Section Title..."
                      className={`w-full bg-transparent border-none font-bold text-lg text-navy-900 placeholder-gray-400 focus:ring-0 ${errors[`section-${sIndex}`] ? 'placeholder-red-300' : ''}`}
                      value={section.title}
                      onChange={(e) => handleSectionChange(sIndex, e.target.value)}
                    />
                    {errors[`section-${sIndex}`] && <p className="text-red-500 text-xs">{errors[`section-${sIndex}`]}</p>}
                  </div>
                  <button type="button" className="text-gray-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                </div>

                <div className="p-4 space-y-4">
                  {section.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} className={`border ${errors[`lesson-${sIndex}-${lIndex}-title`] || errors[`lesson-${sIndex}-${lIndex}-video`] ? 'border-red-300 bg-red-50/10' : 'border-gray-100 bg-gray-50/50'} rounded-xl p-4 hover:border-blue-200 transition`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lesson {lIndex + 1}</span>
                          <select
                            className="bg-white border border-gray-200 text-xs font-bold px-2 py-1 rounded-lg text-navy-900"
                            value={lesson.type}
                            onChange={(e) => handleLessonChange(sIndex, lIndex, 'type', e.target.value)}
                          >
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="text">Text/Article</option>
                          </select>
                        </div>
                        <button type="button" onClick={() => removeLesson(sIndex, lIndex)} className="text-gray-300 hover:text-red-500 transition px-2">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <input
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
                                  {videoUploading[`${sIndex}-${lIndex}`] ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
                                  ) : (
                                    <><i className="fas fa-cloud-upload-alt"></i> {lesson.videoUrl ? 'Change Video' : 'Choose File'}</>
                                  )}
                                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoUpload(e.target.files[0], sIndex, lIndex)} />
                                </label>
                              </div>
                              {errors[`lesson-${sIndex}-${lIndex}-video`] && <p className="text-red-500 text-xs mt-1">{errors[`lesson-${sIndex}-${lIndex}-video`]}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Or Video URL</label>
                              <input
                                placeholder="https://..."
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
                              <div key={qIndex} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <input
                                  placeholder="Question Text"
                                  className={`w-full p-2 mb-2 bg-white border ${errors[`q-${sIndex}-${lIndex}-${qIndex}`] ? 'border-red-400' : 'border-gray-200'} rounded text-sm font-medium`}
                                  value={q.question}
                                  onChange={(e) => updateQuestion(sIndex, lIndex, qIndex, 'question', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${sIndex}-${lIndex}-${qIndex}`}
                                        checked={q.correctAnswer === oIndex}
                                        onChange={() => updateQuestion(sIndex, lIndex, qIndex, 'correctAnswer', oIndex)}
                                      />
                                      <input
                                        placeholder={`Option ${oIndex + 1}`}
                                        className="flex-1 p-1 px-2 border rounded text-xs bg-white"
                                        value={opt}
                                        onChange={(e) => updateOption(sIndex, lIndex, qIndex, oIndex, e.target.value)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <button type="button" onClick={() => addQuestion(sIndex, lIndex)} className="text-xs text-blue-600 font-bold hover:underline">
                              + Add Question
                            </button>
                          </div>
                        )}

                        {lesson.type === 'text' && (
                          <textarea
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
        <div className="p-6 border-t bg-white flex justify-between items-center">
          {activeTab === 2 ? (
            <button onClick={() => setActiveTab(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:text-red-500 transition">Cancel</button>
            {activeTab === 1 ? (
              <button
                onClick={() => setActiveTab(2)}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                Next Step <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center"
                disabled={loading}
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-check mr-2"></i>}
                {isEditMode ? 'Update Course' : 'Publish Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;