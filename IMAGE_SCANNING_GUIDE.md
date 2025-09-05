# 📸 Image Scanning Feature

## How to Use the Sudoku Image Scanner

### 1. **Select Grid Size**
- Choose your desired grid size (4×4, 6×6, or 9×9)
- The image scanner will automatically appear

### 2. **Scan Sudoku Image**
- Click "📸 Scan Image" button to show the image uploader
- Click "📤 Choose Image" to select a Sudoku puzzle image
- Supported formats: JPG, PNG, WEBP, etc.

### 3. **Image Requirements**
For best results, your image should have:
- **Clear, high-contrast text** (dark numbers on white background)
- **Straight, aligned grid** (not skewed or rotated)
- **Good lighting** (no shadows or glare)
- **Minimal background noise**
- **Numbers clearly separated** in grid cells

### 4. **Processing Steps**
1. **Upload**: Select an image file
2. **Preview**: See your image thumbnail
3. **Scan**: Click "🔍 Scan Grid" to process
4. **Auto-fill**: Grid automatically fills if valid puzzle detected

### 5. **Validation**
The scanner checks if:
- ✅ Correct grid size detected
- ✅ Valid numbers for grid type (1-4 for 4×4, 1-6 for 6×6, 1-9 for 9×9)
- ✅ No immediate Sudoku rule violations
- ✅ Sufficient numbers detected (not completely empty)

### 6. **After Successful Scan**
- Grid automatically fills with detected numbers
- Image uploader hides
- Use "🧠 Solve / Generate" to solve the puzzle
- Or manually edit cells if needed

### 7. **If Scan Fails**
- Error message explains the issue
- Try a clearer, higher quality image
- Ensure grid is properly aligned
- Check that numbers are clearly visible

### 8. **Tips for Better Results**

#### ✅ Good Images:
- High resolution screenshots
- Scanned documents with good contrast
- Photos taken directly overhead
- Clean, printed Sudoku puzzles

#### ❌ Avoid:
- Blurry or low-resolution images
- Handwritten numbers (may not be recognized)
- Skewed or angled photos
- Images with poor lighting
- Puzzles with decorative backgrounds

### 9. **Manual Controls**
- **Toggle Scanner**: Show/hide uploader anytime
- **Clear Grid**: Reset and show scanner again
- **Sample Puzzle**: Load pre-made puzzle (hides scanner)

### 10. **Technical Details**
- Uses **Tesseract.js OCR** for text recognition
- **Image preprocessing** for better detection
- **Smart grid extraction** algorithm
- **Sudoku validation** before auto-filling

---

**🎯 Pro Tip**: For mobile users, take photos with good lighting and hold the camera steady for best results!
