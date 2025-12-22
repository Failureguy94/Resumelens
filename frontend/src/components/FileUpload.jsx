import { useState, useRef } from 'react';
import './FileUpload.css';

export default function FileUpload({ onFileSelect, selectedFile }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        validateAndSelectFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateAndSelectFile(file);
    };

    const validateAndSelectFile = (file) => {
        if (!file) return;

        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF or DOCX file');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return;
        }

        onFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="file-upload-wrapper">
            {!selectedFile ? (
                <div
                    className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <div className="upload-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>

                    <h3>Drop your resume here</h3>
                    <p>or click to browse</p>
                    <span className="file-types">PDF or DOCX • Max 10MB</span>
                </div>
            ) : (
                <div className="file-selected">
                    <div className="file-info">
                        <div className="file-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                <polyline points="13 2 13 9 20 9" />
                            </svg>
                        </div>
                        <div className="file-details">
                            <p className="file-name">{selectedFile.name}</p>
                            <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button className="btn-remove" onClick={handleRemove} type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
