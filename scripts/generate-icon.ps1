param(
  [string]$Output = (Join-Path $PSScriptRoot '..\source\theme.studio\usr\local\emhttp\plugins\theme.studio\images\theme.studio.png')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$size = 256
$bitmap = [Drawing.Bitmap]::new($size, $size, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([Drawing.Color]::Transparent)

$rect = [Drawing.RectangleF]::new(8, 8, 240, 240)
$path = [Drawing.Drawing2D.GraphicsPath]::new()
$radius = 54
$path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
$path.AddArc($rect.Right-$radius, $rect.Y, $radius, $radius, 270, 90)
$path.AddArc($rect.Right-$radius, $rect.Bottom-$radius, $radius, $radius, 0, 90)
$path.AddArc($rect.X, $rect.Bottom-$radius, $radius, $radius, 90, 90)
$path.CloseFigure()

$background = [Drawing.Drawing2D.LinearGradientBrush]::new($rect, [Drawing.Color]::FromArgb(255, 28, 27, 31), [Drawing.Color]::FromArgb(255, 12, 12, 14), 135)
$graphics.FillPath($background, $path)

$palettePath = [Drawing.Drawing2D.GraphicsPath]::new()
$palettePath.AddBezier(42, 74, 67, 31, 164, 31, 205, 70)
$palettePath.AddBezier(205, 70, 235, 101, 205, 144, 154, 146)
$palettePath.AddLine(127, 146, 127, 166)
$palettePath.AddBezier(127, 166, 127, 185, 94, 185, 94, 157)
$palettePath.AddBezier(94, 157, 94, 141, 78, 136, 64, 129)
$palettePath.AddBezier(64, 129, 38, 116, 29, 94, 42, 74)
$palettePath.CloseFigure()
$paletteBrush = [Drawing.Drawing2D.LinearGradientBrush]::new([Drawing.RectangleF]::new(30, 34, 190, 150), [Drawing.Color]::FromArgb(255, 226, 40, 40), [Drawing.Color]::FromArgb(255, 255, 157, 69), 25)
$graphics.FillPath($paletteBrush, $palettePath)

$colors = @(
  [Drawing.Color]::FromArgb(255,255,211,36),
  [Drawing.Color]::White,
  [Drawing.Color]::FromArgb(255,51,204,51),
  [Drawing.Color]::FromArgb(255,90,169,255)
)
$points = @(@(77,91),@(111,69),@(151,73),@(178,104))
for ($index=0; $index -lt $colors.Count; $index++) {
  $brush = [Drawing.SolidBrush]::new($colors[$index])
  $graphics.FillEllipse($brush, $points[$index][0]-11, $points[$index][1]-11, 22, 22)
  $brush.Dispose()
}

$brushPen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(255,242,242,242), 19)
$brushPen.StartCap = [Drawing.Drawing2D.LineCap]::Round
$brushPen.EndCap = [Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($brushPen, 137, 150, 205, 218)
$ferruleBrush = [Drawing.SolidBrush]::new([Drawing.Color]::White)
$graphics.FillPolygon($ferruleBrush, @([Drawing.Point]::new(125,145),[Drawing.Point]::new(145,125),[Drawing.Point]::new(165,145),[Drawing.Point]::new(145,165)))

$directory = Split-Path -Parent $Output
New-Item -ItemType Directory -Force -Path $directory | Out-Null
$bitmap.Save($Output, [Drawing.Imaging.ImageFormat]::Png)

$ferruleBrush.Dispose()
$brushPen.Dispose()
$paletteBrush.Dispose()
$palettePath.Dispose()
$background.Dispose()
$path.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "Generated $Output"
