import React from 'react';
import styled from 'styled-components';

const NumberPadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
`;

const NumberPadTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => Math.ceil(Math.sqrt(props.maxNumber))}, 1fr);
  gap: 8px;
  max-width: 200px;
`;

const NumberButton = styled.button`
  width: 45px;
  height: 45px;
  border: 2px solid #3498db;
  background: white;
  color: #2c3e50;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #3498db;
    color: white;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ClearButton = styled(NumberButton)`
  grid-column: span 2;
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
  
  &:hover {
    background: #c0392b;
    border-color: #c0392b;
  }
`;

const NumberPad = ({ gridSize, onNumberSelect, selectedCell }) => {
  const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);
  
  return (
    <NumberPadContainer>
      <NumberPadTitle>
        {selectedCell ? `Select number for cell (${selectedCell.row + 1}, ${selectedCell.col + 1})` : 'Click a cell to enter numbers'}
      </NumberPadTitle>
      <NumberGrid maxNumber={gridSize}>
        {numbers.map(num => (
          <NumberButton
            key={num}
            onClick={() => onNumberSelect(num)}
            disabled={!selectedCell}
          >
            {num}
          </NumberButton>
        ))}
        <ClearButton
          onClick={() => onNumberSelect(0)}
          disabled={!selectedCell}
        >
          Clear
        </ClearButton>
      </NumberGrid>
    </NumberPadContainer>
  );
};

export default NumberPad;
