Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile((Resolve-Path 'tmp\logo-favicon-source.png'))
foreach ($size in @(512,180,48,32,16)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, [int]($size * 0.2), $size, [int]($size * 0.6)), [System.Drawing.Rectangle]::new(0, 0, 315, 189), [System.Drawing.GraphicsUnit]::Pixel)
  $target = if ($size -eq 512) { 'public\favicons\favicon-512.png' } elseif ($size -eq 180) { 'public\favicons\apple-touch-icon.png' } else { "tmp\favicon-$size.png" }
  $bitmap.Save((Join-Path (Get-Location) $target), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose()
}
$source.Dispose()
