# Version management script for JobMatch (PowerShell)
# Usage: .\scripts\version.ps1 [patch|minor|major]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("patch", "minor", "major")]
    [string]$BumpType
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "=== $Message ===" -ForegroundColor $Blue
}

# Get current version from package.json
function Get-CurrentVersion {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    return $packageJson.version
}

# Update version in package.json
function Update-Version {
    param([string]$NewVersion)
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $packageJson.version = $NewVersion
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
}

# Create git tag
function New-GitTag {
    param([string]$Version, [string]$Message)
    git tag -a "v$Version" -m $Message
    Write-Status "Created git tag v$Version"
}

# Push changes to remote
function Push-Changes {
    param([string]$Version)
    git add package.json
    git commit -m "chore: bump version to $Version"
    git push origin master
    git push origin "v$Version"
    Write-Status "Pushed version $Version to remote repository"
}

# Main version bump logic
function Bump-Version {
    param([string]$BumpType)
    
    $currentVersion = Get-CurrentVersion
    Write-Header "Version Management"
    Write-Status "Current version: $currentVersion"
    
    # Parse current version
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    $newVersion = ""
    $commitMessage = ""
    
    switch ($BumpType) {
        "patch" {
            $newVersion = "$major.$minor.$($patch + 1)"
            $commitMessage = "fix: patch release $newVersion"
        }
        "minor" {
            $newVersion = "$major.$($minor + 1).0"
            $commitMessage = "feat: minor release $newVersion"
        }
        "major" {
            $newVersion = "$($major + 1).0.0"
            $commitMessage = "feat: major release $newVersion"
        }
    }
    
    Write-Status "Bumping version to: $newVersion"
    
    # Update package.json
    Update-Version $newVersion
    Write-Status "Updated package.json"
    
    # Create git tag
    New-GitTag $newVersion $commitMessage
    
    # Push changes
    Push-Changes $newVersion
    
    Write-Header "Version $newVersion Successfully Released!"
    Write-Status "Changes committed and pushed to remote repository"
    Write-Status "Tag v$newVersion created and pushed"
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Error "git is not installed or not in PATH"
    exit 1
}

# Check if we have uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "You have uncommitted changes. Please commit or stash them before versioning."
    git status --short
    exit 1
}

# Main execution
Bump-Version $BumpType 