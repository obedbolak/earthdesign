// app/upload/page.tsx
"use client";

import { useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default function UploadExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const checkFile = (f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      setError("Please select an Excel file (.xlsx or .xls)");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File must be ≤ 10 MB");
      return;
    }
    setFile(f);
    setFileName(f.name);
    setError(null);
    setResponse(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) checkFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) checkFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      const res = await fetch("/api/upload-excel", { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data);
      if (!res.ok) setError(data.message || "Upload failed");
      else { setFile(null); setFileName(""); }
    } catch (err: any) {
      setError(err.message || "Network error");
      setResponse(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Excel File</h1>
          <p className="text-gray-500">Import regions, lots, parcels, buildings & properties</p>
        </div>

        <div
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
            ${file ? "border-green-400 bg-green-50" : isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
            ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
          `}
        >
          {!file ? (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-1">Drag & drop your Excel file here</p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                Browse Files
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-4">Supports .xlsx and .xls files (max 10 MB)</p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-green-700">{fileName}</p>
              <p className="text-sm text-gray-600">File ready to upload</p>
              <button
                onClick={() => { setFile(null); setFileName(""); setResponse(null); }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div><p className="text-red-800 font-medium">{error}</p></div>
            </div>
          </div>
        )}

        {response?.success === false && response.errors?.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
            <div className="flex items-start mb-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-orange-800 mb-2">Import completed with errors</p>
                <ul className="text-sm text-orange-700 space-y-1 max-h-60 overflow-y-auto">
                  {response.errors.map((err: string, i: number) => (
                    <li key={i} className="flex items-start"><span className="mr-2">•</span><span>{err}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            {response.imported?.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium text-orange-800 hover:text-orange-900 text-sm">
                  View successful imports ({response.imported.length})
                </summary>
                <ul className="mt-2 text-sm text-green-700 space-y-1 pl-4">
                  {response.imported.map((msg: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {response?.success === true && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start mb-3">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-green-800 font-semibold text-lg">{response.message}</p>
                <p className="text-green-700 text-sm mt-1">All data has been imported successfully</p>
              </div>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer font-medium text-green-800 hover:text-green-900 text-sm">
                View import details ({response.details?.length || 0} sheets)
              </summary>
              <ul className="mt-3 text-sm text-green-700 space-y-2 pl-4">
                {response.details?.map((msg: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading || isDragging}
            className={`mt-6 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow-lg
              ${uploading || isDragging ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl transform hover:-translate-y-0.5"}
            `}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Uploading & Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload & Import Data</span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}