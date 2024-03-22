import React from 'react';
import { useEffect, useState } from 'hono/jsx'
import { Button } from '@mantine/core';

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: () => void;
    background?: string;
    color?: string;
    fontSize?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ children, background, color, fontSize, ...props }) => {
    const [buttonDimensions, setButtonDimensions] = useState({ height: '10vh', padding: '20px 40px' });

    useEffect(() => {
        const updateDimensions = () => {
            const viewportHeight = window.innerHeight;
            const newHeight = Math.min(100, viewportHeight / 10);  // Adjust divisor to get desired scaling
            const newPadding = `${newHeight / 5}px ${newHeight / 2.5}px`;  // Adjust ratios to get desired padding
            setButtonDimensions({ height: `${newHeight}px`, padding: newPadding });
        };

        // Update dimensions on mount
        updateDimensions();

        // Update dimensions on window resize
        window.addEventListener('resize', updateDimensions);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const customStyle = {
        background: background || 'linear-gradient(to bottom right, #6562DF, #4340B5)',
        border: '1px solid #2c2c2c',
        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: fontSize || '40px',  // Fixed font size
        color: color || '#FED11B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'umbrage2',
        ...buttonDimensions,  // Spread in height and padding
        ...props.style,       // Spread in any other style props to override the custom styles if needed
    };

    return (
        <Button {...props} style={customStyle}>
            {children}
        </Button>
    );
};

export default CustomButton;