import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import SudokuGrid from './components/SudokuGrid';
import GridSelector from './components/GridSelector';
import SolverButton from './components/SolverButton';
import NumberPad from './components/NumberPad';
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
  const [gridSize, setGridSize] = useState(9);
  const [sudokuGrid, setSudokuGrid] = useState(() => 
    Array(gridSize).fill().map(() => Array(gridSize).fill(0))
  );
  const [selectedCell, setSelectedCell] = useState(null);

  const handleGridSizeChange = useCallback((newSize) => {
    setGridSize(newSize);
    setSudokuGrid(Array(newSize).fill().map(() => Array(newSize).fill(0)));
    setSelectedCell(null);
  }, []);

  const handleCellChange = useCallback((row, col, value) => {
    const newGrid = sudokuGrid.map(r => [...r]);
    newGrid[row][col] = value;
    setSudokuGrid(newGrid);
  }, [sudokuGrid]);

  const handleCellSelect = useCallback((row, col) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberSelect = useCallback((number) => {
    if (selectedCell) {
      handleCellChange(selectedCell.row, selectedCell.col, number);
    }
  }, [selectedCell, handleCellChange]);

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
    setSelectedCell(null);
  }, [gridSize]);

  const handleClearGrid = useCallback(() => {
    setSudokuGrid(Array(gridSize).fill().map(() => Array(gridSize).fill(0)));
    setSelectedCell(null);
  }, [gridSize]);

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
      alert('Puzzle solved successfully! 🎉');
    } else {
      alert('No solution exists for this puzzle!');
    }
  }, [sudokuGrid, solveSudoku, isGridEmpty, generateRandomSolution, gridSize, getBoxDimensions, isValidGrid]);

  return (
    <AppContainer>
      <Title>🧩 Sudoku Solver</Title>
      <GameContainer>
        <ControlsContainer>
          <GridSelector 
            currentSize={gridSize} 
            onSizeChange={handleGridSizeChange} 
          />
          <SolverButton 
            onSolve={handleSolve}
            onClear={handleClearGrid}
            onGenerateTest={generateTestPuzzle}
          />
        </ControlsContainer>
        <SudokuGrid 
          grid={sudokuGrid}
          gridSize={gridSize}
          onCellChange={handleCellChange}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect}
        />
        <NumberPad
          gridSize={gridSize}
          onNumberSelect={handleNumberSelect}
          selectedCell={selectedCell}
        />
      </GameContainer>
    </AppContainer>
  );
}

export default App;
