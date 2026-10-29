import { useState } from 'react';

export default function usePaginacao(items, filterKey, initialSize = 10) {
  const [selection, setSelection] = useState({ key: filterKey, page: 1, size: initialSize });
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / selection.size));
  if (selection.key !== filterKey || selection.page > pages) {
    setSelection({ ...selection, key: filterKey, page: selection.key !== filterKey ? 1 : pages });
  }
  const page = selection.key === filterKey ? Math.min(selection.page, pages) : 1;
  const start = (page - 1) * selection.size;
  return {
    items: items.slice(start, start + selection.size), total, page, pages, size: selection.size,
    first: total ? start + 1 : 0, last: Math.min(start + selection.size, total),
    onPage: value => setSelection({ key: filterKey, page: Math.max(1, Math.min(value, pages)), size: selection.size }),
    onSize: value => setSelection({ key: filterKey, page: 1, size: [10, 20, 50].includes(Number(value)) ? Number(value) : initialSize }),
  };
}
