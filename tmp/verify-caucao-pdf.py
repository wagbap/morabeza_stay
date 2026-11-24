import sys
from pathlib import Path
sys.path.insert(0,str(Path('tmp/pdf-deps').resolve()))
import pymupdf
short=pymupdf.open('output/pdf/comprovativo-carro-caucao.pdf')
long=pymupdf.open('tmp/pdfs/comprovativo-carro-caucao-longo.pdf')
text=' '.join(p.get_text() for p in short)
assert len(short)==1
assert '500 CVE' in text and '1.000' in text and 'Multibanco/Vinti4' in text and 'Cheque' in text
assert 'FIM-DAS-CONDICOES' in ''.join(p.get_text() for p in long)
for doc in [short,long]:
 for page in doc:
  for b in page.get_text('dict')['blocks']:
   for line in b.get('lines',[]):
    for s in line['spans']:
     x0,y0,x1,y1=s['bbox']; assert x0>=18 and x1<=580 and y0>=8 and y1<836
print('PDF: one-page layout, full long conditions and bounds verified')
