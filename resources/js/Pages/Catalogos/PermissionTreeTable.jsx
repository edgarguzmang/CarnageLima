// PermissionTreeTable.jsx
import React, { useState, useEffect, useRef } from 'react';

// --- 1. DATA DE MENÚ INICIAL (para demostración) ---
const defaultMenuData = [
  {
    key: 8,
    label: "Administración",
    children: [
      { key: 1002, label: "Menus", permissions: { P1: true, P2: false, P3: true, P4: false } },
      { key: 1003, label: "Roles", permissions: { P1: true, P2: false, P3: false, P4: true } },
      { key: 1, label: "Usuarios", permissions: { P1: true, P2: false, P3: true, P4: false } },
    ],
  },
  { 
    key: 7, 
    label: "Almacén y servicio", 
    children: [], 
    permissions: { P1: false, P2: false, P3: false, P4: false } 
  },
  {
    key: 2,
    label: "Catálogos",
    children: [
      { key: 1006, label: "Departamentos", permissions: { P1: false, P2: false, P3: false, P4: false } },
      { key: 10, label: "Destinos", permissions: { P1: false, P2: false, P3: false, P4: false } },
    ],
  },
];

// Nombres de las columnas de permisos
const PERMISSIONS = ['P1', 'P2', 'P3', 'P4'];

// --- FUNCIONES AUXILIARES DE PROPAGACIÓN ---

/**
 * Asegura que todos los nodos tengan una propiedad 'permissions' inicializada.
 * Y calcula el estado inicial de los permisos del padre basado en sus hijos.
 */
const initializeNodePermissions = (nodes) => {
  return nodes.map(node => {
    const defaultPermissions = { P1: false, P2: false, P3: false, P4: false };
    
    // Inicializa o copia el nodo
    const newNode = {
      ...node,
      permissions: node.permissions || defaultPermissions, 
    };

    // Recursión para los hijos
    if (node.children) {
      newNode.children = initializeNodePermissions(node.children);
    }
    
    // Después de inicializar hijos, sincroniza el estado del padre
    // Si es un nodo padre, calculamos su estado basado en los hijos.
    if (newNode.children && newNode.children.length > 0) {
      PERMISSIONS.forEach(permKey => {
        newNode.permissions[permKey] = checkParentStatus(newNode, permKey);
      });
    }
    
    return newNode;
  });
};

/**
 * Determina el estado de un permiso en un nodo padre (true, false o 'indeterminate').
 * 'indeterminate' se usa para el checkbox, y se almacena como true o false en el estado.
 */
const checkParentStatus = (parentNode, permKey) => {
    if (!parentNode.children || parentNode.children.length === 0) {
        return parentNode.permissions[permKey]; // No es un padre con hijos, usa su propio valor
    }

    const totalChildren = parentNode.children.length;
    const checkedChildren = parentNode.children.filter(
        child => child.permissions[permKey] === true
    ).length;

    if (checkedChildren === 0) {
        return false;
    }
    if (checkedChildren === totalChildren) {
        return true;
    }
    // Si está parcialmente marcado, forzamos a 'true' en el estado 
    // para simplificar la interfaz, y usamos 'indeterminate' en el render.
    return 'indeterminate'; 
};

/**
 * Propaga el cambio de un permiso hacia abajo (padre -> hijos).
 */
const propagateDown = (nodes, permKey, newValue) => {
    return nodes.map(node => {
        const newPermissions = { ...node.permissions, [permKey]: newValue };

        let newNode = { ...node, permissions: newPermissions };

        if (node.children && node.children.length > 0) {
            // Propagar recursivamente a los hijos
            newNode.children = propagateDown(node.children, permKey, newValue);
        }
        return newNode;
    });
};


// --- 2. COMPONENTE RECURSIVO INTERNO (TreeNode) ---

/**
 * Componente funcional recursivo para renderizar cada fila (nodo) del árbol.
 */
