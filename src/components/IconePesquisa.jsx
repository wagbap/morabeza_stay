import { createElement } from 'react';

export default function IconePesquisa({ icon, size = 24 }) {
  return <span aria-hidden="true" className="inline-flex shrink-0 text-blue-600">{createElement(icon, { size, strokeWidth: 1.8 })}</span>;
}
