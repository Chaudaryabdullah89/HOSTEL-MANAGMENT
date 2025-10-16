"use client"
import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

export default function ReceiptUpload({ 
    onUploadSuccess, 
    onUploadError, 
    currentFile,
    onRemove 
}) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileSelect = async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
            onUploadError('Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed.')
            return
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            onUploadError('File too large. Maximum size is 10MB.')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + 10
                })
            }, 100)

            const response = await fetch('/api/upload/receipt', {
                method: 'POST',
                body: formData
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (response.ok) {
                const result = await response.json()
                onUploadSuccess(result.filePath, result.fileName)
                toast({
                    title: "Upload Successful",
                    description: "Receipt uploaded successfully",
                })
            } else {
                const error = await response.json()
                onUploadError(error.error || 'Upload failed')
            }
        } catch (error) {
            onUploadError('Network error occurred during upload')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
        return isImage ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (currentFile) {
        const fileName = currentFile.split('/').pop() || 'receipt'
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                {getFileIcon(fileName)}
                            </div>
                            <div>
                                <p className="font-medium text-green-800">{fileName}</p>
                                <p className="text-sm text-green-600">Receipt uploaded successfully</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(currentFile, '_blank')}
                            >
                                View
                            </Button>
                            {onRemove && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRemove}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
            />
            
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Uploading receipt...</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {dragActive ? 'Drop the file here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF, PDF up to 10MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Optional skip button */}
            {!currentFile && !uploading && (
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">or</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUploadSuccess('', '')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Skip receipt upload
                    </Button>
                </div>
            )}
        </div>
    )
}
