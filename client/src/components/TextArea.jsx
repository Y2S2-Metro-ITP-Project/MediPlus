import React from 'react';
import styled from 'styled-components';

const TextAreaContainer = styled.div`
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  box-sizing: border-box;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #666;
  }
`;

const TextArea = ({
  rows = 4,
  placeholder = 'Type here...',
  value,
  onChange,
  ...props
}) => {
  const handleChange = (event) => {
    // Call the onChange function passed from the parent component
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <TextAreaContainer>
      <StyledTextArea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange} // Pass the handleChange function
        {...props}
      />
    </TextAreaContainer>
  );
};

export default TextArea;
