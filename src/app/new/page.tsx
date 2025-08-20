"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';

const NewSharePage = () => {
    const [type, setType] = useState<'code' | 'file'>('code');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState('javascript');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', type);

            if (type === 'code') {
                formData.append('content', content);
                formData.append('language', language);
            } else if (file) {
                formData.append('file', file);
            }

            const response = await fetch('/api/share', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create share');
            }

            const data = await response.json();
            router.push(`/share/${data.id}`);
            toast.success('Share created successfully!');
        } catch (error) {
            toast.error('Failed to create share');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const languageOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
    ];

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Create a New Share</h1>
            
            <div className="mb-4">
                <label className="flex items-center space-x-4">
                    <span className="text-lg">Share Type:</span>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'code' | 'file')}
                        className="border rounded-md p-2"
                    >
                        <option value="code">Code</option>
                        <option value="file">File</option>
                    </select>
                </label>
                   <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg 
                             transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating...' : 'Create Shareable Link'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'code' && (
                    <>
                        <div className="mb-4">
                            <label className="flex items-center space-x-4">
                                <span className="text-lg">Language:</span>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    {languageOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="h-[60vh] border rounded-lg overflow-hidden">
                            <Editor
                                height="100%"
                                language={language}
                                value={content}
                                onChange={(value) => setContent(value || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </>
                )}

                {type === 'file' && (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full"
                            accept="*/*"
                        />
                        <p className="text-gray-500 mt-2">
                            Drag and drop a file here, or click to select
                        </p>
                    </div>
                )}

             
            </form>
        </div>
    );
};

export default NewSharePage;