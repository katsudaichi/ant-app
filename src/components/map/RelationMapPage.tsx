@@ .. @@
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [editingActor, setEditingActor] = useState<Actor | null>(null);
   const navigate = useNavigate();
+
+  React.useEffect(() => {
+    const handleOpenSidebar = () => {
+      setIsSidebarOpen(true);
+    };
+
+    window.addEventListener('openSidebar', handleOpenSidebar);
+    return () => {
+      window.removeEventListener('openSidebar', handleOpenSidebar);
+    };
+  }, []);

   const scale = useMapStore((state) => state.scale);
   const position = useMapStore((state) => state.viewportPosition);