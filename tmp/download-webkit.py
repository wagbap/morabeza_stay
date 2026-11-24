from pathlib import Path
from urllib.request import urlretrieve
from zipfile import ZipFile
dest=Path('tmp/webkit-browsers/webkit-2370').resolve()
archive=Path('tmp/webkit-win64.zip')
urlretrieve('https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-win64.zip',archive)
with ZipFile(archive) as z:
    for name in z.namelist():
        target=(dest/name).resolve()
        if target!=dest and dest not in target.parents:raise ValueError('Invalid archive path')
    z.extractall(dest)
print('WebKit extracted:',dest)
