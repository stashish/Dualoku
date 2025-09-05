import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import Tesseract from 'tesseract.js';

const ImageUploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  padding: 20px;
  border: 2px dashed #3498db;
  border-radius: 10px;
  background: rgba(52, 152, 219, 0.05);
`;

const UploadTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0;
  text-align: center;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const PreviewImage = styled.img`
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ProcessButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div`
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  background: ${props => 
    props.type === 'error' ? '#fdf2f2' : 
    props.type === 'success' ? '#f0f9ff' : 
    props.type === 'warning' ? '#fff8e1' : 
    '#fff3cd'
  };
  color: ${props => 
    props.type === 'error' ? '#e74c3c' : 
    props.type === 'success' ? '#2980b9' : 
    props.type === 'warning' ? '#e65100' : 
    '#856404'
  };
  border: 1px solid ${props => 
    props.type === 'error' ? '#e74c3c' : 
    props.type === 'success' ? '#3498db' : 
    props.type === 'warning' ? '#ff9800' : 
    '#ffc107'
  };
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2980b9);
    transition: width 0.3s ease;
  }
`;

const ImageUploader = ({ gridSize, onGridDetected }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStatus(null);
    } else {
      setStatus({ type: 'error', message: 'Please select a valid image file' });
    }
  }, []);

  const preprocessImageForOCR = useCallback((canvas) => {
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    
    // Scale up for better OCR
    const scale = 3;
    newCanvas.width = canvas.width * scale;
    newCanvas.height = canvas.height * scale;
    
    // Draw scaled image
    newCtx.imageSmoothingEnabled = false;
    newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
    
    const imageData = newCtx.getImageData(0, 0, newCanvas.width, newCanvas.height);
    const data = imageData.data;
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    
    // Apply adaptive threshold
    for (let i = 0; i < data.length; i += 4) {
      const enhanced = data[i] > 140 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = enhanced;
    }
    
    newCtx.putImageData(imageData, 0, 0);
    return newCanvas;
  }, []);

  const extractGridFromOCR = useCallback((text, gridSize) => {
    console.log('Raw OCR Text:', text);
    
    // Extract all digits from the text
    const allDigits = text.match(/[1-9]/g) || [];
    console.log('All digits found:', allDigits);
    
    // Create grid
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Fill grid with extracted numbers
    let digitIndex = 0;
    
    for (let row = 0; row < gridSize && digitIndex < allDigits.length; row++) {
      for (let col = 0; col < gridSize && digitIndex < allDigits.length; col++) {
        const digit = parseInt(allDigits[digitIndex], 10);
        
        // Only accept valid numbers for the grid size
        if (!isNaN(digit) && digit >= 1 && digit <= gridSize) {
          grid[row][col] = digit;
        }
        digitIndex++;
      }
    }
    
    console.log('Extracted grid:', grid);
    return grid;
  }, []);

  const validateGrid = useCallback((grid, gridSize) => {
    console.log('Validating grid:', grid);
    
    // Check if grid has the right dimensions
    if (!grid || grid.length !== gridSize || !grid.every(row => row && row.length === gridSize)) {
      console.log('Invalid dimensions');
      return false;
    }
    
    // Check if we have at least some numbers filled
    const filledCells = grid.flat().filter(cell => cell !== 0).length;
    const minFilledCells = Math.max(2, Math.floor(gridSize * gridSize * 0.1));
    console.log(`Filled cells: ${filledCells}, minimum required: ${minFilledCells}`);
    
    if (filledCells < minFilledCells) {
      console.log('Not enough filled cells');
      return false;
    }
    
    console.log('Grid validation passed!');
    return true;
  }, []);

  const processImage = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus({ type: 'info', message: 'Processing image...' });

    try {
      const img = new Image();
      
      img.onerror = () => {
        console.error('Failed to load image');
        setStatus({ type: 'error', message: 'Failed to load image. Please try with a different image.' });
        setIsProcessing(false);
      };
      
      img.onload = async () => {
        try {
          console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
        
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          setProgress(25);
          setStatus({ type: 'info', message: 'Running OCR analysis...' });
          
          // Try multiple OCR approaches to capture more numbers
          let allDetectedDigits = [];
          let bestConfidence = 0;
          let bestText = '';
          
          // Approach 1: Preprocessed image
          try {
            console.log('OCR Attempt 1: Preprocessed image...');
            const processedCanvas = preprocessImageForOCR(canvas);
            
            const result1 = await Tesseract.recognize(processedCanvas, 'eng', {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setProgress(25 + (m.progress * 25));
                }
              },
              tessedit_char_whitelist: '123456789',
              tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            });
            
            console.log('OCR Attempt 1 - Text:', result1.data.text);
            console.log('OCR Attempt 1 - Confidence:', result1.data.confidence);
            
            if (result1.data.text && result1.data.text.trim().length > 0) {
              const digits1 = result1.data.text.match(/[1-9]/g) || [];
              allDetectedDigits.push(...digits1);
              if (result1.data.confidence > bestConfidence) {
                bestConfidence = result1.data.confidence;
                bestText = result1.data.text;
              }
            }
          } catch (error) {
            console.log('OCR Attempt 1 failed:', error.message);
          }
          
          // Approach 2: Original image
          try {
            console.log('OCR Attempt 2: Original image...');
            setStatus({ type: 'info', message: 'Trying alternative OCR approach...' });
            
            const result2 = await Tesseract.recognize(canvas, 'eng', {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setProgress(50 + (m.progress * 25));
                }
              },
              tessedit_char_whitelist: '123456789',
              tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT
            });
            
            console.log('OCR Attempt 2 - Text:', result2.data.text);
            console.log('OCR Attempt 2 - Confidence:', result2.data.confidence);
            
            if (result2.data.text && result2.data.text.trim().length > 0) {
              const digits2 = result2.data.text.match(/[1-9]/g) || [];
              allDetectedDigits.push(...digits2);
              if (result2.data.confidence > bestConfidence) {
                bestConfidence = result2.data.confidence;
                bestText = result2.data.text;
              }
            }
          } catch (error) {
            console.log('OCR Attempt 2 failed:', error.message);
          }
          
          // Combine all detected digits
          console.log('All detected digits from all attempts:', allDetectedDigits);
          const uniqueDigits = [...new Set(allDetectedDigits)];
          console.log('Unique digits found:', uniqueDigits);
          
          // Use combined approach for better coverage
          let finalText = uniqueDigits.length > 0 ? uniqueDigits.join(' ') : bestText;
          console.log('Final OCR text:', finalText);
          
          if (!finalText || finalText.trim().length === 0) {
            throw new Error('No numbers detected in the image. Please ensure the image contains a clear Sudoku grid with visible numbers.');
          }
          
          setProgress(75);
          setStatus({ type: 'info', message: 'Extracting grid...' });
          
          // Extract grid from OCR result
          const extractedGrid = extractGridFromOCR(finalText, gridSize);
          
          setProgress(90);
          setStatus({ type: 'info', message: 'Validating grid...' });
          
          // Validate the extracted grid
          if (validateGrid(extractedGrid, gridSize)) {
            setProgress(100);
            setStatus({ type: 'success', message: `Valid ${gridSize}×${gridSize} Sudoku grid detected!` });
            console.log('Calling onGridDetected with valid grid:', extractedGrid);
            onGridDetected(extractedGrid);
          } else {
            // Even if validation fails, let's still show what we found
            console.log('Grid validation failed, but showing detected grid anyway');
            const filledCells = extractedGrid.flat().filter(cell => cell !== 0).length;
            setProgress(100);
            setStatus({ 
              type: 'warning', 
              message: `Detected ${filledCells} numbers in a ${gridSize}×${gridSize} grid. The grid may be incomplete - please verify and fill missing numbers manually.` 
            });
            console.log('Calling onGridDetected with incomplete grid:', extractedGrid);
            onGridDetected(extractedGrid);
          }
          
          setIsProcessing(false);
        } catch (processingError) {
          console.error('Error in image processing pipeline:', processingError);
          setIsProcessing(false);
          setStatus({ 
            type: 'error', 
            message: processingError.message || 'Error processing image. Please try again with a clearer image.' 
          });
        }
      };
      
      img.src = previewUrl;
      
    } catch (error) {
      console.error('Error setting up image processing:', error);
      setIsProcessing(false);
      setStatus({ type: 'error', message: 'Failed to set up image processing. Please try again.' });
    }
  }, [selectedFile, previewUrl, gridSize, preprocessImageForOCR, extractGridFromOCR, validateGrid, onGridDetected]);

  return (
    <ImageUploaderContainer>
      <UploadTitle>📸 Upload Sudoku Image</UploadTitle>
      
      <FileInput
        type="file"
        id="sudoku-image"
        accept="image/*"
        onChange={handleFileSelect}
      />
      
      <UploadButton htmlFor="sudoku-image">
        📤 Choose Image
      </UploadButton>
      
      {previewUrl && (
        <PreviewContainer>
          <PreviewImage src={previewUrl} alt="Sudoku preview" />
          <ProcessButton 
            onClick={processImage} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : '🔍 Scan Grid'}
          </ProcessButton>
        </PreviewContainer>
      )}
      
      {isProcessing && (
        <ProgressBar progress={progress} />
      )}
      
      {status && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}
    </ImageUploaderContainer>
  );
};

export default ImageUploader;
