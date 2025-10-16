"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, FileText, Image, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ReceiptViewer() {
    const params = useParams()
    const filename = params.filename as string
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fileInfo, setFileInfo] = useState<{
        type: string
        size: number
        url: string
    } | null>(null)

    useEffect(() => {
        if (filename) {
            // Determine file type from extension
            const extension = filename.split('.').pop()?.toLowerCase()
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
            const isPdf = extension === 'pdf'
            
            if (isImage || isPdf) {
                setFileInfo({
                    type: isImage ? 'image' : 'pdf',
                    size: 0, // We don't have size info from URL
                    url: `/uploads/receipts/${filename}`
                })
                setLoading(false)
            } else {
                setError('Unsupported file type')
                setLoading(false)
            }
        }
    }, [filename])

    const handleDownload = () => {
        if (fileInfo) {
            const link = document.createElement('a')
            link.href = fileInfo.url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return 'Unknown size'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading receipt...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardHeader className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => window.history.back()} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => window.history.back()} 
                                variant="outline" 
                                size="sm"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Receipt Viewer</h1>
                                <p className="text-sm text-gray-500">{filename}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                                {fileInfo?.type === 'image' ? (
                                    <Image className="h-3 w-3" />
                                ) : (
                                    <FileText className="h-3 w-3" />
                                )}
                                {fileInfo?.type?.toUpperCase()}
                            </Badge>
                            <Button onClick={handleDownload} size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardContent className="p-0">
                        {fileInfo?.type === 'image' ? (
                            <div className="flex justify-center bg-gray-100">
                                <img
                                    src={fileInfo.url}
                                    alt="Receipt"
                                    className="max-w-full max-h-[80vh] object-contain"
                                    onError={() => setError('Failed to load image')}
                                />
                            </div>
                        ) : fileInfo?.type === 'pdf' ? (
                            <div className="h-[80vh]">
                                <iframe
                                    src={fileInfo.url}
                                    className="w-full h-full border-0"
                                    title="Receipt PDF"
                                    onError={() => setError('Failed to load PDF')}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Preview not available for this file type</p>
                                    <Button onClick={handleDownload} className="mt-4">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* File Info */}
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-sm">File Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Filename:</span>
                            <span className="font-medium">{filename}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{fileInfo?.type?.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium">{formatFileSize(fileInfo?.size || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
