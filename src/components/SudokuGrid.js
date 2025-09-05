import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  gap: 2px;
  background: #2c3e50;
  border: 3px solid #2c3e50;
  border-radius: 10px;
  padding: 10px;
  margin: 0 auto;
  grid-template-columns: ${props => `repeat(${props.gridSize}, 1fr)`};
  max-width: min(500px, 90vw);
  aspect-ratio: 1;
  
  @media (max-width: 480px) {
    max-width: 95vw;
    padding: 8px;
    gap: 1px;
  }
`;

const Cell = styled.input`
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: ${props => 
    props.gridSize <= 4 ? 'clamp(16px, 4vw, 24px)' : 
    props.gridSize <= 6 ? 'clamp(14px, 3.5vw, 20px)' : 
    'clamp(12px, 3vw, 16px)'
  };
  font-weight: bold;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  background: ${props => 
    props.isIncorrect ? '#ffebee' :  /* Light red for incorrect cells */
    props.isSelected ? '#e3f2fd' : 
    props.isLocked ? '#f5f5f5' :  /* Light gray for locked cells */
    props.isManuallyFilled ? '#e8f5e8' :  /* Light green for manually filled */
    props.isSubgridBorder ? '#f8f9fa' : 'white'};
  color: ${props => 
    props.isIncorrect ? '#c62828' :  /* Red text for incorrect cells */
    props.isLocked ? '#424242' :  /* Dark gray for locked cells */
    props.isManuallyFilled ? '#27ae60' :  /* Green text for manually filled */
    '#2c3e50'};
  cursor: ${props => props.isLocked ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  outline: none;
  aspect-ratio: 1;
  
  /* Better touch targets for mobile */
  min-height: ${props => props.gridSize <= 4 ? '50px' : props.gridSize <= 6 ? '40px' : '35px'};
  
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
    background: #ebf3fd;
  }
  
  &:hover {
    background: ${props => 
      props.isLocked ? '#f5f5f5' :  /* No hover effect for locked cells */
      props.isIncorrect ? '#ffcdd2' :  /* Darker red on hover for incorrect */
      props.isSelected ? '#e3f2fd' :
      props.isManuallyFilled ? '#dff0df' :  /* Slightly darker green on hover */
      props.isSubgridBorder ? '#f1f2f6' : '#f8f9fa'};
  }
  
  &:invalid {
    border-color: #e74c3c;
    background: #fdf2f2;
  }
  
  @media (max-width: 480px) {
    font-size: ${props => 
      props.gridSize <= 4 ? '18px' : 
      props.gridSize <= 6 ? '16px' : 
      '14px'
    };
    min-height: ${props => props.gridSize <= 4 ? '45px' : props.gridSize <= 6 ? '38px' : '32px'};
  }
`;

const SudokuGrid = ({ 
  grid, 
  gridSize, 
  originalGrid = [], 
  manuallyEnteredCells = [], 
  lockedCells = [], 
  incorrectCells = [], 
  onCellChange, 
  selectedCell, 
  onCellSelect 
}) => {
  const getBoxDimensions = (size) => {
    if (size === 4) return { rows: 2, cols: 2 };
    if (size === 6) return { rows: 2, cols: 3 };
    if (size === 9) return { rows: 3, cols: 3 };
    const sqrt = Math.sqrt(size);
    return { rows: sqrt, cols: sqrt };
  };
  
  const isSubgridBorder = (row, col) => {
    const { rows: boxRows, cols: boxCols } = getBoxDimensions(gridSize);
    const boxRow = Math.floor(row / boxRows);
    const boxCol = Math.floor(col / boxCols);
    return (boxRow + boxCol) % 2 === 0;
  };

  const isManuallyFilled = (row, col) => {
    // Check if this cell was manually entered by the user
    if (!manuallyEnteredCells || !manuallyEnteredCells[row]) {
      return false;
    }
    return manuallyEnteredCells[row][col] === true && grid[row][col] !== 0;
  };

  const isLocked = (row, col) => {
    // Check if this cell is locked (can't be edited in play mode)
    if (!lockedCells || !lockedCells[row]) {
      return false;
    }
    return lockedCells[row][col] === true;
  };

  const isIncorrect = (row, col) => {
    // Check if this cell is marked as incorrect
    if (!incorrectCells || incorrectCells.length === 0) {
      return false;
    }
    return incorrectCells.some(([r, c]) => r === row && c === col);
  };

  const handleInputChange = (row, col, event) => {
    // Don't allow changes to locked cells
    if (isLocked(row, col)) {
      event.preventDefault();
      return;
    }
    const value = event.target.value;
    
    // Allow empty input
    if (value === '') {
      onCellChange(row, col, 0);
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // Validate input based on grid size
    if (numValue >= 1 && numValue <= gridSize) {
      onCellChange(row, col, numValue);
    } else {
      // Reset to previous value if invalid
      event.target.value = grid[row][col] === 0 ? '' : grid[row][col];
    }
  };

  const handleCellClick = (row, col) => {
    if (onCellSelect) {
      onCellSelect(row, col);
    }
  };

  const handleKeyPress = (event) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /^[0-9]$/.test(event.key);
    
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  };

  const isCellSelected = (row, col) => {
    return selectedCell && selectedCell.row === row && selectedCell.col === col;
  };

  return (
    <GridContainer gridSize={gridSize}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            type="text"
            value={cell === 0 ? '' : cell}
            onChange={(e) => handleInputChange(rowIndex, colIndex, e)}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            onKeyDown={handleKeyPress}
            maxLength="1"
            gridSize={gridSize}
            isSubgridBorder={isSubgridBorder(rowIndex, colIndex)}
            isSelected={isCellSelected(rowIndex, colIndex)}
            isManuallyFilled={isManuallyFilled(rowIndex, colIndex)}
            isLocked={isLocked(rowIndex, colIndex)}
            isIncorrect={isIncorrect(rowIndex, colIndex)}
            placeholder=""
            readOnly={isLocked(rowIndex, colIndex)}
          />
        ))
      )}
    </GridContainer>
  );
};

export default SudokuGrid;
