import { useState } from 'react';
import { BatchForm } from './BatchForm.js';
import { PaymentForm } from './PaymentForm.js';
import { QuoteForm } from './QuoteForm.js';
import { ReadingForm } from './ReadingForm.js';

const workflows = [
  { id: 'reading', label: 'Reading', kicker: 'Single reading', title: 'Submit meter usage' },
  { id: 'batch', label: 'Batch', kicker: 'Batch readings', title: 'Submit readings together' },
  { id: 'quote', label: 'Quote', kicker: 'Tariff quote', title: 'Calculate an energy charge' },
  { id: 'payment', label: 'Payment', kicker: 'Payment', title: 'Test an idempotent payment' },
] as const;

type WorkflowId = typeof workflows[number]['id'];

export function App() {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId>('reading');
  const workflow = workflows.find((item) => item.id === activeWorkflow) ?? workflows[0];

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Meter Platform home">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>Meter Platform</span>
        </a>
        <span className="environment">Local API</span>
      </header>

      <main id="top" className="workspace">
        <div className="workspace-heading">
          <p className="eyebrow">API workbench</p>
          <h1>Work directly with the local meter API.</h1>
          <p>Submit synthetic readings, calculate a tariff quote and test payment behaviour.</p>
        </div>

        <div className="workflow-tabs" role="tablist" aria-label="Meter workflows">
          {workflows.map((item, index) => (
            <button
              className={item.id === activeWorkflow ? 'tab is-active' : 'tab'}
              type="button"
              role="tab"
              aria-selected={item.id === activeWorkflow}
              aria-controls="workflow-panel"
              onClick={() => setActiveWorkflow(item.id)}
              key={item.id}
            >
              <span className="tab-number">0{index + 1}</span>
              {item.label}
            </button>
          ))}
        </div>

        <section id="workflow-panel" className="work-area" role="tabpanel" aria-labelledby="work-area-title">
          <div className="operation">
            <p className="section-kicker">{workflow.kicker}</p>
            <h2 id="work-area-title">{workflow.title}</h2>
            {activeWorkflow === 'reading' && <ReadingForm />}
            {activeWorkflow === 'batch' && <BatchForm />}
            {activeWorkflow === 'quote' && <QuoteForm />}
            {activeWorkflow === 'payment' && <PaymentForm />}
          </div>
          <div className="status-panel" role="status">
            <span className="status-light" aria-hidden="true" />
            API ready at 127.0.0.1:3000
          </div>
        </section>
      </main>
    </div>
  );
}