import { create } from 'zustand'

const useStore = create((set) => ({
    userMenus: null,
    selectedMenu: "",
    loggedUser: null,
    searchMenuTerm: "",
    filteredMenus: [],
    showMenu: true,

    // Actions
    setUserMenus: (menus) => set({ userMenus: menus }),
    setSelectedMenu: (menu) => set({ selectedMenu: menu }),
    setLoggedUser: (user) => set({ loggedUser: user }),
    setSearchMenuTerm: (term) => set({ searchMenuTerm: term }),
    setFilteredMenus: (menus) => set({ filteredMenus: menus }),
    setShowMenu: (show) => set({ showMenu: !show }),
}))

export default useStore