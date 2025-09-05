import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import SudokuGrid from './components/SudokuGrid';
import GridSelector from './components/GridSelector';
import SolverButton from './components/SolverButton';
import PlayControls from './components/PlayControls';
import ModeSelector from './components/ModeSelector';
import ImageUploader from './components/ImageUploader';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* Use dynamic viewport height for mobile */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  @media (max-width: 768px) {
    padding: 10px;
    min-height: 100vh;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: clamp(2rem, 8vw, 3rem);
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  text-align: center;
  
  @media (max-width: 480px) {
    margin-bottom: 15px;
  }
`;

const GameContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  max-width: 600px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 0 10px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    border-radius: 15px;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 15px;
    margin-bottom: 20px;
  }
`;

function App() {
  const [mode, setMode] = useState(null); // 'play' or 'solve'
  const [gridSize, setGridSize] = useState(null); // No default grid size
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [originalGrid, setOriginalGrid] = useState([]); // Track original numbers for highlighting
  const [manuallyEnteredCells, setManuallyEnteredCells] = useState([]); // Track which cells were manually entered by user
  const [puzzleGrid, setPuzzleGrid] = useState([]); // For play mode - stores the initial puzzle
  const [lockedCells, setLockedCells] = useState([]); // For play mode - cells that can't be edited
  const [hintCount, setHintCount] = useState(0); // Track hints used
  const [incorrectCells, setIncorrectCells] = useState([]); // Track incorrect cells for check feature
  const [selectedCell, setSelectedCell] = useState(null);
  const [showImageUploader, setShowImageUploader] = useState(false);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    // Reset all states when changing mode
    setGridSize(null);
    setSudokuGrid([]);
    setOriginalGrid([]);
    setManuallyEnteredCells([]);
    setPuzzleGrid([]);
    setLockedCells([]);
    setHintCount(0);
    setIncorrectCells([]);
    setSelectedCell(null);
    setShowImageUploader(false);
  }, []);

  const handleGridSizeChange = useCallback((newSize) => {
    setGridSize(newSize);
    const newGrid = Array(newSize).fill().map(() => Array(newSize).fill(0));
    setSudokuGrid(newGrid);
    setOriginalGrid(newGrid.map(row => [...row])); // Initialize original grid
    setManuallyEnteredCells(Array(newSize).fill().map(() => Array(newSize).fill(false))); // Initialize manual entry tracking
    
    // Initialize play mode specific states
    if (mode === 'play') {
      setPuzzleGrid(newGrid.map(row => [...row]));
      setLockedCells(Array(newSize).fill().map(() => Array(newSize).fill(false)));
      setHintCount(0);
      setIncorrectCells([]);
    }
    
    setSelectedCell(null);
    setShowImageUploader(false);
  }, [mode]);

  const handleGridDetected = useCallback((detectedGrid) => {
    console.log('handleGridDetected called with:', detectedGrid);
    setSudokuGrid(detectedGrid);
    setOriginalGrid(detectedGrid.map(row => [...row])); // Mark detected numbers as original
    setManuallyEnteredCells(Array(detectedGrid.length).fill().map(() => Array(detectedGrid.length).fill(false))); // Reset manual entry tracking
    setSelectedCell(null);
    setShowImageUploader(false); // Hide uploader after successful detection
    console.log('Grid state updated successfully');
  }, []);

  const handleCellChange = useCallback((row, col, value) => {
    const newGrid = sudokuGrid.map(r => [...r]);
    newGrid[row][col] = value;
    setSudokuGrid(newGrid);
    
    // Mark this cell as manually entered by the user
    const newManuallyEnteredCells = manuallyEnteredCells.map(r => [...r]);
    newManuallyEnteredCells[row][col] = value !== 0; // True if user entered a number, false if cleared
    setManuallyEnteredCells(newManuallyEnteredCells);
  }, [sudokuGrid, manuallyEnteredCells]);

  const handleCellSelect = useCallback((row, col) => {
    setSelectedCell({ row, col });
  }, []);

  const generateTestPuzzle = useCallback(() => {
    let puzzle;
    
    if (gridSize === 4) {
      // Simple 4x4 test puzzle
      puzzle = [
        [1, 0, 0, 4],
        [0, 3, 4, 0],
        [0, 4, 1, 0],
        [3, 0, 0, 2]
      ];
    } else if (gridSize === 6) {
      // Simple 6x6 test puzzle (2x3 boxes)
      puzzle = [
        [1, 2, 0, 0, 0, 6],
        [0, 0, 6, 0, 0, 1],
        [0, 5, 0, 0, 4, 0],
        [0, 4, 0, 0, 5, 0],
        [6, 0, 0, 1, 0, 0],
        [5, 0, 0, 0, 6, 4]
      ];
    } else {
      // Very simple 9x9 test puzzle (easier to solve)
      puzzle = [
        [1, 0, 0, 4, 0, 0, 7, 0, 0],
        [0, 2, 0, 0, 5, 0, 0, 8, 0],
        [0, 0, 3, 0, 0, 6, 0, 0, 9],
        [4, 0, 0, 7, 0, 0, 1, 0, 0],
        [0, 5, 0, 0, 8, 0, 0, 2, 0],
        [0, 0, 6, 0, 0, 9, 0, 0, 3],
        [7, 0, 0, 1, 0, 0, 4, 0, 0],
        [0, 8, 0, 0, 2, 0, 0, 5, 0],
        [0, 0, 9, 0, 0, 3, 0, 0, 6]
      ];
    }
    
    setSudokuGrid(puzzle);
    setOriginalGrid(puzzle.map(row => [...row])); // Mark test puzzle numbers as original
    setManuallyEnteredCells(Array(gridSize).fill().map(() => Array(gridSize).fill(false))); // Reset manual entry tracking
    setSelectedCell(null);
    setShowImageUploader(false); // Hide uploader when test puzzle is loaded
  }, [gridSize]);

  const handleToggleImageUploader = useCallback(() => {
    setShowImageUploader(prev => !prev);
  }, []);

  const handleClearGrid = useCallback(() => {
    if (gridSize) {
      if (mode === 'play') {
        // In play mode, only clear user-entered cells, keep the puzzle cells
        const clearedGrid = sudokuGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => 
            lockedCells[rowIndex][colIndex] ? cell : 0
          )
        );
        setSudokuGrid(clearedGrid);
        setManuallyEnteredCells(Array(gridSize).fill().map(() => Array(gridSize).fill(false)));
        setIncorrectCells([]);
      } else {
        // In solve mode, clear everything
        const emptyGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        setSudokuGrid(emptyGrid);
        setOriginalGrid(emptyGrid.map(row => [...row]));
        setManuallyEnteredCells(Array(gridSize).fill().map(() => Array(gridSize).fill(false)));
      }
      setSelectedCell(null);
      setShowImageUploader(false);
    }
  }, [gridSize, mode, sudokuGrid, lockedCells]);

  const getBoxDimensions = useCallback((size) => {
    if (size === 4) return { rows: 2, cols: 2 };
    if (size === 6) return { rows: 2, cols: 3 };
    if (size === 9) return { rows: 3, cols: 3 };
    // Default for other sizes (assuming perfect squares)
    const sqrt = Math.sqrt(size);
    return { rows: sqrt, cols: sqrt };
  }, []);

  const isValidMove = useCallback((grid, row, col, num) => {
    const size = grid.length;
    const { rows: boxRows, cols: boxCols } = getBoxDimensions(size);
    
    // Check if num is already in the row
    for (let x = 0; x < size; x++) {
      if (grid[row][x] === num) {
        return false;
      }
    }
    
    // Check if num is already in the column
    for (let x = 0; x < size; x++) {
      if (grid[x][col] === num) {
        return false;
      }
    }
    
    // Check if num is already in the box
    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;
    
    for (let i = 0; i < boxRows; i++) {
      for (let j = 0; j < boxCols; j++) {
        if (grid[startRow + i][startCol + j] === num) {
          return false;
        }
      }
    }
    
    return true;
  }, [getBoxDimensions]);

  const isGridEmpty = useCallback((grid) => {
    return grid.every(row => row.every(cell => cell === 0));
  }, []);

  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const generateRandomSolution = useCallback((grid) => {
    const size = grid.length;
    
    // Find next empty cell
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          // Create a shuffled array of numbers to try randomly
          const numbers = shuffleArray(Array.from({ length: size }, (_, i) => i + 1));
          
          // Try each number in random order
          for (let num of numbers) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              
              // Recursively solve the rest
              if (generateRandomSolution(grid)) {
                return true;
              }
              
              // Backtrack
              grid[row][col] = 0;
            }
          }
          // If no number works, return false
          return false;
        }
      }
    }
    // If no empty cells found, puzzle is solved
    return true;
  }, [isValidMove, shuffleArray]);

  const findBestCell = useCallback((grid) => {
    const size = grid.length;
    let bestCell = null;
    let minPossibilities = size + 1;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          let possibilities = 0;
          for (let num = 1; num <= size; num++) {
            if (isValidMove(grid, row, col, num)) {
              possibilities++;
            }
          }
          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = { row, col, possibilities };
            if (possibilities === 0) {
              return bestCell; // No possibilities, early exit
            }
          }
        }
      }
    }
    return bestCell;
  }, [isValidMove]);

  const solveSudoku = useCallback((grid) => {
    const size = grid.length;
    let attempts = 0;
    const maxAttempts = size * size * size; // Reasonable limit to prevent infinite loops
    
    const solveRecursive = (grid) => {
      attempts++;
      if (attempts > maxAttempts) {
        console.log('Max attempts reached, stopping solver');
        return false;
      }
      
      // Find the best empty cell (with least possibilities)
      const bestCell = findBestCell(grid);
      if (!bestCell) {
        return true; // No empty cells, puzzle solved
      }
      
      if (bestCell.possibilities === 0) {
        return false; // No valid moves possible
      }
      
      const { row, col } = bestCell;
      
      // Try each number from 1 to size
      for (let num = 1; num <= size; num++) {
        if (isValidMove(grid, row, col, num)) {
          grid[row][col] = num;
          
          // Recursively solve the rest
          if (solveRecursive(grid)) {
            return true;
          }
          
          // Backtrack
          grid[row][col] = 0;
        }
      }
      return false;
    };
    
    const result = solveRecursive(grid);
    console.log(`Solver completed with ${attempts} attempts`);
    return result;
  }, [isValidMove, findBestCell]);

  const isValidGrid = useCallback((grid) => {
    const size = grid.length;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const num = grid[row][col];
        if (num !== 0) {
          // Temporarily remove the number to check if placement is valid
          const tempGrid = grid.map(r => [...r]);
          tempGrid[row][col] = 0;
          if (!isValidMove(tempGrid, row, col, num)) {
            console.log(`Invalid number ${num} at position (${row}, ${col})`);
            return false;
          }
        }
      }
    }
    return true;
  }, [isValidMove]);

  const handleSolve = useCallback(() => {
    const gridCopy = sudokuGrid.map(row => [...row]);
    
    // Debug info for different grid sizes
    if (gridSize === 6) {
      console.log('6x6 Grid being solved:', gridCopy);
      const { rows, cols } = getBoxDimensions(6);
      console.log('Box dimensions for 6x6:', { rows, cols });
    } else if (gridSize === 9) {
      console.log('9x9 Grid being solved:', gridCopy);
      console.log('Checking initial grid validity...');
      if (!isValidGrid(gridCopy)) {
        alert('The puzzle has invalid entries! Please check for conflicts.');
        return;
      }
    }
    
    let solved;
    
    // Check if the grid is empty
    if (isGridEmpty(gridCopy)) {
      console.log('Generating random solution for empty grid...');
      solved = generateRandomSolution(gridCopy);
      if (solved) {
        setSudokuGrid(gridCopy);
        setOriginalGrid(gridCopy.map(row => [...row])); // For empty grid, all cells are solved by solver
        setManuallyEnteredCells(Array(gridSize).fill().map(() => Array(gridSize).fill(false))); // No manually entered cells
        alert('Random valid Sudoku solution generated! 🎲✨');
        return;
      }
    } else {
      // Grid has some numbers, try to solve it
      console.log('Solving puzzle with existing entries...');
      solved = solveSudoku(gridCopy);
    }
    
    if (solved) {
      setSudokuGrid(gridCopy);
      // Don't update originalGrid here - keep the original state to maintain manual highlighting
      alert('Puzzle solved successfully! 🎉');
    } else {
      alert('No solution exists for this puzzle!');
    }
  }, [sudokuGrid, solveSudoku, isGridEmpty, generateRandomSolution, gridSize, getBoxDimensions, isValidGrid]);

  // Play mode functions
  const generateNewPuzzle = useCallback(() => {
    if (!gridSize) return;

    const emptyGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Generate a complete solution
    if (generateRandomSolution(emptyGrid)) {
      // Remove cells to create puzzle (adjust difficulty by cells removed)
      const totalCells = gridSize * gridSize;
      const cellsToRemove = Math.floor(totalCells * 0.5); // Remove 50% of cells
      
      const solvedGrid = emptyGrid.map(row => [...row]);
      const positions = [];
      
      // Create list of all positions
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          positions.push([i, j]);
        }
      }
      
      // Shuffle positions and remove cells
      const shuffledPositions = shuffleArray(positions);
      for (let i = 0; i < cellsToRemove; i++) {
        const [row, col] = shuffledPositions[i];
        emptyGrid[row][col] = 0;
      }
      
      setSudokuGrid(emptyGrid);
      setOriginalGrid(emptyGrid.map(row => [...row]));
      
      // Set locked cells (cells that have values in the puzzle)
      const newLockedCells = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          newLockedCells[i][j] = emptyGrid[i][j] !== 0;
        }
      }
      setLockedCells(newLockedCells);
      setManuallyEnteredCells(Array(gridSize).fill().map(() => Array(gridSize).fill(false)));
      setIncorrectCells([]);
      setSelectedCell(null);
      setPuzzleGrid(solvedGrid); // Store complete solution for checking
      setHintCount(0);
    }
  }, [gridSize, generateRandomSolution, shuffleArray]);

  const handleHint = useCallback(() => {
    if (hintCount >= 3 || !puzzleGrid.length) return;

    // Find an empty cell to fill with hint
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (sudokuGrid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [row, col] = emptyCells[randomIndex];
      
      const newGrid = sudokuGrid.map(r => [...r]);
      newGrid[row][col] = puzzleGrid[row][col];
      
      const newLockedCells = lockedCells.map(r => [...r]);
      newLockedCells[row][col] = true;
      
      setSudokuGrid(newGrid);
      setLockedCells(newLockedCells);
      setHintCount(prev => prev + 1);
    }
  }, [hintCount, puzzleGrid, gridSize, sudokuGrid, lockedCells]);

  const handleCheck = useCallback(() => {
    const newIncorrectCells = [];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (sudokuGrid[i][j] !== 0 && sudokuGrid[i][j] !== puzzleGrid[i][j]) {
          newIncorrectCells.push([i, j]);
        }
      }
    }
    
    setIncorrectCells(newIncorrectCells);
    
    if (newIncorrectCells.length === 0) {
      // Check if puzzle is complete
      const isComplete = sudokuGrid.every(row => row.every(cell => cell !== 0));
      if (isComplete) {
        alert('Congratulations! You solved the puzzle! 🎉');
      } else {
        alert('All filled numbers are correct! Keep going! ✅');
      }
    } else {
      alert(`Found ${newIncorrectCells.length} incorrect cell(s). They are highlighted in red.`);
    }
  }, [gridSize, sudokuGrid, puzzleGrid]);

  return (
    <AppContainer>
      <Title>🧩 Dualoku</Title>
      <GameContainer>
        {!mode ? (
          // Show mode selector if no mode is selected
          <ModeSelector onModeChange={handleModeChange} />
        ) : (
          <>
            <ControlsContainer>
              {/* Show mode selector button to go back */}
              <button 
                onClick={() => handleModeChange(null)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                ← Change Mode
              </button>
              
              {/* Only show grid selector after mode is selected */}
              <GridSelector 
                currentSize={gridSize} 
                onSizeChange={handleGridSizeChange} 
              />
              
              {/* Show controls based on mode and grid size */}
              {gridSize && mode === 'solve' && (
                <SolverButton 
                  onSolve={handleSolve}
                  onClear={handleClearGrid}
                  onGenerateTest={generateTestPuzzle}
                  onToggleImageUploader={handleToggleImageUploader}
                  showImageUploader={showImageUploader}
                />
              )}
              
              {gridSize && mode === 'play' && (
                <PlayControls
                  onNewPuzzle={generateNewPuzzle}
                  onHint={handleHint}
                  onCheck={handleCheck}
                  onClear={handleClearGrid}
                  hintsUsed={hintCount}
                  maxHints={3}
                />
              )}
            </ControlsContainer>
            
            {/* Only show grid after size is selected */}
            {gridSize && (
              <SudokuGrid 
                grid={sudokuGrid}
                gridSize={gridSize}
                originalGrid={originalGrid}
                manuallyEnteredCells={manuallyEnteredCells}
                onCellChange={handleCellChange}
                selectedCell={selectedCell}
                onCellSelect={handleCellSelect}
                lockedCells={lockedCells}
                incorrectCells={incorrectCells}
              />
            )}
            
            {/* Only show image uploader in solve mode after grid size is selected */}
            {gridSize && mode === 'solve' && showImageUploader && (
              <ImageUploader
                gridSize={gridSize}
                onGridDetected={handleGridDetected}
              />
            )}
          </>
        )}
      </GameContainer>
    </AppContainer>
  );
}

export default App;
