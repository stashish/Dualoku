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
  max-width: 500px;
  aspect-ratio: 1;
`;

const Cell = styled.input`
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: ${props => props.gridSize <= 4 ? '24px' : props.gridSize <= 6 ? '20px' : '16px'};
  font-weight: bold;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  background: ${props => 
    props.isSelected ? '#e3f2fd' : 
    props.isSubgridBorder ? '#f8f9fa' : 'white'};
  color: #2c3e50;
  transition: all 0.2s ease;
  outline: none;
  aspect-ratio: 1;
  cursor: pointer;
  
  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
    background: #ebf3fd;
  }
  
  &:hover {
    background: ${props => 
      props.isSelected ? '#e3f2fd' :
      props.isSubgridBorder ? '#f1f2f6' : '#f8f9fa'};
  }
  
  &:invalid {
    border-color: #e74c3c;
    background: #fdf2f2;
  }
`;

const SudokuGrid = ({ grid, gridSize, onCellChange, selectedCell, onCellSelect }) => {
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

  const handleInputChange = (row, col, event) => {
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
            placeholder=""
          />
        ))
      )}
    </GridContainer>
  );
};

export default SudokuGrid;
