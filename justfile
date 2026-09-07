default:
    just --list

@set-version version:
    just _set-version-files {{version}}
    git add .
    git commit -m "set version to {{version}}"
    echo "Version set to {{version}} and committed"

_set-version-files version:
    #!/usr/bin/env python3
    import json
    for path, keys in (('package.json', (('version',),)),
                       ('package-lock.json', (('version',), ('packages', '', 'version')))):
        with open(path) as f:
            doc = json.load(f)
        for key in keys:
            node = doc
            for step in key[:-1]:
                node = node[step]
            node[key[-1]] = '{{version}}'
        with open(path, 'w') as f:
            json.dump(doc, f, indent=2)
            f.write('\n')
