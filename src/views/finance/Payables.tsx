'use client';

import React from 'react';
import { Subledger } from './Subledger';
import { payablesStore } from '../../data/subledgers';
import { ROUTE_META } from '../../data/navigation';

/** Accounts Payable — supplier bills owed by the organisation. */
export function Payables() {
  return (
    <Subledger
      store={payablesStore}
      title="Accounts payable"
      trail={ROUTE_META['/finance/payables']?.trail ?? ['Finance', 'Sub-ledgers', 'Accounts payable']}
      partyLabel="Vendor"
      docLabel="bill"
      refPrefix="BILL"
    />
  );
}
