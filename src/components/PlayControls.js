import React from 'react';
import styled from 'styled-components';

const PlayControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
`;

const PlayButton = styled.button`
  padding: 12px 20px;
  background: ${props => 
    props.variant === 'primary' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' :
    props.variant === 'secondary' ? 'linear-gradient(135deg, #f39c12, #e67e22)' :
    props.variant === 'danger' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' :
    'linear-gradient(135deg, #3498db, #2980b9)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.8rem;
  }
`;

const PlayControls = ({ 
  onNewPuzzle, 
  onClear, 
  onHint, 
  onCheck, 
  hintCount,
  maxHints = 3,
  isComplete 
}) => {
  return (
    <PlayControlsContainer>
      <PlayButton 
        variant="primary" 
        onClick={onNewPuzzle}
      >
        🎲 New Puzzle
      </PlayButton>
      
      <PlayButton 
        variant="secondary" 
        onClick={onHint}
        disabled={hintCount >= maxHints || isComplete}
      >
        💡 Hint ({hintCount}/{maxHints})
      </PlayButton>
      
      <PlayButton 
        variant="default" 
        onClick={onCheck}
        disabled={isComplete}
      >
        ✅ Check
      </PlayButton>
      
      <PlayButton 
        variant="danger" 
        onClick={onClear}
      >
        🗑️ Clear
      </PlayButton>
    </PlayControlsContainer>
  );
};

export default PlayControls;
