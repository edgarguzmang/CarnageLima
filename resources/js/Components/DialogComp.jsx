import React from 'react'
import Loading from './LoadingDiv'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

const DialogComp = ({
    open = false,
    onClose = () => { },
    title = null,
    loadingContent = false,
    loadingAction = false,
    children,
    maxWidth = '2xl',
}) => {
    // const [isOpen, setIsOpen] = useState(false);
    // const [isClosing, setIsClosing] = useState(false);
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    // const handleClose = () => {
    //     setIsClosing(true);
    //     // Esperar a que termine la animación antes de cambiar el estado
    //     setTimeout(() => {
    //         setIsOpen(false);
    //         setIsClosing(false);
    //         if (onClose) onClose();
    //     }, 200); // Debe coincidir con la duración de "leave"
    // };

    return (
        // <Transition appear show={open}> {/* ← añade "appear" */}
        <Dialog open={open} as="div" className="relative z-50 focus:outline-none" onClose={onClose}>
            {/* Backdrop */}
            <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
                </TransitionChild>

            {/* Contenedor del diálogo */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {/* <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        > */}
                    <DialogPanel
                        transition
                        className={`
                            w-full rounded-xl bg-white p-6 shadow-2xl 
                            relative transform transition-all
                            ${maxWidthClass}
                        `}
                    >
                        {loadingContent && <Loading />}
                        {title && (
                            <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
                                {title}
                            </DialogTitle>
                        )}
                        {children}
                    </DialogPanel>
                    {/* </TransitionChild> */}
                </div>
            </div>
        </Dialog>
        // {/* </Transition> */}
    )
}

export default DialogComp