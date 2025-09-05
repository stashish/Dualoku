import React from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover:before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const SolveButton = styled(ActionButton)`
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #27ae60, #229954);
  }
`;

const ClearButton = styled(ActionButton)`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #c0392b, #a93226);
  }
`;

const SolverButton = ({ onSolve, onClear, onGenerateTest, onToggleImageUploader, showImageUploader }) => {
  return (
    <ButtonContainer>
      <SolveButton onClick={onSolve}>
        🧠 Solve / Generate
      </SolveButton>
      <ClearButton onClick={onClear}>
        🧹 Clear Grid
      </ClearButton>
      {onGenerateTest && (
        <ActionButton 
          onClick={onGenerateTest}
          style={{
            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
            color: 'white'
          }}
        >
          🎲 Sample Puzzle
        </ActionButton>
      )}
      {onToggleImageUploader && (
        <ActionButton 
          onClick={onToggleImageUploader}
          style={{
            background: showImageUploader 
              ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
              : 'linear-gradient(135deg, #9b59b6, #8e44ad)',
            color: 'white'
          }}
        >
          {showImageUploader ? '❌ Hide Scanner' : '📸 Scan Image'}
        </ActionButton>
      )}
    </ButtonContainer>
  );
};

export default SolverButton;
