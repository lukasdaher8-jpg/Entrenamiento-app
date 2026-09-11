Add-Type -AssemblyName System.Drawing

function New-Icon($path, $size, $padding, $bg, $fg) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.Clear($bg)

    $barW = [int]($size * 0.14)
    $plateR = [int]($size * 0.16)
    $cy = [int]($size / 2)
    $barX0 = $padding
    $barX1 = $size - $padding
    $barY0 = $cy - [int]($barW / 2)

    $barBrush = New-Object System.Drawing.SolidBrush($fg)
    $g.FillRectangle($barBrush, $barX0, $barY0, $barX1 - $barX0, $barW)

    $plateW = [int]($size * 0.12)
    $plateH = [int]($size * 0.42)
    $g.FillRectangle($barBrush, $barX0 - [int]($plateW*0.15), $cy - [int]($plateH/2), $plateW, $plateH)
    $g.FillRectangle($barBrush, $barX1 - $plateW + [int]($plateW*0.15), $cy - [int]($plateH/2), $plateW, $plateH)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$dir = "C:\Users\PC\Documents\Vida Personal\Entrenamiento\icons"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$bg = [System.Drawing.Color]::FromArgb(255, 0x0b, 0x0a, 0x0c)
$fg = [System.Drawing.Color]::FromArgb(255, 0xa9, 0x1e, 0x2c)

New-Icon "$dir\icon-192.png" 192 30 $bg $fg
New-Icon "$dir\icon-512.png" 512 80 $bg $fg
New-Icon "$dir\icon-maskable-512.png" 512 130 $bg $fg

Write-Host "Iconos generados en $dir"
