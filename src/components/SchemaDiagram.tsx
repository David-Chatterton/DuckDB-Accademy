import { ReactFlow, Background, Controls, useNodesState, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
const nodes: Node[] = [
  { id: 'accounts', position: { x: 0, y: 10 }, data: { label: 'accounts\nid · primary key\nname · account_type · currency' } },
  { id: 'payees', position: { x: 0, y: 160 }, data: { label: 'payees\nid · primary key\nname · default_category_id' } },
  { id: 'transactions', position: { x: 290, y: 70 }, data: { label: 'transactions\nid · primary key\ndate · account_id · payee_id\ncategory_id · payee · category\namount DECIMAL(12,2)\ndescription · transfer_id · duplicate_of' } },
  { id: 'categories', position: { x: 580, y: 100 }, data: { label: 'categories\nid · primary key\nname' } },
  { id: 'budgets', position: { x: 290, y: 310 }, data: { label: 'budgets\nid · primary key\nmonth · category_id\namount DECIMAL(12,2)' } },
];
const edges: Edge[] = [
  { id: 'a-t', source: 'accounts', target: 'transactions', label: 'account_id' },
  { id: 'p-t', source: 'payees', target: 'transactions', label: 'payee_id' },
  { id: 't-c', source: 'transactions', target: 'categories', label: 'category_id' },
  { id: 'b-c', source: 'budgets', target: 'categories', label: 'category_id' },
  { id: 'p-c', source: 'payees', target: 'categories', label: 'default_category_id' },
];
export function SchemaDiagram({ dark }: { dark: boolean }) {
  const [currentNodes, , onNodesChange] = useNodesState(nodes);
  return <div className="schema-panel"><h2>The training database</h2><p>A primary key uniquely identifies a row. Relationship fields refer to rows in other tables; you will explore joins in Module 3. Drag the tables or use the zoom controls.</p><div className="schema-canvas"><ReactFlow nodes={currentNodes} onNodesChange={onNodesChange} edges={edges} fitView colorMode={dark ? 'dark' : 'light'}><Background/><Controls/></ReactFlow></div><p>For Module 1, payee and category text are retained on each transaction so you can learn filtering before joins. A missing category is shown as NULL. Amounts are in GBP: negative is money leaving an account, positive is money entering it.</p></div>;
}
