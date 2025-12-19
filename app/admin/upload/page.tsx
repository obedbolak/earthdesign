// app/upload/page.tsx     ← create this file (or wherever you want the page)

"use client"

import { useState } from "react"

export default function UploadExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".xls")) {
        setError("Please select an Excel file (.xlsx or .xls)")
        setFile(null)
        setFileName("")
        return
      }
      setFile(selected)
      setFileName(selected.name)
      setError(null)
      setSuccess(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      if (!dropped.name.endsWith(".xlsx") && !dropped.name.endsWith(".xls")) {
        setError("Please drop an Excel file (.xlsx or .xls)")
        return
      }
      setFile(dropped)
      setFileName(dropped.name)
      setError(null)
      setSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append("excelFile", file)

    try {
      const res = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Upload failed")

      setSuccess(true)
      setFile(null)
      setFileName("")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Upload Your Excel File
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Import regions, lots, parcels & more in one click
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
            ${file ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
            ${uploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          {!file ? (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m4.5-6l-6 6m0-6l6 6"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Drag & drop your Excel file here
              </p>
              <p className="text-gray-500 text-sm">or</p>
              <label className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition">
                Browse file
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <p className="font-medium text-green-700">{fileName}</p>
              <p className="text-sm text-gray-600">Ready to upload</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
        )}

        {success && (
          <p className="mt-4 text-green-600 text-center font-medium">
            ✓ Upload successful! Data imported.
          </p>
        )}

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-6 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all
              ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
            `}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Uploading…
              </div>
            ) : (
              "Upload & Import Now"
            )}
          </button>
        )}
      </div>
    </div>
  )
}