"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    label = "Upload Image",
    accept = "image/*",
    maxSize = 5,
    className = "",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
                throw new Error(errorData.error || `Upload failed: ${response.status}`);
            }

            const result = await response.json();
            if (result.url) {
                onChange(result.url);
                toast.success("Image uploaded successfully");
            } else {
                throw new Error("No URL returned from server");
            }
        } catch (error) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            toast.error(errorMessage);
            // Don't clear preview on error - let user try again
            // setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label>{label}</Label>

            {preview ? (
                <div className="relative">
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                        disabled={uploading}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={handleButtonClick}
                >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                        Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400">
                        Max size: {maxSize}MB
                    </p>
                </div>
            )}

            <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {!preview && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleButtonClick}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}





