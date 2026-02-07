import { useState, useEffect, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Tree } from "primereact/tree";
import request from "@/utils";
import SelectComp from "@/components/SelectInput";
import { toast } from "sonner";

export default function AsignMenusDialog(props) {
    const [state, setState] = useState({
        mainMenuList: [],
        mainMenuSelected: null,
        showConfirmDialog: false,
        confirmSave: false,
        updateUsers: false,
        usersList: []
    })
    const [allMenus, setAllMenus] = useState();
    const [assignedMenus, setAssignedMenus] = useState();
    const [selectedKeys, setSelectedKeys] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Mantenemos calcularValores tal cual, pero ahora recibirá la estructura a llenar
    function calcularValores(obj, assignedMenus, currentSelectedNodes) {
        const menuInfo = assignedMenus.find((menu) => menu.menu_id === obj.key);

        if (menuInfo) {
            if (obj.children && obj.children.length > 0) {
                let todosHijosSeleccionados = true;
                let algunosHijosSeleccionados = false;

                for (const hijo of obj.children) {
                    // Pasar currentSelectedNodes por referencia (ya que es un objeto)
                    const hijoValores = calcularValores(hijo, assignedMenus, currentSelectedNodes);

                    if (!hijoValores) {
                        todosHijosSeleccionados = false;
                        algunosHijosSeleccionados = true;
                    }
                }

                if (!(todosHijosSeleccionados === false && algunosHijosSeleccionados === false)) {
                    if (todosHijosSeleccionados) {
                        currentSelectedNodes[obj.key] = { checked: true, partialChecked: false, label: menuInfo.menu_nombre };
                    } else if (algunosHijosSeleccionados) {
                        currentSelectedNodes[obj.key] = { checked: false, partialChecked: true, label: menuInfo.menu_nombre };
                    }
                }
            } else {
                currentSelectedNodes[obj.key] = { checked: true, partialChecked: false, label: menuInfo.menu_nombre, toList: true };
            }

            if (currentSelectedNodes[obj.key] && currentSelectedNodes[obj.key].checked === false && currentSelectedNodes[obj.key].partialChecked === false) {
                delete currentSelectedNodes[obj.key];
                return false; // Indica que el nodo no está seleccionado (ni parcial ni completamente)
            }
            return currentSelectedNodes[obj.key]; // Devuelve el estado del nodo actual
        } else {
            // El objeto no se encuentra en dataMenusAssigned.
            // Si tiene hijos, necesitamos revisar si *alguno* de los hijos está seleccionado.
            if (obj.children && obj.children.length > 0) {
                let algunoSeleccionado = false;
                for (const hijo of obj.children) {
                    const hijoValores = calcularValores(hijo, assignedMenus, currentSelectedNodes);
                    if (hijoValores && (hijoValores.checked || hijoValores.partialChecked)) {
                        algunoSeleccionado = true;
                    }
                }

                if (algunoSeleccionado) {
                    // Si al menos un hijo está seleccionado, este nodo padre debe ser PartialChecked
                    currentSelectedNodes[obj.key] = { checked: false, partialChecked: true, label: obj.label };
                    return currentSelectedNodes[obj.key];
                }
            }
            return false; // No seleccionado
        }
    }


    const fetchAndSetupData = async () => {
        try {
            // Obtener los datos de dataMenus y dataMenusAssigned
            const menusResponse = await fetch(route("menus-tree"));
            const dataMenus = await menusResponse.json();
            setAllMenus(dataMenus);

            const menusAssignedResponse = await fetch(route("rolesxmenu.show", props.rol.roles_id));
            const dataMenusAssigned = await menusAssignedResponse.json();
            setAssignedMenus(dataMenusAssigned)

            // 1. Crear la variable local para las claves seleccionadas
            let initialSelectedNodesLocal = {};

            // 2. Iterar sobre los menus y calcular los valores de checked y partialChecked
            dataMenus.forEach((obj) => {
                // Modificamos calcularValores para que use la variable local
                calcularValores(obj, dataMenusAssigned, initialSelectedNodesLocal);
            });

            // 3. Establecer el estado con la variable local
            setSelectedKeys(initialSelectedNodesLocal);

            // 4. Abrir el diálogo
            setOpenDialog(true);

        } catch (error) {
            console.error("Error fetching menu data:", error);
            // Manejar error
        }
    };

    // El resto del componente...

    const saveUserMenus = async () => {
        const menus = Object.keys(selectedKeys);

        // El resto de la lógica de guardado, incluyendo el diálogo de confirmación, 
        // parece manejar bien el estado `state.confirmSave` y la variable `selectedKeys`.
        // Mantenemos la lógica de la llamada a la API y la notificación.

        if (!state.showConfirmDialog && !state.confirmSave) {
            // ... (Lógica de verificación de cambios y mostrar diálogo de confirmación)
            const originalMenus = assignedMenus.map(menu => menu.menu_id.toString())
            const hasNewMenus = originalMenus.length !== menus.length || menus.some(menu => !originalMenus.includes(menu)) || originalMenus.some(oMenu => !menus.includes(oMenu));

            if (hasNewMenus) {
                const usersInRole = await request(route('rolesxmenu.usersPerRole'), 'POST', { idRol: props.rol.roles_id }, { enabled: true });
                if (usersInRole.usuarios.length !== 0) {
                    return setState({ ...state, showConfirmDialog: true, usersList: usersInRole.usuarios });
                }
            }

            // Si no hay usuarios o no hay cambios que justifiquen el diálogo, se procede a guardar
            try {
                await request(route('rolesxmenu.update', props.rol.roles_id), 'PUT', {
                    menus_ids: menus,
                    menuInicio: state.mainMenuSelected,
                    updateUsers: state.updateUsers,
                    usersList: state.usersList
                }, { enabled: true })
                    .then(() => {
                        // Limpieza del estado después de guardar
                        // No necesitamos `initialSelectedNodes = {}` porque ya no es global.
                        setState({ ...state, showConfirmDialog: false, confirmSave: false, updateUsers: false, usersList: [] });
                        setOpenDialog(false);
                        props.assignMenuHandler(false);
                        // noty('Datos guardados.', 'success');
                    })
                    toast.success("Guardado con éxito.");
            } catch (error) {
                console.error("Error al guardar:", error);
                toast.error("Ocurrió un error al guardar los datos.");
                // noty('Ocurrió un error al guardar los datos.', 'error')
            }
        } else if (state.confirmSave) {
            // Lógica de guardado después de la confirmación
            try {
                await request(route('rolesxmenu.update', props.rol.roles_id), 'PUT', {
                    menus_ids: menus,
                    menuInicio: state.mainMenuSelected,
                    updateUsers: state.updateUsers,
                    usersList: state.usersList
                }, { enabled: true })
                    .then(() => {
                        // Limpieza del estado después de guardar
                        // No necesitamos `initialSelectedNodes = {}` porque ya no es global.
                        setState({ ...state, showConfirmDialog: false, confirmSave: false, updateUsers: false, usersList: [] });
                        setOpenDialog(false);
                        props.assignMenuHandler(false);
                        // noty('Datos guardados.', 'success');
                    })
                    toast.success("Guardado con éxito.");
            } catch (error) {
                console.error("Error al guardar después de confirmar:", error);
                toast.error("Ocurrió un error al guardar los datos.");
                // noty('Ocurrió un error al guardar los datos.', 'error')
            }
        }
    };

    // Función de `handleOnChangeCheck` (para cuando el usuario cambia la selección)
    const handleOnChangeCheck = (e) => {
        const keys = Object.keys(e);
        const mainList = {}
        function addMenuName(obj) {
            const menuInfo = keys.find((key) => parseInt(key) === obj.key);

            if (menuInfo) {
                if (obj.children && obj.children.length > 0) {
                    let todosHijosSeleccionados = true;
                    let algunosHijosSeleccionados = false;

                    for (const hijo of obj.children) {
                        const hijoValores = addMenuName(hijo);
                        if (!hijoValores) {
                            todosHijosSeleccionados = false;
                            algunosHijosSeleccionados = true;
                        }
                    }

                    if (!(todosHijosSeleccionados === false && algunosHijosSeleccionados === false)) {
                        if (todosHijosSeleccionados) {
                            mainList[obj.key] = { checked: true, partialChecked: false, label: obj.label };
                        } else if (algunosHijosSeleccionados) {
                            mainList[obj.key] = { checked: false, partialChecked: true, label: obj.label };
                        }
                    }
                } else {
                    mainList[obj.key] = { checked: true, partialChecked: false, label: obj.label, toList: true };
                }

                if (mainList[obj.key] && mainList[obj.key].checked === false && mainList[obj.key].partialChecked === false) {
                    delete mainList[obj.key];
                    return false;
                }
            } else {
                // Si el padre no está seleccionado en `e`, no se agrega a `mainList` a menos que un hijo sí lo esté.
                // En la biblioteca PrimeReact, el nodo padre se agrega a las `selectionKeys` si está *parcialmente* seleccionado,
                // lo que se calcula implícitamente por la lógica de `Tree`. 
                // La lógica actual de `addMenuName` está bien para re-calcular el `mainList` de los menús *hoja* y el estado del padre.
                if (obj.children && obj.children.length > 0) {
                    let algunoSeleccionado = false;
                    for (const hijo of obj.children) {
                        const hijoValores = addMenuName(hijo); // Llama recursivamente
                        if (hijoValores) algunoSeleccionado = true;
                    }
                    if (algunoSeleccionado) {
                        // Si un hijo está seleccionado, y el padre no está en `keys` (la selección de PrimeReact), 
                        // PrimeReact ya maneja el estado parcial. Aquí simplemente aseguramos que el padre sea
                        // considerado en el cálculo general de los menús. Para este caso, solo nos interesa
                        // si es un nodo hoja (toList: true). El cálculo anterior lo hace bien.
                        // Solo devolveremos `algunoSeleccionado` para que el padre superior sepa que tiene hijos seleccionados.
                        return true;
                    }
                }
                return false;
            }
            return mainList[obj.key]
        }

        allMenus.forEach((obj) => {
            addMenuName(obj)
        })
        setSelectedKeys(mainList)
    };


    const getMainMenuList = () => {
        let auxArr = []
        if (!selectedKeys) return; // Evitar error si selectedKeys es null

        const selectedEntries = Object.entries(selectedKeys)
        selectedEntries.forEach((item) => {
            // Solo se agregan a la lista de "Menú de Inicio" los menús hoja (toList: true)
            if (item[1].toList) auxArr.push({ key: parseInt(item[0]), label: item[1].label })
        })

        // Se preserva el menú seleccionado si existe en la nueva lista de menús disponibles
        const newMainMenuSelected = auxArr.some(menu => menu.key === state.mainMenuSelected) ? state.mainMenuSelected : (auxArr.length > 0 ? auxArr[0].key : null);

        setState({ ...state, mainMenuList: auxArr, mainMenuSelected: newMainMenuSelected })
    }

    // Se mantiene
    useEffect(() => {
        if (selectedKeys) getMainMenuList()
    }, [selectedKeys])

    // Se mantiene
    useEffect(() => {
        if (state.confirmSave) saveUserMenus()
    }, [state.confirmSave])

    // Se modificó para usar la nueva función asíncrona y local
    useEffect(() => {
        if (props.assignMenu === true) {
            fetchAndSetupData();
        } else {
            // Limpiar estado cuando se cierra
            setOpenDialog(false);
            setState({ ...state, showConfirmDialog: false, confirmSave: false, updateUsers: false, usersList: [], mainMenuSelected: null });
            setSelectedKeys(null);
            setAllMenus(null);
            setAssignedMenus(null);
        }
    }, [props.assignMenu]);

    return (
        <Transition appear show={openDialog} as={Fragment}>
            {/* Cambié la función onClose para limpiar el estado del diálogo de confirmación también */}
            <Dialog as="div" className="relative z-10 " onClose={() => {
                setOpenDialog(false);
                props.assignMenuHandler(false);
            }}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full  items-center justify-center p-4 text-center">
                        {/* <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        > */}
                        <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 bg-white">
                                Asignar menus al rol: **{props.rol.roles_descripcion}**
                            </DialogTitle>

                            <div className=" mt-4 flex flex-col justify-content-center gap-4 blue-scroll">
                                {/* <SelectComp
                                    data={"label"}
                                    value={state.mainMenuSelected || ''}
                                    onChangeFunc={(e) => setState({ ...state, mainMenuSelected: e })}
                                    valueKey={"key"}
                                    options={state.mainMenuList}
                                    // disabled={state.mainMenuList.length === 0}
                                    virtual={true}
                                    label={'Selecciona el menu de inicio para este rol'}
                                /> */}
                                {/* Componente Tree de PrimeReact */}
                                <Tree
                                    value={allMenus}
                                    selectionMode="checkbox"
                                    selectionKeys={selectedKeys}
                                    filter
                                    filterMode="lenient"
                                    filterPlaceholder="Buscar"
                                    pt={{
                                        // 1. Contenedor principal de los nodos (p-tree-container)
                                        container: {
                                            style: { backgroundColor: 'white !important' }
                                        },

                                        // 2. Cada nodo de la lista (p-treenode)
                                        node: ({ context }) => ({
                                            className: context.parent && context.parent.level === 0 ? 'p-0' : '',
                                            style: {
                                                paddingLeft: '0',
                                                margin: '0',
                                                width: '100%',
                                                backgroundColor: 'white !important' // FORZANDO el color blanco
                                            }
                                        }),

                                        // 3. Contenedor raíz (p-tree)
                                        root: {
                                            className: 'w-full p-0',
                                            style: {
                                                backgroundColor: 'white !important' // FORZANDO el color blanco
                                            }
                                        },

                                        // 4. Contenido del nodo (p-treenode-content) - como respaldo
                                        content: {
                                            style: {
                                                backgroundColor: 'white !important'
                                            }
                                        },
                                    }}
                                    onSelectionChange={(e) => {
                                        handleOnChangeCheck(e.value)
                                    }}
                                />
                                {/* Diálogo de Confirmación (Headless UI) */}
                                <Transition appear show={state.showConfirmDialog} as={Fragment}>
                                        <Dialog as="div" className="relative z-20 w-full" onClose={() => setState({ ...state, showConfirmDialog: false, confirmSave: false, updateUsers: false, usersList: [] })}>
                                           

                                            <div className="fixed inset-0 overflow-y-auto">
                                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                                    <TransitionChild
                                                        as={Fragment}
                                                        enter="ease-out duration-300"
                                                        enterFrom="opacity-0 scale-95"
                                                        enterTo="opacity-100 scale-100"
                                                        leave="ease-in duration-200"
                                                        leaveFrom="opacity-100 scale-100"
                                                        leaveTo="opacity-0 scale-95"
                                                    >
                                                        <DialogPanel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                            <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 bg-white">
                                                                Advertencia
                                                            </DialogTitle>
                                                            <div className='flex justify-center'>
                                                                <hr className='w-[95%] border-gray-300' />
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-500">
                                                                    Existen usuarios con este rol, ¿Deseas cambiar sus menús por los nuevos?
                                                                </p>
                                                            </div>
                                                            <div className="mt-4 flex justify-end space-x-2">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                                                    onClick={() => setState({ ...state, showConfirmDialog: false, confirmSave: false, updateUsers: false, usersList: [] })}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                                                    onClick={() => setState({ ...state, confirmSave: true })}
                                                                >
                                                                    Solo guardar
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                                                    onClick={() => setState({ ...state, confirmSave: true, updateUsers: true })}
                                                                >
                                                                    Guardar y cambiar
                                                                </button>
                                                            </div>
                                                        </DialogPanel>
                                                    </TransitionChild>
                                                </div>
                                            </div>
                                        </Dialog>
                                    </Transition>
                            </div>

                            <div className="mt-6 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                    onClick={() => {
                                        setOpenDialog(false);
                                        props.assignMenuHandler(false);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                    onClick={saveUserMenus}
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </DialogPanel>
                        {/* </TransitionChild> */}
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}