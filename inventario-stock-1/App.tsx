import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PackagePlus,
  ArrowLeftRight,
  Boxes,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

import { AppView, User } from "./types";
import Dashboard from "./components/Dashboard";
import InventoryList from "./components/InventoryList";
import InventoryMovement from "./components/InventoryMovement";
import MovementsHistory from "./components/MovementsHistory";
import Login from "./components/Login";
import UserManagement from "./components/UserManagement";
import { db } from "./services/db";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /** 📄 INVENTARIO DESDE GOOGLE SHEET */
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /** 🔄 CARGA INICIAL */
  const cargarInventario = () => {
    db.getProducts()
      .then((data) => {
        console.log("Inventario cargado:", data);
        setSheetData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error DB:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, view: AppView.DASHBOARD, roles: ["ADMIN", "USER"] },
    { name: "Gestión Stock", icon: PackagePlus, view: AppView.PRODUCTOS, roles: ["ADMIN", "USER"] },
    { name: "Inventario Total", icon: Boxes, view: AppView.INVENTARIO, roles: ["ADMIN", "USER"] },
    { name: "Historial / Reportes", icon: ArrowLeftRight, view: AppView.MOVIMIENTOS, roles: ["ADMIN", "USER"] },
    { name: "Control Usuarios", icon: Settings, view: AppView.CONFIGURACION, roles: ["ADMIN"] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => currentUser && item.roles.includes(currentUser.role)
  );

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView(AppView.DASHBOARD);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* SIDEBAR */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-[#004a99] text-white transition-transform duration-300`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-[10px] font-bold uppercase tracking-widest">
              Sistema de Gestión
            </h1>
          </div>

          <nav className="flex-1 py-4">
            {filteredNavigation.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setActiveView(item.view as AppView);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm ${
                  activeView === item.view ? "bg-white/10" : ""
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setCurrentUser(null)}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm opacity-70 hover:opacity-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2"
          >
            <Menu />
          </button>
          <span className="font-black text-[#F57C00] uppercase">
            Secretaría de Trabajo
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            {loading && <p>Cargando inventario…</p>}

            {!loading && activeView === AppView.DASHBOARD && <Dashboard />}
            {!loading && activeView === AppView.PRODUCTOS && (
              <InventoryMovement />
            )}
            {!loading && activeView === AppView.MOVIMIENTOS && (
              <MovementsHistory currentUser={currentUser} />
            )}
            {!loading && activeView === AppView.INVENTARIO && (
              <InventoryList currentUser={currentUser} />
            )}
            {!loading && activeView === AppView.CONFIGURACION && (
              <UserManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
