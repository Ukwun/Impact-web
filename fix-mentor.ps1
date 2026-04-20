$filePath = 'c:\DEV3\ImpactEdu\impactapp-web\src\components\dashboard\MentorDashboard.tsx'
$content = Get-Content -Raw $filePath

# Find the first export default function
$firstIndex = $content.IndexOf('export default function MentorDashboard() {')
$secondIndex = $content.IndexOf('export default function MentorDashboard() {', $firstIndex + 1)

if ($secondIndex -gt 0) {
    # Keep only the first function - find its closing brace
    $beforeSecond = $content.Substring(0, $secondIndex)
    # Remove the extra newlines and closing brace before the duplicate
    $trimmed = $beforeSecond.TrimEnd()
    if ($trimmed.EndsWith('};')) {
        $trimmed = $trimmed.Substring(0, $trimmed.Length - 2) + '}'
    } elseif (!$trimmed.EndsWith('}')) {
        $trimmed = $trimmed + '}'
    }
    
    Set-Content -Path $filePath -Value $trimmed
    Write-Host 'File fixed: removed duplicate function'
} else {
    Write-Host 'No duplicate found'
}
