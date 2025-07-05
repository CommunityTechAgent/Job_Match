#!/bin/bash

# Version management script for JobMatch
# Usage: ./scripts/version.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Update version in package.json
update_version() {
    local new_version=$1
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$new_version';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# Create git tag
create_tag() {
    local version=$1
    local message=$2
    git tag -a "v$version" -m "$message"
    print_status "Created git tag v$version"
}

# Push changes to remote
push_changes() {
    local version=$1
    git add package.json
    git commit -m "chore: bump version to $version"
    git push origin master
    git push origin "v$version"
    print_status "Pushed version $version to remote repository"
}

# Main version bump logic
bump_version() {
    local bump_type=$1
    local current_version=$(get_current_version)
    
    print_header "Version Management"
    print_status "Current version: $current_version"
    
    # Parse current version
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    local new_version=""
    local commit_message=""
    
    case $bump_type in
        "patch")
            new_version="$major.$minor.$((patch + 1))"
            commit_message="fix: patch release $new_version"
            ;;
        "minor")
            new_version="$major.$((minor + 1)).0"
            commit_message="feat: minor release $new_version"
            ;;
        "major")
            new_version="$((major + 1)).0.0"
            commit_message="feat: major release $new_version"
            ;;
        *)
            print_error "Invalid bump type. Use: patch, minor, or major"
            exit 1
            ;;
    esac
    
    print_status "Bumping version to: $new_version"
    
    # Update package.json
    update_version "$new_version"
    print_status "Updated package.json"
    
    # Create git tag
    create_tag "$new_version" "$commit_message"
    
    # Push changes
    push_changes "$new_version"
    
    print_header "Version $new_version Successfully Released!"
    print_status "Changes committed and pushed to remote repository"
    print_status "Tag v$new_version created and pushed"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "git is not installed or not in PATH"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them before versioning."
    git status --short
    exit 1
fi

# Main execution
if [ $# -eq 0 ]; then
    print_error "Please specify version bump type: patch, minor, or major"
    echo "Usage: $0 [patch|minor|major]"
    echo ""
    echo "Examples:"
    echo "  $0 patch    # 2.0.0 -> 2.0.1"
    echo "  $0 minor    # 2.0.0 -> 2.1.0"
    echo "  $0 major    # 2.0.0 -> 3.0.0"
    exit 1
fi

bump_version "$1"
