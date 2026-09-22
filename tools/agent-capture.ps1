param(
    [switch]$Once,
    [string]$WorkspaceStorage = "$env:APPDATA\Code\User\workspaceStorage"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$logRoot = Join-Path $repoRoot '.agent-logs'
$statePath = Join-Path $logRoot '.capture-state.json'
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

function Get-Value($object, [string[]]$names) {
    foreach ($name in $names) {
        $property = $object.PSObject.Properties[$name]
        if ($null -ne $property -and $property.Value -is [string] -and $property.Value.Trim()) {
            return $property.Value
        }
    }
    return $null
}

function Get-SessionLogPath($sessionId) {
    $date = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd_HH-mm-ss')
    return Join-Path $logRoot "${date}_${sessionId}.md"
}

function Write-Entry($sessionId, $requestId, $prompt, $response, $timestamp, $model) {
    if (-not $prompt -or -not $response) { return }
    $logPath = Get-SessionLogPath $sessionId
    if (-not (Test-Path $logPath)) {
        @(
            '---'
            "session_id: $sessionId"
            "date: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd'))"
            'author: unknown'
            "model: $model"
            'tool: github-copilot-vscode'
            'project: higgsfield-clone'
            'total_exchanges: 0'
            "first_prompt_time: $timestamp"
            "last_prompt_time: $timestamp"
            '---'
            ''
            "# Session Log - $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd'))"
            ''
        ) | Set-Content -Encoding utf8 $logPath
    }
    $entry = @(
        "[LOG_ENTRY type=PROMPT num=$requestId session=$sessionId]"
        "timestamp: $timestamp"
        "model: $model"
        ''
        $prompt
        ''
        "[LOG_ENTRY type=RESPONSE num=$requestId session=$sessionId]"
        "timestamp: $((Get-Date).ToUniversalTime().ToString('o'))"
        "model: $model"
        ''
        $response
        ''
    ) -join "`r`n"
    Add-Content -Encoding utf8 -Path $logPath -Value $entry
}

function Scan-Sessions {
    Get-ChildItem -Path $WorkspaceStorage -Filter '*.jsonl' -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match '\\chatSessions\\' } |
        ForEach-Object {
            try {
                $root = Get-Content $_.FullName -Raw | ConvertFrom-Json
                foreach ($request in @($root.v.requests)) {
                    $requestId = Get-Value $request @('requestId', 'id')
                    $prompt = Get-Value $request @('prompt', 'message', 'input', 'text')
                    $response = Get-Value $request @('response', 'answer', 'output')
                    $timestamp = if ($request.timestamp) { [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$request.timestamp).ToUniversalTime().ToString('o') } else { (Get-Date).ToUniversalTime().ToString('o') }
                    if ($requestId -and $prompt -and $response) {
                        $fingerprint = "$($_.FullName)|$requestId"
                        $state = if (Test-Path $statePath) { Get-Content $statePath -Raw | ConvertFrom-Json } else { @() }
                        if (@($state) -notcontains $fingerprint) {
                            Write-Entry $_.BaseName $requestId $prompt $response $timestamp 'Auto (claude-fable-5.1)'
                            @(@($state) + $fingerprint) | ConvertTo-Json | Set-Content -Encoding utf8 $statePath
                        }
                    }
                }
            } catch { }
        }
}

do {
    Scan-Sessions
    if (-not $Once) { Start-Sleep -Seconds 3 }
} while (-not $Once)