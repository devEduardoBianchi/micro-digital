from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for name in ('hero', 'repair'):
    source = Image.open(root / 'design' / f'{name}-source.png').convert('RGB')
    for width in (640, 1200, 1680):
        result = source.copy()
        result.thumbnail((width, width))
        result.save(root / 'assets' / f'{name}-{width}.webp', quality=82, method=6)
for name in ('catalog-notebook', 'catalog-desktop', 'catalog-monitor', 'catalog-printer'):
    source = Image.open(root / 'design' / f'{name}-source.png').convert('RGBA')
    source.thumbnail((640, 640))
    source.save(root / 'assets' / f'{name}.webp', quality=82, method=6)
logo = Image.open(root / 'assets' / 'logo-digital.png').convert('RGBA')
logo.thumbnail((720, 480))
logo.save(root / 'assets' / 'logo-digital.webp', quality=92, method=6)
print('Imagens WebP prontas.')
