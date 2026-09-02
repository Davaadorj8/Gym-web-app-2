const fs = require('fs');

const tabPath = 'components/dashboard/inventory/SuppliersAndPOTab.tsx';
let content = fs.readFileSync(tabPath, 'utf8');

// Add Layers icon
content = content.replace("Package, Clock, ChevronDown", "Package, Clock, ChevronDown, Layers");

// Fix newSupplierForm structure
content = content.replace(
  "  const [newSupplierForm, setNewSupplierForm] = useState({\n    name: '',\n    contactPerson: '',\n    phone: '',\n    address: '',\n    email: '',\n  });",
  "  const [newSupplierForm, setNewSupplierForm] = useState({\n    name: '',\n    phone: '',\n    contactEmail: '',\n    leadTimeDays: 7,\n  });"
);

// Fix handler
content = content.replace(
  "  const handleRegisterSupplier = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!newSupplierForm.name.trim() || !newSupplierForm.phone.trim()) return;\n\n    dashboard.addSupplier({\n      name: newSupplierForm.name,\n      contactPerson: newSupplierForm.contactPerson || undefined,\n      phone: newSupplierForm.phone,\n      address: newSupplierForm.address || undefined,\n      email: newSupplierForm.email || undefined,\n    });\n    \n    showToast('New nutrient supplier registered.');\n    setNewSupplierForm({ name: '', contactPerson: '', phone: '', address: '', email: '' });\n  };",
  "  const handleAddSupplier = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!newSupplierForm.name.trim() || !newSupplierForm.phone.trim()) return;\n\n    const uniqueId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : Date.now().toString();\n    dashboard.addSupplier({\n      id: `supp-${uniqueId}`,\n      name: newSupplierForm.name,\n      phone: newSupplierForm.phone,\n      contactEmail: newSupplierForm.contactEmail,\n      leadTimeDays: newSupplierForm.leadTimeDays,\n    });\n    \n    showToast('New nutrient supplier registered.');\n    setNewSupplierForm({ name: '', phone: '', contactEmail: '', leadTimeDays: 7 });\n  };"
);

fs.writeFileSync(tabPath, content);
