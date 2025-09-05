import React from 'react';
import styled from 'styled-components';

const ModeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const ModeTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
`;

const ModeOptions = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ModeButton = styled.button`
  padding: 20px 30px;
  background: ${props => props.selected ? 
    'linear-gradient(135deg, #3498db, #2980b9)' : 
    'linear-gradient(135deg, #ecf0f1, #bdc3c7)'
  };
  color: ${props => props.selected ? 'white' : '#2c3e50'};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 150px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 15px 25px;
    font-size: 1rem;
    min-width: 120px;
  }
`;

const ModeDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  text-align: center;
  margin: 5px 0 0 0;
  max-width: 150px;
`;

const ModeOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <ModeSelectorContainer>
      <ModeTitle>Choose Your Mode</ModeTitle>
      <ModeOptions>
        <ModeOption>
          <ModeButton 
            selected={currentMode === 'play'}
            onClick={() => onModeChange('play')}
          >
            🎮 Play
          </ModeButton>
          <ModeDescription>
            Play Sudoku puzzles with hints and validation
          </ModeDescription>
        </ModeOption>
        
        <ModeOption>
          <ModeButton 
            selected={currentMode === 'solve'}
            onClick={() => onModeChange('solve')}
          >
            🧠 Solve
          </ModeButton>
          <ModeDescription>
            Solve existing puzzles or scan from images
          </ModeDescription>
        </ModeOption>
      </ModeOptions>
    </ModeSelectorContainer>
  );
};

export default ModeSelector;
