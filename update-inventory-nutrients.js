const fs = require('fs');
let content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

const importLines = `
import { InventoryStatsCards } from './inventory/InventoryStatsCards';
import { InventoryFilters } from './inventory/InventoryFilters';
import { InventoryTable } from './inventory/InventoryTable';
`;

content = content.replace("import { NutrientProduct } from '@/lib/types';", "import { NutrientProduct } from '@/lib/types';" + importLines);

const startCards = content.indexOf('{/* Low Stock and Out of Stock Alerts */}');
const endGrid = content.indexOf('</div>\n                )}', startCards) + 26; // match the end of the items list

if (startCards > -1 && endGrid > startCards) {
  const replacement = `
                <InventoryStatsCards outOfStockCount={outOfStockCount} lowStockCount={lowStockCount} />
                <InventoryFilters 
                  nutrientSearchQuery={nutrientSearchQuery}
                  setNutrientSearchQuery={setNutrientSearchQuery}
                  nutrientFilterStock={nutrientFilterStock}
                  setNutrientFilterStock={setNutrientFilterStock}
                  lowStockCount={lowStockCount}
                  outOfStockCount={outOfStockCount}
                  selectedCount={selectedNutrientIds.length}
                  onOpenPOModal={() => setIsPOModalOpen(true)}
                />
                <InventoryTable
                  nutrients={filteredNutrients}
                  selectedNutrientIds={selectedNutrientIds}
                  setSelectedNutrientIds={setSelectedNutrientIds}
                  handleDeleteNutrient={handleDeleteNutrient}
                  editingNutrientId={editingNutrientId}
                  setEditingNutrientId={setEditingNutrientId}
                  editingPriceValue={editingPriceValue}
                  setEditingPriceValue={setEditingPriceValue}
                  handleSavePriceUpdate={handleSavePriceUpdate}
                  handleStartEditingPrice={handleStartEditingPrice}
                  handleOpenSaleModal={handleOpenSaleModal}
                />
`;

  const newContent = content.slice(0, startCards) + replacement + content.slice(endGrid);
  fs.writeFileSync('components/dashboard/InventoryView.tsx', newContent);
  console.log("Successfully replaced nutrients view.");
} else {
  console.log("Could not find boundaries.");
  console.log(startCards, endGrid);
}
