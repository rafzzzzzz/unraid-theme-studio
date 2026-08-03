param([int]$Port = 8765)

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Output "Theme Studio preview: http://127.0.0.1:$Port/preview/"

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.page' = 'text/plain; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.json' = 'application/json'
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()
    if ([string]::IsNullOrWhiteSpace($requestLine)) {
      $client.Close()
      continue
    }
    while ($reader.ReadLine()) { }
    $requestPath = if ($requestLine -match '^GET\s+([^\s]+)') { $Matches[1].Split('?')[0] } else { '/' }
    $relative = [Uri]::UnescapeDataString($requestPath.TrimStart('/'))
    if (!$relative -or $relative.EndsWith('/')) { $relative += 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (!$path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or !(Test-Path -LiteralPath $path -PathType Leaf)) {
      $status = '404 Not Found'
      $contentType = 'text/plain; charset=utf-8'
      $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
    } else {
      $status = '200 OK'
      $extension = [IO.Path]::GetExtension($path).ToLowerInvariant()
      $contentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($path)
    }
    $headers = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n")
    $stream.Write($headers, 0, $headers.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
    $client.Close()
  }
} finally {
  $listener.Stop()
}
