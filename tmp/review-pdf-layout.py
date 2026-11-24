import sys
from pathlib import Path
sys.path.insert(0,str(Path('tmp/pdf-deps').resolve()))
import pymupdf
for path in list(Path('output/pdf').glob('comprovativo-*.pdf'))+list(Path('tmp/pdfs').glob('comprovativo-carro*-longo.pdf')):
    doc=pymupdf.open(path)
    for i,page in enumerate(doc):
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                for span in line['spans']:
                    x0,y0,x1,y1=span['bbox']
                    assert x0>=18 and x1<=580 and y0>=8 and y1<836,(path,i,span)
        page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2)).save('tmp/pdfs/'+path.stem+'-'+str(i+1)+'.png')
    print(path, 'pages:',len(doc),'links:',sum(len(p.get_links()) for p in doc))
