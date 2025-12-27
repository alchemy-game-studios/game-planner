import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function HoverEditableText({
  value,
  onChange,
  multiline = false,
  className = '',
  placeholder = 'Hover to edit...'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [readyToEdit, setReadyToEdit] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);
  const hoverTimeout = useRef(null);
  const inputRef = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setReadyToEdit(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    if (readyToEdit && !isEditing) {
      setReadyToEdit(false);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setReadyToEdit(false);
    setWasClicked(false); // reset after editing
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // prevent newline
        inputRef.current?.blur();

    }
  };

  useEffect(() => {
    if ((readyToEdit || isEditing) && wasClicked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [readyToEdit, isEditing, wasClicked]);

  const textAreaTextProps = {
    className: `whitespace-pre-wrap min-h-15 mb-6 w-full p-4 pt-8 font-book md:text-lg text-lg resize-none overflow-auto rounded-md border border-transparent ${className}`,
  };

  const textAreaProps = {
    ref: inputRef,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur: handleBlur,
    onFocus: handleFocus,
    className: `whitespace-pre-wrap mt-4 min-h-30 p-4 font-book md:text-lg text-lg resize-none overflow-auto ${className}`,
    placeholder: 'Enter a text here...'
  };

  const inputTextProps = {
    className: `whitespace-pre-wrap min-h-15 p-8 pt-[33px]  font-book md:text-lg text-lg resize-none overflow-auto rounded-md border border-transparent ${className}`,
  };

  const inputProps = {
    ref: inputRef,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur: handleBlur,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    className: `whitespace-pre-wrap min-h-14 w-2/3 p-14 pl-8 mb-[1px] font-book md:text-lg text-lg resize-none overflow-auto ${className}`,
    placeholder: 'Enter text here...'
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full"
    >
      {!readyToEdit && !isEditing && multiline ? (
        <p
          {...textAreaTextProps}
          onClick={() => {
            setWasClicked(true);
            setReadyToEdit(true);
            setIsEditing(true);
          }}
        >
          {value || <span className="text-gray-500 italic">{placeholder}</span>}
        </p>
      ) : !readyToEdit && !isEditing && !multiline ? (
        <p
          {...inputTextProps}
          onClick={() => {
            setWasClicked(true);
            setReadyToEdit(true);
            setIsEditing(true);
          }}
        >
          {value || <span className="text-gray-500 italic">{placeholder}</span>}
        </p>
      ) : multiline ? (
        <Textarea {...textAreaProps} />
      ) : (
        <Input {...inputProps} />
      )}
    </div>
  );
}
