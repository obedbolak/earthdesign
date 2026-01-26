// app/admin/dashboard/upload/page.tsx (or wherever your excel upload is)
"use client";
import React, { useRef, useState, Dispatch, SetStateAction } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileUp,
  Table,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  FileCheck,
  XCircle,
  BarChart3,
  Layers,
  Clock,
  HardDrive,
} from "lucide-react";

type TabKey = "overview" | "data" | "upload" | "images" | "video" | "clear";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface ImportResults {
  totalSheets?: number;
  processedSheets?: number;
  summary?: {
    totalImported: number;
    totalDuplicates: number;
    totalSkipped: number;
    totalErrors: number;
  };
  sheets?: Array<{
    name: string;
    status: string;
    imported: number;
    duplicates: number;
    skipped: number;
    errorCount: number;
    warningCount: number;
  }>;
  [key: string]: any;
}
export default function UploadExcel({
  onTabChange,
}: { onTabChange?: Dispatch<SetStateAction<TabKey>> } = {}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const handleFile = async (file?: File) => {
    setMessage(null);
    setErrors(null);
    setResults(null);
    setIsSuccess(false);

    if (!file) {
      setMessage("No file selected");
      return;
    }

    if (file.size > MAX_BYTES) {
      setMessage("File too large. Max 10 MB allowed.");
      return;
    }

    setSelectedFile(file);
    const form = new FormData();
    form.append("excelFile", file);

    // Simulate progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      setLoading(true);
      const res = await fetch("/api/upload-excel", {
        method: "POST",
        body: form,
      });
      const json = await res.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Debug: Log full response
      console.log("=== API Response ===");
      console.log("Status:", res.status);
      console.log("Response:", JSON.stringify(json, null, 2));

      // Collect all errors from various response formats
      const allErrors: string[] = [];

      // Add global errors
      if (json?.errors && Array.isArray(json.errors)) {
        allErrors.push(...json.errors);
      }

      // Add sheet-specific errors
      if (json?.sheetErrors && Array.isArray(json.sheetErrors)) {
        json.sheetErrors.forEach(
          (sheetError: { sheet: string; errors: string[] }) => {
            if (sheetError.errors && Array.isArray(sheetError.errors)) {
              allErrors.push(`[${sheetError.sheet}]:`);
              allErrors.push(
                ...sheetError.errors.slice(0, 5).map((e) => `  • ${e}`),
              );
              if (sheetError.errors.length > 5) {
                allErrors.push(
                  `  ... and ${sheetError.errors.length - 5} more errors`,
                );
              }
            }
          },
        );
      }

      // Add details errors if present
      if (json?.details?.sheets && Array.isArray(json.details.sheets)) {
        json.details.sheets.forEach((sheet: any) => {
          if (sheet.status === "failed" || sheet.errorCount > 0) {
            allErrors.push(
              `Sheet "${sheet.name}": ${sheet.status} (${sheet.errorCount} errors)`,
            );
          }
        });
      }

      if (!res.ok) {
        // Set main error message
        if (json?.error) {
          setMessage(
            `${json.error}${json.details ? `: ${typeof json.details === "string" ? json.details : ""}` : ""}`,
          );
        } else if (json?.message) {
          setMessage(json.message);
        } else {
          setMessage(`Upload failed with status ${res.status}`);
        }

        // Set collected errors
        if (allErrors.length > 0) {
          setErrors(allErrors);
        }

        // Still show results if available (for partial failures)
        if (json?.details && typeof json.details === "object") {
          setResults(json.details);
        }

        setIsSuccess(false);
        return;
      }

      // Success case
      if (json.success) {
        setMessage(json.message || "Import successful");
        setResults(json.details ?? null);
        setIsSuccess(true);
      } else {
        // Partial success
        setMessage(json.message || "Import completed with issues");
        if (allErrors.length > 0) {
          setErrors(allErrors);
        }
        setResults(json.details ?? null);
        setIsSuccess(false);
      }
    } catch (e) {
      clearInterval(progressInterval);
      console.error("Upload error:", e);
      setMessage((e as Error).message || "Network error");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      // Don't auto-upload, wait for user to click upload button
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setSelectedFile(f);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setMessage(null);
    setErrors(null);
    setResults(null);
    setUploadProgress(0);
    setIsSuccess(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"></div>
        <p className="text-gray-500 ml-14">
          Import properties data from Excel spreadsheets with ease
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8">
          {/* Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !loading && fileRef.current?.click()}
            className={`
              relative group cursor-pointer transition-all duration-300
              ${isDragging ? "scale-[1.02]" : "hover:scale-[1.01]"}
              ${loading ? "pointer-events-none" : ""}
            `}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onChange}
              className="hidden"
            />

            <div
              className={`
              relative flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed rounded-2xl transition-all duration-300
              ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50"
                  : selectedFile
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-gray-200 bg-gradient-to-b from-gray-50 to-white hover:border-emerald-300 hover:bg-emerald-50/30"
              }
            `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  className={`absolute inset-0 opacity-[0.03] transition-opacity duration-300 ${
                    isDragging ? "opacity-[0.08]" : ""
                  }`}
                >
                  <div className="absolute top-4 left-4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl" />
                  <div className="absolute bottom-4 right-4 w-40 h-40 bg-teal-500 rounded-full blur-3xl" />
                </div>
              </div>

              <div className="relative flex flex-col items-center p-8">
                {loading ? (
                  <>
                    {/* Loading State */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-2xl shadow-lg">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                      Processing your file...
                    </p>
                    <p className="text-gray-500">
                      This may take a moment depending on file size
                    </p>
                  </>
                ) : selectedFile ? (
                  <>
                    {/* Selected File State */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
                      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-2xl shadow-lg">
                        <FileCheck className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                      File ready to upload
                    </p>
                    <p className="text-gray-500">
                      Click the upload button to proceed
                    </p>
                  </>
                ) : (
                  <>
                    {/* Default State */}
                    <div
                      className={`relative mb-6 transition-transform duration-300 ${
                        isDragging
                          ? "scale-110 -translate-y-2"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-40" />
                      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-2xl shadow-lg">
                        <FileUp
                          className={`w-10 h-10 text-white transition-transform duration-300 ${
                            isDragging ? "animate-bounce" : ""
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                      {isDragging
                        ? "Drop your file here"
                        : "Drag & drop your Excel file"}
                    </p>
                    <p className="text-gray-500 mb-4">
                      or{" "}
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">
                        browse files
                      </span>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                        <Table className="w-4 h-4" />
                        .xlsx, .xls
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                        <HardDrive className="w-4 h-4" />
                        Max 10MB
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && !loading && !isSuccess && (
            <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="relative bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 rounded-xl p-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30" />

                <div className="relative flex items-center gap-5">
                  {/* File Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-emerald-500/25">
                      <FileSpreadsheet className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] font-bold text-white/80 uppercase">
                        {getFileExtension(selectedFile.name)}
                      </span>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-lg">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4" />
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Ready to upload
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && (
            <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Processing data...
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedFile?.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundSize: "200% 100%",
                    }}
                  />
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Reading file
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <span
                    className={`flex items-center gap-2 ${
                      uploadProgress > 30 ? "text-gray-700" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        uploadProgress > 30
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    />
                    Validating data
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <span
                    className={`flex items-center gap-2 ${
                      uploadProgress > 70 ? "text-gray-700" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        uploadProgress > 70
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    />
                    Importing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !loading && !isSuccess && (
            <div className="mt-6 flex gap-3 animate-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => handleFile(selectedFile)}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                Upload & Import Data
              </button>
              <button
                onClick={clearFile}
                className="px-6 py-4 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          )}

          {/* Success State */}
          {isSuccess && message && (
            <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Import Successful!
                    </h3>
                    <p className="text-gray-600">{message}</p>
                  </div>
                </div>

                {/* Results Summary */}
                {/* Results Summary */}
                {results && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Imported",
                          value:
                            results.summary?.totalImported ??
                            results.imported ??
                            "-",
                          icon: CheckCircle2,
                          color: "from-emerald-500 to-teal-500",
                        },
                        {
                          label: "Duplicates",
                          value: results.summary?.totalDuplicates ?? "-",
                          icon: Layers,
                          color: "from-blue-500 to-cyan-500",
                        },
                        {
                          label: "Skipped",
                          value:
                            results.summary?.totalSkipped ??
                            results.skipped ??
                            "-",
                          icon: XCircle,
                          color: "from-amber-500 to-orange-500",
                        },
                        {
                          label: "Errors",
                          value: results.summary?.totalErrors ?? "-",
                          icon: AlertCircle,
                          color: "from-red-400 to-rose-500",
                        },
                      ].map((stat, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color}`}
                            >
                              <stat.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm text-gray-500">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Sheet-by-sheet breakdown */}
                    {results.sheets && results.sheets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Sheet Details:
                        </h4>
                        {results.sheets.map((sheet, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              sheet.status === "success"
                                ? "bg-emerald-50 border-emerald-200"
                                : sheet.status === "partial"
                                  ? "bg-amber-50 border-amber-200"
                                  : sheet.status === "failed"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {sheet.status === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : sheet.status === "failed" ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="font-medium text-gray-800">
                                {sheet.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              {sheet.imported > 0 && (
                                <span className="text-emerald-600">
                                  {sheet.imported} imported
                                </span>
                              )}
                              {sheet.duplicates > 0 && (
                                <span className="text-blue-600">
                                  {sheet.duplicates} duplicates
                                </span>
                              )}
                              {sheet.skipped > 0 && (
                                <span className="text-amber-600">
                                  {sheet.skipped} skipped
                                </span>
                              )}
                              {sheet.errorCount > 0 && (
                                <span className="text-red-600">
                                  {sheet.errorCount} errors
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detailed Results Toggle */}
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {showDetails ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Raw Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Raw Details
                        </>
                      )}
                    </button>

                    {showDetails && (
                      <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h4 className="font-medium text-gray-700">
                              Raw Response
                            </h4>
                          </div>
                          <div className="p-4 max-h-64 overflow-auto">
                            <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                              {JSON.stringify(results, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Another Button */}
                <button
                  onClick={clearFile}
                  className="w-full mt-6 px-6 py-4 font-semibold rounded-xl border-2 border-dashed border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Another File
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {message && !isSuccess && !loading && (
            <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl shadow-lg shadow-red-500/25">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-1">
                      Import Failed
                    </h3>
                    <p className="text-red-600">{message}</p>
                  </div>
                  <button
                    onClick={() => setMessage(null)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Errors List */}
          {errors && errors.length > 0 && (
            <div className="mt-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">
                    {errors.length} Error{errors.length > 1 ? "s" : ""} Found
                  </h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-red-700">{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">File Requirements</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                Supported Formats
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Microsoft Excel (.xlsx)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Legacy Excel (.xls)
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Best Practices
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Include proper column headers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Fill all required fields
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                File Limits
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Maximum file size: 10 MB
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  One file at a time
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Common Issues
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Check for empty required cells
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Verify data format matches
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Download Template Section */}
        <div className="px-6 py-4 bg-white/40 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Need a template to get started?
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-all">
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
