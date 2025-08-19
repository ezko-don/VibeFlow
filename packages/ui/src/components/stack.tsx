import React from 'react'
import { cn } from '../utils/class-names'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: 'row' | 'col'
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col'
}

const spacingClasses = {
  row: {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6'
  },
  col: {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  }
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
}

export const Stack: React.FC<StackProps> = ({ 
  className, 
  children, 
  direction = 'col',
  spacing = 'md',
  align = 'start',
  justify = 'start',
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        spacingClasses[direction][spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
