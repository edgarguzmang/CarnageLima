import React, { useRef, useEffect } from 'react'
import '../../sass/TablesComponent/_columnChooserStyle.scss'
import { useState } from 'react';
// import { Divider } from '@mui/material';
import LoadingDiv from './LoadingDiv';

const ColumnChooserDialog = ({ open, onClose, columns, setColumns, onApply, onApplyAndSave, anchorRef, loadingApply }) => {
    const dialogRef = useRef()
    const [isVisible, setIsVisible] = useState(open);
    const [position, setPosition] = useState({ top: 0, left: 100 });

    const handleClickOutside = (e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) {
            onClose()
        }
    }

    const handleToggle = (index) => {
        const updated = [...columns]
        updated[index].visible = !updated[index].visible
        setColumns(updated)
    }

    useEffect(() => {
        const updatePosition = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect()
                const isMobile = window.innerWidth <= 905

                if (isMobile) {
                    setPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right,
                        left: undefined
                    })
                } else {
                    setPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                        right: undefined
                    })
                }
            }
        }

        if (open) {
            updatePosition()
            setIsVisible(true)
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', updatePosition, true)
        } else {
            setTimeout(() => setIsVisible(false), 200)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [open])

    if (!isVisible) return null

    return (
        <div className="column-chooser-overlay">
            <div
                ref={dialogRef}
                className={`column-chooser-dialog ${open ? 'fade-in' : 'fade-out'}`}
                style={{
                    position: 'fixed',
                    top: `${position.top}px`,
                    ...(position.left !== undefined ? { left: `${position.left}px` } : {}),
                    ...(position.right !== undefined ? { right: `${position.right}px` } : {}),
                    zIndex: 1301,
                }}>
                <div className="column-chooser-header">Mostrar/Ocultar</div>
                {/* <Divider /> */}
                <div className="column-chooser-body blue-scroll">
                    {columns.map((col, index) => (
                        <label key={col.accessor} className="column-chooser-option">
                            <input
                                type="checkbox"
                                checked={col.visible}
                                onChange={() => handleToggle(index)}
                                className='accent-primary-color mr-4'
                                disabled={loadingApply}
                            />
                            {col.label || col.accessor}
                        </label>
                    ))}
                </div>
                <button
                    className={`${loadingApply ? 'disabled-column-chooser-button' : 'column-chooser-button'}`}
                    disabled={loadingApply}
                    onClick={onApply}
                >
                    Aplicar cambios
                </button>
                {onApplyAndSave &&
                    <button
                        className={`${loadingApply ? 'disabled-column-chooser-button' : 'column-chooser-button'}`}
                        disabled={loadingApply}
                        onClick={onApplyAndSave}
                    >
                        {loadingApply ? (
                            <LoadingDiv size={25} color='inherit' />
                        ) : "Aplicar y guardar"}
                    </button>
                }
            </div>
        </div>
    );
}

export default ColumnChooserDialog