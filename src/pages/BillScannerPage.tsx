import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../lib/store';
import { Camera, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanImage, terminateOCR } from '../lib/ocr';

export function BillScannerPage() {
  const navigate = useNavigate();
  const { categories, accounts, defaultCurrency } = useExpenseStore();
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id || '');
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || '');
  const [notes, setNotes] = React.useState('');
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ocrText, setOcrText] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    return () => {
      terminateOCR();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processImage(file);
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not access camera');
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        await processImage(blob);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    }, 'image/jpeg', 0.95);
  };

  const processImage = async (imageData: Blob | File) => {
    try {
      setScanning(true);
      setError(null);
      setOcrText('');

      const { amount: detectedAmount, text } = await scanImage(imageData);
      setOcrText(text);

      if (detectedAmount) {
        setAmount(detectedAmount);
        toast.success('Amount detected successfully');
      } else {
        setError('Could not detect amount. Please enter manually.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Could not process image. Please try again or enter amount manually.');
      toast.error('Failed to process image');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/add', { 
      state: { 
        amount: parseFloat(amount.replace(',', '.')),
        categoryId,
        accountId,
        notes: notes || 'Scanned bill',
      } 
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Scan Bill</h1>
      <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors"
          >
            <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Upload Image</span>
          </button>
          <button
            onClick={handleCamera}
            className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors"
          >
            <Camera className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Use Camera</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <video
          ref={videoRef}
          className={`w-full rounded-lg mb-4 ${videoRef.current?.srcObject ? 'block' : 'hidden'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {videoRef.current?.srcObject && (
          <button
            onClick={captureImage}
            className="w-full mb-4 rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
          >
            Capture Image
          </button>
        )}

        {scanning && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing image...</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {ocrText && (
          <div className="mb-4 rounded-md bg-gray-50 dark:bg-gray-700/50 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recognized Text:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {ocrText}
            </pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount ({defaultCurrency.symbol})
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-green-600 to-yellow-500 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-yellow-600"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}