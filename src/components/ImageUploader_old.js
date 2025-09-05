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
  gap: 10px;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #bdc3c7;
`;

const ProcessButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(39, 174, 96, 0.3);
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

  const preprocessImageForOCR = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Step 1: Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Step 2: Apply contrast enhancement
    const contrast = 1.5;
    const brightness = 10;
    for (let i = 0; i < data.length; i += 4) {
      let value = data[i];
      value = Math.max(0, Math.min(255, contrast * value + brightness));
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }

    // Step 3: Apply threshold for binary image
    const threshold = 128;
    for (let i = 0; i < data.length; i += 4) {
      const binary = data[i] > threshold ? 255 : 0;
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }

    ctx.putImageData(imageData, 0, 0);

    // Step 4: Scale up for better OCR recognition
    const scaleFactor = 3;
    const scaledCanvas = document.createElement('canvas');
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCanvas.width = canvas.width * scaleFactor;
    scaledCanvas.height = canvas.height * scaleFactor;
    
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    
    return scaledCanvas;
  }, []);

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

  const extractGridFromOCR = useCallback((text, gridSize) => {
    console.log('Raw OCR Text:', text);
    console.log('Text length:', text.length);
    
    // Extract all digits (including 0) from the text
    const allDigits = text.match(/[0-9]/g) || [];
    console.log('All digits found:', allDigits);
    
    // Filter to only valid Sudoku numbers (1-gridSize) and convert 0s to empty
    const validDigits = allDigits.map(digit => {
      const num = parseInt(digit, 10);
      return (num >= 1 && num <= gridSize) ? num : 0;
    });
    
    console.log('Valid digits for grid:', validDigits);
    
    // Create grid
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Fill grid with extracted numbers
    let digitIndex = 0;
    let filledCells = 0;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (digitIndex < validDigits.length) {
          const digit = validDigits[digitIndex];
          grid[row][col] = digit;
          if (digit !== 0) {
            filledCells++;
            console.log(`Placed ${digit} at (${row}, ${col})`);
          }
          digitIndex++;
        }
      }
    }
    
    console.log('Final extracted grid:', grid);
    console.log('Total filled cells:', filledCells);
    
    return grid;
  }, []);

  const validateGrid = useCallback((grid, gridSize) => {
    console.log('Validating grid:', grid);
    
    // Check if grid has the right dimensions
    if (!grid || grid.length !== gridSize || !grid.every(row => row && row.length === gridSize)) {
      console.log('Invalid dimensions');
      return false;
    }
    
    // Check if we have at least some numbers filled (very lenient threshold)
    const filledCells = grid.flat().filter(cell => cell !== 0).length;
    const minFilledCells = Math.max(1, Math.floor(gridSize * gridSize * 0.05)); // At least 5% or 1 cell
    console.log(`Filled cells: ${filledCells}, minimum required: ${minFilledCells}`);
    
    if (filledCells < minFilledCells) {
      console.log('Not enough filled cells');
      return false;
    }
    
    // Check if all numbers are within valid range
    const invalidNumbers = grid.flat().filter(cell => cell < 0 || cell > gridSize);
    if (invalidNumbers.length > 0) {
      console.log('Invalid numbers found:', invalidNumbers);
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
      // Create canvas for image preprocessing
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
        
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          setProgress(25);
          setStatus({ type: 'info', message: 'Running OCR...' });
          
          // Try multiple OCR approaches to capture more numbers
          let allDetectedDigits = [];
          let bestConfidence = 0;
          let bestText = '';
          
          // Approach 1: Try with preprocessed image
          try {
            console.log('OCR Attempt 1: Preprocessed image...');
            const processedCanvas = preprocessImageForOCR(canvas);
            
            const result1 = await Tesseract.recognize(
              processedCanvas,
              'eng',
              {
                logger: m => {
                  if (m.status === 'recognizing text') {
                    setProgress(25 + (m.progress * 20));
                  }
                },
                tessedit_char_whitelist: '123456789 ',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
                tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
              }
            );
            
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
          
          // Approach 2: Try with original image
          try {
            console.log('OCR Attempt 2: Original image...');
            setStatus({ type: 'info', message: 'Trying alternative OCR approach...' });
            
            const result2 = await Tesseract.recognize(
              canvas,
              'eng',
              {
                logger: m => {
                  if (m.status === 'recognizing text') {
                    setProgress(45 + (m.progress * 20));
                  }
                },
                tessedit_char_whitelist: '123456789',
                tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT
              }
            );
            
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
          
          // Approach 3: Try with different preprocessing
          try {
            console.log('OCR Attempt 3: High contrast preprocessing...');
            setStatus({ type: 'info', message: 'Trying high contrast OCR...' });
            
            // Create high contrast version
            const highContrastCanvas = document.createElement('canvas');
            const hcCtx = highContrastCanvas.getContext('2d');
            highContrastCanvas.width = canvas.width * 2;
            highContrastCanvas.height = canvas.height * 2;
            
            hcCtx.imageSmoothingEnabled = false;
            hcCtx.drawImage(canvas, 0, 0, highContrastCanvas.width, highContrastCanvas.height);
            
            const imageData = hcCtx.getImageData(0, 0, highContrastCanvas.width, highContrastCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const enhanced = gray > 100 ? 255 : 0; // More aggressive threshold
              data[i] = data[i + 1] = data[i + 2] = enhanced;
            }
            
            hcCtx.putImageData(imageData, 0, 0);
            
            const result3 = await Tesseract.recognize(
              highContrastCanvas,
              'eng',
              {
                logger: m => {
                  if (m.status === 'recognizing text') {
                    setProgress(65 + (m.progress * 15));
                  }
                },
                tessedit_char_whitelist: '123456789',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR
              }
            );
            
            console.log('OCR Attempt 3 - Text:', result3.data.text);
            console.log('OCR Attempt 3 - Confidence:', result3.data.confidence);
            
            if (result3.data.text && result3.data.text.trim().length > 0) {
              const digits3 = result3.data.text.match(/[1-9]/g) || [];
              allDetectedDigits.push(...digits3);
              if (result3.data.confidence > bestConfidence) {
                bestConfidence = result3.data.confidence;
                bestText = result3.data.text;
              }
            }
          } catch (error) {
            console.log('OCR Attempt 3 failed:', error.message);
          }
          
          // Combine all detected digits
          console.log('All detected digits from all attempts:', allDetectedDigits);
          const uniqueDigits = [...new Set(allDetectedDigits)];
          console.log('Unique digits found:', uniqueDigits);
          
          // Use the best text, but supplement with all found digits
          let finalText = bestText;
          if (uniqueDigits.length > (bestText.match(/[1-9]/g) || []).length) {
            // If we found more unique digits across attempts, create a combined text
            finalText = uniqueDigits.join(' ');
            console.log('Using combined digits approach for better coverage');
          }
          
          console.log('Final OCR text:', finalText);
          console.log('Best confidence:', bestConfidence);
                }
              );
              
              console.log('OCR Attempt 2 - Text:', result2.data.text);
              console.log('OCR Attempt 2 - Confidence:', result2.data.confidence);
              
              if (result2.data.confidence > confidence) {
                ocrText = result2.data.text;
                confidence = result2.data.confidence;
              }
            } catch (error) {
              console.log('OCR Attempt 2 failed:', error.message);
            }
          }
          
          // Check if we got any usable text
          if (!ocrText || ocrText.trim().length === 0) {
            throw new Error('No numbers detected in the image. Please ensure the image contains a clear Sudoku grid with visible numbers.');
          }
          
          console.log('OCR completed successfully');
          console.log('Final OCR Text:', ocrText);
          console.log('Final OCR Confidence:', confidence);
          
          setProgress(90);
          setStatus({ type: 'info', message: 'Extracting grid...' });
          
          // Extract grid from OCR result
          console.log('Starting grid extraction...');
          const extractedGrid = extractGridFromOCR(ocrText, gridSize);
          console.log('Grid extraction completed:', extractedGrid);
          
          setProgress(90);
          setStatus({ type: 'info', message: 'Validating grid...' });
          
          // Validate the extracted grid
          console.log('Starting grid validation...');
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
          
          console.log('Image processing completed successfully');
          setIsProcessing(false);
          
        } catch (processingError) {
          console.error('Error in image processing pipeline:', processingError);
          setIsProcessing(false);
          
          // Provide more specific error messages
          if (processingError.message.includes('Unable to detect any text')) {
            setStatus({ type: 'error', message: 'No numbers detected in the image after multiple attempts. Please ensure your image shows a clear Sudoku grid with visible numbers.' });
          } else if (processingError.message.includes('timeout')) {
            setStatus({ type: 'error', message: 'OCR processing timed out. Please try with a smaller or clearer image.' });
          } else {
            setStatus({ type: 'error', message: 'Failed to read numbers from image. Try using an image with better lighting and contrast.' });
          }
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
