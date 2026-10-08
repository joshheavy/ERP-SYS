'use client';

import React from 'react';
import { Subledger } from './Subledger';
import { receivablesStore } from '../../data/subledgers';
import { ROUTE_META } from '../../data/navigation';

/** Accounts Receivable — customer invoices owed to the organisation. */
export function Receivables() {
  return (
    <Subledger
      store={receivablesStore}
      title="Accounts receivable"
      trail={ROUTE_META['/finance/receivables']?.trail ?? ['Finance', 'Sub-ledgers', 'Accounts receivable']}
      partyLabel="Customer"
      docLabel="invoice"
      refPrefix="INV"
    />
  );
}