const TreeNode = ({ node, level = 0, onPermissionChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Referencia para el estado 'indeterminate' del checkbox
  const checkboxRefs = useRef({}); 

  // Sincroniza el estado 'indeterminate' del DOM
  useEffect(() => {
    PERMISSIONS.forEach(permKey => {
        const checkbox = checkboxRefs.current[permKey];
        if (checkbox) {
            // Un padre se considera 'indeterminate' si el valor es 'indeterminate'
            checkbox.indeterminate = node.permissions[permKey] === 'indeterminate';
        }
    });
  }, [node.permissions]); // Se ejecuta cada vez que cambian los permisos del nodo
  
  const indentStyle = { paddingLeft: `${level * 20}px` };
  const hasChildren = node.children && node.children.length > 0;
  
  // Handler para el cambio de un permiso específico
  const handlePermissionChange = (permKey) => {
    // Si el valor actual es 'indeterminate' o false, el nuevo valor es true.
    // Si el valor actual es true, el nuevo valor es false.
    const newValue = node.permissions[permKey] === true ? false : true;
    onPermissionChange(node.key, permKey, newValue, hasChildren);
  };
  
  return (
    <>
      {/* 1. Fila del nodo actual */}
      <tr style={{ borderBottom: '1px dotted #eee', backgroundColor: level === 0 ? '#fcfcfc' : 'white' }}>
        <td style={{ ...indentStyle, fontWeight: level === 0 ? 'bold' : 'normal' }}>
          {hasChildren && (
            <span 
              onClick={() => setIsExpanded(!isExpanded)} 
              style={{ cursor: 'pointer', marginRight: '5px' }}
            >
              {isExpanded ? '▼' : '►'}
            </span>
          )}
          {node.label}
        </td>
        
        {/* 2. Celdas de permisos */}
        {PERMISSIONS.map(perm => (
          <td key={perm} style={{ textAlign: 'center' }}>
            {node.permissions && (
              <input
                type="checkbox"
                // Referencia para el estado 'indeterminate'
                ref={el => checkboxRefs.current[perm] = el}
                // El checkbox está 'checked' si el valor es true o 'indeterminate'
                checked={node.permissions[perm] === true || node.permissions[perm] === 'indeterminate'}
                onChange={() => handlePermissionChange(perm)}
              />
            )}
          </td>
        ))}
      </tr>

      {/* 3. Renderizar los hijos (recursividad) si está expandido */}
      {isExpanded && hasChildren && node.children.map(child => (
        <TreeNode
          key={child.key}
          node={child}
          level={level + 1}
          onPermissionChange={onPermissionChange}
        />
      ))}
    </>
  );
};

// --- 3. COMPONENTE PRINCIPAL (PermissionTreeTable) ---

const PermissionTreeTable = ({ initialData = defaultMenuData }) => {

  // console.log("Initial Data:", initialData);
  
  // Inicializamos el estado con la data de la prop o la data por defecto
  const [data, setData] = useState(() => initializeNodePermissions(initialData));

  /**
   * Función recursiva que busca y actualiza el permiso en el estado del árbol de datos.
   * Y propaga los cambios.
   */
  const handlePermissionChange = (nodeKey, permKey, newValue, isParent) => {
    
    // 1. Clonar el árbol y actualizar el nodo objetivo.
    const updateNodesAndPropagate = (nodes) => {
      return nodes.map(node => {
        // Clonar el nodo
        let newNode = { ...node };

        // 1a. Si encontramos el nodo objetivo, lo actualizamos.
        if (node.key === nodeKey) {
          
          // Si es un padre, propagar el cambio a todos sus hijos
          if (isParent && node.children) {
            newNode.children = propagateDown(node.children, permKey, newValue);
          }
          
          // Actualizar el permiso del nodo objetivo.
          newNode.permissions = { ...node.permissions, [permKey]: newValue };

        } 
        
        // 1b. Si tiene hijos, recursión
        else if (node.children) {
          newNode.children = updateNodesAndPropagate(node.children);
        }
        
        // 2. Después de la recursión, sincronizar el estado del padre hacia arriba
        if (newNode.children && newNode.children.length > 0) {
          newNode.permissions[permKey] = checkParentStatus(newNode, permKey);
        }

        return newNode;
      });
    };
    
    setData(updateNodesAndPropagate(data));
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Gestión de Permisos (Con Sincronización)</h2>
      <p>Click en el '►' para expandir/colapsar. Al cambiar un permiso de un padre, se propaga a los hijos. Un padre puede tener un estado intermedio.</p>
      
      <table style={{ borderCollapse: 'collapse', width: '700px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#e0e0e0' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Módulo/Opción</th>
            {PERMISSIONS.map(p => (
              <th key={p} style={{ width: '10%' }}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Mapea los nodos raíz para iniciar la recursividad */}
          {data.map(node => (
            <TreeNode 
              key={node.key} 
              node={node} 
              onPermissionChange={handlePermissionChange} 
            />
          ))}
        </tbody>
      </table>
      
      <hr style={{ margin: '20px 0' }}/>
      
      <h3>💾 Permisos Actuales (JSON del Estado):</h3>
      <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ddd', maxHeight: '300px', overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default PermissionTreeTable;