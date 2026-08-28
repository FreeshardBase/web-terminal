default:
    just --list

@set-version version:
    just _set-version-files {{version}}
    npm install --package-lock-only
    git add package.json package-lock.json
    git commit -m "set version to {{version}}"
    echo "Version set to {{version}} and committed"

_set-version-files version:
    #!/usr/bin/env python3
    import json
    with open('package.json') as f:
        pkg = json.load(f)
    pkg['version'] = '{{version}}'
    with open('package.json', 'w') as f:
        json.dump(pkg, f, indent=2)
        f.write('\n')
