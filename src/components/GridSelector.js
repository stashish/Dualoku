import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SizeButton = styled.button`
  padding: 12px 20px;
  border: 2px solid ${props => props.isActive ? '#3498db' : '#bdc3c7'};
  background: ${props => props.isActive ? '#3498db' : 'white'};
  color: ${props => props.isActive ? 'white' : '#2c3e50'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    border-color: #3498db;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  margin: 0;
  max-width: 300px;
`;

const GridSelector = ({ currentSize, onSizeChange }) => {
  const gridOptions = [
    { size: 4, label: '4×4', description: 'Easy - Numbers 1-4' },
    { size: 6, label: '6×6', description: 'Medium - Numbers 1-6' },
    { size: 9, label: '9×9', description: 'Hard - Numbers 1-9' }
  ];

  const currentOption = gridOptions.find(option => option.size === currentSize);

  return (
    <SelectorContainer>
      <Label>Choose Sudoku Grid Size</Label>
      <ButtonGroup>
        {gridOptions.map(option => (
          <SizeButton
            key={option.size}
            isActive={currentSize === option.size}
            onClick={() => onSizeChange(option.size)}
          >
            {option.label}
          </SizeButton>
        ))}
      </ButtonGroup>
      {currentOption && (
        <Description>
          {currentOption.description}
        </Description>
      )}
    </SelectorContainer>
  );
};

export default GridSelector;
