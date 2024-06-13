import React from 'react'
import Select from 'react-select'
import styles from './Dropdown.module.css'

interface Option {
  value: string
  label: string
}

interface DropdownProps {
  options: Option[]
  onChange: any
  value: any
  label?: string
  placeholder: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
}) => {
  return (
    <>
      <label className={styles.label}>{label}</label>
      <Select
        styles={{
          option: (base, props) => ({
            ...base,
            backgroundColor: props.isSelected ? '#6f58f6' : 'white',
          }),
        }}
        onChange={onChange}
        value={value}
        options={options}
        placeholder={placeholder}
      />
    </>
  )
}
